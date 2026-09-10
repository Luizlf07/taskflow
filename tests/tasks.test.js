'use strict';

const tasks = require('../src/tasks');

// Testes unitarios: verificam as regras de negocio direto, sem passar por HTTP.
describe('Regras das tarefas', () => {
  beforeEach(() => {
    tasks.reset();
  });

  it('cria uma tarefa como pendente', () => {
    const task = tasks.create({ title: 'Estudar CI/CD' });

    expect(task.id).toBe(1);
    expect(task.title).toBe('Estudar CI/CD');
    expect(task.status).toBe('pendente');
  });

  it('remove os espacos em volta do titulo', () => {
    expect(tasks.create({ title: '  Revisar codigo  ' }).title).toBe('Revisar codigo');
  });

  it('recusa titulo com menos de 3 caracteres', () => {
    expect(() => tasks.create({ title: 'ab' })).toThrow(tasks.ValidationError);
  });

  it('recusa criacao sem titulo', () => {
    expect(() => tasks.create({})).toThrow(/pelo menos 3 caracteres/);
  });

  it('lista todas as tarefas criadas', () => {
    tasks.create({ title: 'Primeira tarefa' });
    tasks.create({ title: 'Segunda tarefa' });

    expect(tasks.list()).toHaveLength(2);
  });

  it('filtra a listagem por status', () => {
    const primeira = tasks.create({ title: 'Primeira tarefa' });
    tasks.create({ title: 'Segunda tarefa' });
    tasks.complete(primeira.id);

    expect(tasks.list('concluida')).toHaveLength(1);
    expect(tasks.list('pendente')).toHaveLength(1);
  });

  it('recusa filtro com status que nao existe', () => {
    expect(() => tasks.list('arquivada')).toThrow(tasks.ValidationError);
  });

  it('marca a tarefa como concluida', () => {
    const task = tasks.create({ title: 'Tarefa para concluir' });
    expect(tasks.complete(task.id).status).toBe('concluida');
  });

  it('apaga a tarefa', () => {
    const task = tasks.create({ title: 'Tarefa descartavel' });
    tasks.remove(task.id);

    expect(tasks.list()).toHaveLength(0);
  });

  it('avisa quando a tarefa nao existe', () => {
    expect(() => tasks.getById(99)).toThrow(tasks.NotFoundError);
    expect(() => tasks.complete(99)).toThrow(tasks.NotFoundError);
    expect(() => tasks.remove(99)).toThrow(tasks.NotFoundError);
  });
});
