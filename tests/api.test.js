'use strict';

const request = require('supertest');
const app = require('../src/app');
const { pool, init } = require('../src/db');

// Testes de integracao: requisicoes HTTP reais contra a aplicacao, com um
// PostgreSQL de verdade por tras. No pipeline o banco sobe como service
// container; na maquina do desenvolvedor, pelo docker compose.
describe('API de tarefas', () => {
  beforeAll(async () => {
    await init();
  });

  beforeEach(async () => {
    await pool.query('TRUNCATE tasks RESTART IDENTITY');
  });

  afterAll(async () => {
    await pool.end();
  });

  it('GET /health responde ok com o banco conectado', async () => {
    const resposta = await request(app).get('/health').expect(200);
    expect(resposta.body).toEqual({ status: 'ok', banco: 'conectado' });
  });

  it('POST /tasks cria a tarefa e responde 201', async () => {
    const resposta = await request(app)
      .post('/tasks')
      .send({ title: 'Escrever o Dockerfile' })
      .expect(201);

    expect(resposta.body).toEqual({ id: 1, title: 'Escrever o Dockerfile', status: 'pendente' });
  });

  it('POST /tasks responde 400 com titulo invalido', async () => {
    const resposta = await request(app).post('/tasks').send({ title: 'ab' }).expect(400);
    expect(resposta.body.erro).toMatch(/pelo menos 3 caracteres/);
  });

  it('persiste a tarefa entre requisicoes', async () => {
    await request(app).post('/tasks').send({ title: 'Primeira tarefa' });

    const resposta = await request(app).get('/tasks').expect(200);
    expect(resposta.body).toHaveLength(1);
    expect(resposta.body[0].title).toBe('Primeira tarefa');
  });

  it('GET /tasks?status=concluida filtra a listagem', async () => {
    const criada = await request(app).post('/tasks').send({ title: 'Tarefa concluida' });
    await request(app).post('/tasks').send({ title: 'Tarefa pendente' });
    await request(app).patch(`/tasks/${criada.body.id}/concluir`);

    const resposta = await request(app).get('/tasks?status=concluida').expect(200);
    expect(resposta.body).toHaveLength(1);
    expect(resposta.body[0].title).toBe('Tarefa concluida');
  });

  it('GET /tasks com status invalido responde 400', async () => {
    await request(app).get('/tasks?status=arquivada').expect(400);
  });

  it('PATCH /tasks/:id/concluir marca como concluida', async () => {
    const criada = await request(app).post('/tasks').send({ title: 'Tarefa para concluir' });

    const resposta = await request(app).patch(`/tasks/${criada.body.id}/concluir`).expect(200);
    expect(resposta.body.status).toBe('concluida');
  });

  it('DELETE /tasks/:id apaga a tarefa e responde 204', async () => {
    const criada = await request(app).post('/tasks').send({ title: 'Tarefa descartavel' });

    await request(app).delete(`/tasks/${criada.body.id}`).expect(204);
    await request(app).get(`/tasks/${criada.body.id}`).expect(404);
  });

  it('responde 404 para tarefa inexistente', async () => {
    await request(app).get('/tasks/99').expect(404);
    await request(app).patch('/tasks/99/concluir').expect(404);
    await request(app).delete('/tasks/99').expect(404);
  });

  it('serve a interface na raiz', async () => {
    const resposta = await request(app).get('/').expect(200);
    expect(resposta.text).toMatch(/TaskFlow/);
  });
});
