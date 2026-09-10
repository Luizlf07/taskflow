# TaskFlow

Início de uma API REST para gerenciar tarefas. O foco do projeto são três
práticas de engenharia: **Trunk-Based Development**, **commits padronizados** e
**Integração Contínua**.

## Como rodar

Requer Node.js 20 ou superior.

```bash
npm ci      # instala as dependências
npm test    # roda os 17 testes
npm start   # sobe a API em http://localhost:3000
```

## Endpoints

| Método | Rota | O que faz |
| --- | --- | --- |
| `GET` | `/tasks` | Lista as tarefas (filtro opcional: `?status=pendente`) |
| `GET` | `/tasks/:id` | Busca uma tarefa |
| `POST` | `/tasks` | Cria uma tarefa (campo `title`, mínimo 3 caracteres) |
| `PATCH` | `/tasks/:id/concluir` | Marca a tarefa como concluída |
| `DELETE` | `/tasks/:id` | Apaga uma tarefa |

```bash
curl -X POST http://localhost:3000/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title": "Estudar CI/CD"}'
```

## Estrutura

```
src/
├── tasks.js    regras de negócio e validação
├── app.js      rotas HTTP
└── server.js   sobe o servidor

tests/
├── tasks.test.js  testes unitários (regras, sem HTTP)
└── api.test.js    testes de integração (requisições HTTP reais)
```

## Testes

São 17 testes de dois tipos:

- **Unitários** — testam as regras direto: criação, filtro, conclusão, remoção
  e as validações que recusam dados inválidos.
- **Integração** — fazem requisições HTTP reais contra a aplicação com
  Supertest, verificando os códigos de resposta (201, 204, 400, 404).

## Estratégia de ramificação: Trunk-Based Development

A `main` é a única branch permanente e está sempre em estado entregável. Não
existem branches `develop` ou `release`.

```
main  ──●───●───●───●───●───●──▶   sempre verde
         \     /     \     /
          ●───●       ●───●        branches curtos (horas ou 1–2 dias)
```

Fluxo de uma contribuição:

```bash
git checkout main && git pull        # parte da main atualizada
git checkout -b feat/nome-da-tarefa  # branch curto
git commit -m "feat: adiciona filtro por data"
git push -u origin feat/nome-da-tarefa
```

O CI roda sozinho no Pull Request. Com o pipeline verde e uma aprovação, o
merge é feito com squash e o branch é apagado.

**Regra prática:** nenhum branch vive mais de 2 dias. Tarefa maior que isso é
quebrada em partes menores.

### Por que Trunk-Based e não Git Flow

| | Trunk-Based | Git Flow |
| --- | --- | --- |
| Integração | Diária | Só ao fechar a release |
| Conflitos de merge | Raros e pequenos | Frequentes e grandes |
| Retorno do CI | Em minutos | Tardio |
| Branches permanentes | 1 | 2 ou mais |

Git Flow foi feito para software com versões distribuídas e várias releases com
suporte ao mesmo tempo. Para uma aplicação entregue continuamente, seus branches
longos criam o problema que a Integração Contínua existe para resolver: código
divergindo por semanas antes de encontrar o resto.

O custo do Trunk-Based é exigir testes automatizados confiáveis e revisões
rápidas — sem isso, a `main` quebra. Daí a proteção da branch e o pipeline
serem obrigatórios aqui.

## Regras de proteção da branch principal

Configuradas em **Settings → Rules → Rulesets**:

| Regra | Efeito |
| --- | --- |
| Exigir Pull Request (1 aprovação) | Ninguém dá push direto na `main` |
| Exigir o status check `Testes` | Nada entra com o pipeline vermelho |
| Exigir branch atualizado | O código é testado contra a `main` atual |
| Bloquear force push | O histórico da `main` não pode ser reescrito |
| Bloquear exclusão da branch | A `main` não pode ser apagada |
| Exigir histórico linear | Só squash merge |

Com isso ativo, um `git push origin main` é recusado pelo servidor e um Pull
Request com o pipeline vermelho tem o botão de merge bloqueado.

## Padrão de commits

Todo commit segue o **Conventional Commits**:

```
<tipo>: <descrição no imperativo>
```

Tipos usados: `feat`, `fix`, `docs`, `test`, `chore`, `ci`.

```
feat: adiciona filtro por status na listagem
fix: corrige resposta 404 ao buscar tarefa inexistente
ci: adiciona pipeline de testes no github actions
```

Um histórico padronizado permite gerar changelog automaticamente, deduzir a
próxima versão e responder "quando isso mudou e por quê" lendo uma linha.

## Integração Contínua

O arquivo [`.github/workflows/ci.yml`](.github/workflows/ci.yml) define o
pipeline, que roda a cada push na `main` e a cada Pull Request:

1. Baixa o código
2. Instala o Node.js 20
3. Instala as dependências (`npm ci`)
4. Roda os testes (`npm test`)

Se os testes falharem, o pipeline fica vermelho e o merge é bloqueado.
