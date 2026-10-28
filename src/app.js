'use strict';

const express = require('express');
const tasks = require('./tasks');
const { pool } = require('./db');

const app = express();
app.use(express.json());

// Usado pelo healthcheck do contêiner e pelo teste de fumaca do deploy.
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', banco: 'conectado' });
  } catch {
    res.status(503).json({ status: 'degradado', banco: 'indisponivel' });
  }
});

app.get('/tasks', async (req, res, next) => {
  try {
    res.json(await tasks.list(req.query.status));
  } catch (error) {
    next(error);
  }
});

app.get('/tasks/:id', async (req, res, next) => {
  try {
    res.json(await tasks.getById(req.params.id));
  } catch (error) {
    next(error);
  }
});

app.post('/tasks', async (req, res, next) => {
  try {
    res.status(201).json(await tasks.create(req.body));
  } catch (error) {
    next(error);
  }
});

app.patch('/tasks/:id/concluir', async (req, res, next) => {
  try {
    res.json(await tasks.complete(req.params.id));
  } catch (error) {
    next(error);
  }
});

app.delete('/tasks/:id', async (req, res, next) => {
  try {
    await tasks.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Transforma os erros das regras de negocio na resposta HTTP correspondente.
app.use((error, req, res, next) => {
  res.status(error.statusCode || 500).json({ erro: error.message });
});

module.exports = app;
