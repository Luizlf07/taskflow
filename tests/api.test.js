'use strict';

const request = require('supertest');
const app = require('../src/app');
const tasks = require('../src/tasks');

// Testes de integracao: fazem requisicoes HTTP de verdade contra a aplicacao.
describe('API de tarefas', () => {
  beforeEach(() => {
    tasks.reset();
  });

  it('POST /tasks cria a tarefa e responde 201', async () => {
    const resposta = await request(app)
      .post('/tasks')
      .send({ title: 'Escrever os testes' })
      .expect(201);

    expect(resposta.body).toEqual({ id: 1, title: 'Escrever os testes', status: 'pendente' });
  });

  it('POST /tasks responde 400 com titulo invalido', async () => {
    const resposta = await request(app).post('/tasks').send({ title: 'ab' }).expect(400);
    expect(resposta.body.erro).toMatch(/pelo menos 3 caracteres/);
  });

  it('GET /tasks lista as tarefas', async () => {
    await request(app).post('/tasks').send({ title: 'Primeira tarefa' });
    await request(app).post('/tasks').send({ title: 'Segunda tarefa' });

    const resposta = await request(app).get('/tasks').expect(200);
    expect(resposta.body).toHaveLength(2);
  });

  it('GET /tasks?status=concluida filtra a listagem', async () => {
    const criada = await request(app).post('/tasks').send({ title: 'Tarefa concluida' });
    await request(app).post('/tasks').send({ title: 'Tarefa pendente' });
    await request(app).patch(`/tasks/${criada.body.id}/concluir`);

    const resposta = await request(app).get('/tasks?status=concluida').expect(200);
    expect(resposta.body).toHaveLength(1);
    expect(resposta.body[0].title).toBe('Tarefa concluida');
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

  it('GET /tasks/:id responde 404 quando a tarefa nao existe', async () => {
    await request(app).get('/tasks/99').expect(404);
  });
});
