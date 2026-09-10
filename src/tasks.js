'use strict';

const STATUSES = ['pendente', 'concluida'];

// Lista em memoria. O projeto e o inicio da aplicacao: o banco de dados entra
// depois, sem mudar quem usa estas funcoes.
let tasks = [];
let proximoId = 1;

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

function create(input) {
  const title = typeof input?.title === 'string' ? input.title.trim() : '';
  if (title.length < 3) {
    throw new ValidationError('O titulo deve ter pelo menos 3 caracteres.');
  }

  const task = { id: proximoId++, title, status: 'pendente' };
  tasks.push(task);
  return task;
}

function list(status) {
  if (!status) {
    return tasks;
  }
  if (!STATUSES.includes(status)) {
    throw new ValidationError(`O status deve ser: ${STATUSES.join(' ou ')}.`);
  }
  return tasks.filter((task) => task.status === status);
}

function getById(id) {
  const task = tasks.find((item) => item.id === Number(id));
  if (!task) {
    throw new NotFoundError(`Tarefa ${id} nao encontrada.`);
  }
  return task;
}

function complete(id) {
  const task = getById(id);
  task.status = 'concluida';
  return task;
}

function remove(id) {
  const task = getById(id);
  tasks = tasks.filter((item) => item.id !== task.id);
}

// Usado pelos testes para comecar cada caso com a lista vazia.
function reset() {
  tasks = [];
  proximoId = 1;
}

module.exports = { create, list, getById, complete, remove, reset, ValidationError, NotFoundError };
