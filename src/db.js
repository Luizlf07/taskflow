'use strict';

const { Pool } = require('pg');

// A string de conexao vem SEMPRE do ambiente: em desenvolvimento do arquivo
// .env (que nao e versionado), no CI dos Secrets do GitHub Actions. Nenhuma
// credencial fica no codigo-fonte.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendente',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

/**
 * Cria a tabela se ela ainda nao existir. Tenta algumas vezes porque, ao subir
 * com o docker compose, a aplicacao pode ficar pronta antes do banco aceitar
 * conexoes.
 */
async function init(tentativas = 10) {
  for (let i = 1; i <= tentativas; i += 1) {
    try {
      await pool.query(SCHEMA);
      return;
    } catch (error) {
      if (i === tentativas) {
        throw error;
      }
      console.log(`Banco indisponivel (tentativa ${i}/${tentativas}). Aguardando...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

module.exports = { pool, init };
