'use strict';

const { pool } = require('./db');

const STATUSES = ['pendente', 'concluida'];

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

// --- Regras puras: nao acessam o banco, por isso sao testadas isoladamente ---

function validarTitulo(input) {
  const title = typeof input?.title === 'string' ? input.title.trim() : '';
  if (title.length < 3) {
    throw new ValidationError('O titulo deve ter pelo menos 3 caracteres.');
  }
  return title;
}

function validarStatus(status) {
  if (!STATUSES.includes(status)) {
    throw new ValidationError(`O status deve ser: ${STATUSES.join(' ou ')}.`);
  }
  return status;
}

function validarId(id) {
  const numero = Number(id);
  if (!Number.isInteger(numero) || numero < 1) {
    throw new NotFoundError(`Tarefa ${id} nao encontrada.`);
  }
  return numero;
}

// --- Operacoes sobre o banco ---

async function create(input) {
  const title = validarTitulo(input);
  const { rows } = await pool.query(
    'INSERT INTO tasks (title) VALUES ($1) RETURNING id, title, status',
    [title],
  );
  return rows[0];
}

async function list(status) {
  if (!status) {
    const { rows } = await pool.query('SELECT id, title, status FROM tasks ORDER BY id');
    return rows;
  }

  const { rows } = await pool.query(
    'SELECT id, title, status FROM tasks WHERE status = $1 ORDER BY id',
    [validarStatus(status)],
  );
  return rows;
}

async function getById(id) {
  const { rows } = await pool.query(
    'SELECT id, title, status FROM tasks WHERE id = $1',
    [validarId(id)],
  );
  if (rows.length === 0) {
    throw new NotFoundError(`Tarefa ${id} nao encontrada.`);
  }
  return rows[0];
}

async function complete(id) {
  const { rows } = await pool.query(
    "UPDATE tasks SET status = 'concluida' WHERE id = $1 RETURNING id, title, status",
    [validarId(id)],
  );
  if (rows.length === 0) {
    throw new NotFoundError(`Tarefa ${id} nao encontrada.`);
  }
  return rows[0];
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM tasks WHERE id = $1', [validarId(id)]);
  if (rowCount === 0) {
    throw new NotFoundError(`Tarefa ${id} nao encontrada.`);
  }
}

module.exports = {
  STATUSES,
  ValidationError,
  NotFoundError,
  validarTitulo,
  validarStatus,
  validarId,
  create,
  list,
  getById,
  complete,
  remove,
};
