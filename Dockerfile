# ---- Etapa 1: dependencias -------------------------------------------------
# Instalar as dependencias numa etapa separada faz com que o Docker reaproveite
# esta camada enquanto o package-lock.json nao mudar, mesmo que o codigo mude.
FROM node:20-alpine AS dependencias

WORKDIR /app
COPY package.json package-lock.json ./

# --omit=dev deixa de fora jest e supertest: eles servem ao pipeline,
# nao a imagem que vai para producao.
RUN npm ci --omit=dev

# ---- Etapa 2: imagem final -------------------------------------------------
FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /app

# Copia apenas o que a aplicacao precisa para rodar. As ferramentas de build e
# os arquivos de teste nunca chegam na imagem final.
COPY --from=dependencias /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
COPY public ./public

# A imagem oficial do Node ja traz o usuario "node". Rodar como usuario comum
# em vez de root limita o estrago em caso de invasao do contêiner.
USER node

EXPOSE 3000

# O Docker consulta o /health periodicamente e marca o contêiner como unhealthy
# se a aplicacao parar de responder ou perder o banco.
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "src/server.js"]
