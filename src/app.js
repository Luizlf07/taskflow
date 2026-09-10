'use strict';

const express = require('express');
const tasks = require('./tasks');

const app = express();
app.use(express.json());

app.get('/tasks', (req, res, next) => {
  try {
    res.json(tasks.list(req.query.status));
  } catch (error) {
    next(error);
  }
});

app.get('/tasks/:id', (req, res, next) => {
  try {
    res.json(tasks.getById(req.params.id));
  } catch (error) {
    next(error);
  }
});

app.post('/tasks', (req, res, next) => {
  try {
    res.status(201).json(tasks.create(req.body));
  } catch (error) {
    next(error);
  }
});

app.patch('/tasks/:id/concluir', (req, res, next) => {
  try {
    res.json(tasks.complete(req.params.id));
  } catch (error) {
    next(error);
  }
});

app.delete('/tasks/:id', (req, res, next) => {
  try {
    tasks.remove(req.params.id);
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
