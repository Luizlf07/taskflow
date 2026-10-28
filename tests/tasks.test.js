'use strict';

const tasks = require('../src/tasks');

// Testes unitarios: exercitam as regras puras, sem banco e sem HTTP.
describe('Regras de validacao', () => {
  describe('validarTitulo', () => {
    it('aceita um titulo valido e remove os espacos em volta', () => {
      expect(tasks.validarTitulo({ title: '  Estudar Docker  ' })).toBe('Estudar Docker');
    });

    it('recusa titulo com menos de 3 caracteres', () => {
      expect(() => tasks.validarTitulo({ title: 'ab' })).toThrow(tasks.ValidationError);
    });

    it('recusa quando o titulo nao foi enviado', () => {
      expect(() => tasks.validarTitulo({})).toThrow(/pelo menos 3 caracteres/);
    });

    it('recusa quando o titulo nao e texto', () => {
      expect(() => tasks.validarTitulo({ title: 42 })).toThrow(tasks.ValidationError);
    });
  });

  describe('validarStatus', () => {
    it('aceita os status previstos', () => {
      expect(tasks.validarStatus('pendente')).toBe('pendente');
      expect(tasks.validarStatus('concluida')).toBe('concluida');
    });

    it('recusa status que nao existe', () => {
      expect(() => tasks.validarStatus('arquivada')).toThrow(/O status deve ser/);
    });
  });

  describe('validarId', () => {
    it('converte texto numerico para numero', () => {
      expect(tasks.validarId('7')).toBe(7);
    });

    it('trata id invalido como tarefa inexistente', () => {
      expect(() => tasks.validarId('abc')).toThrow(tasks.NotFoundError);
      expect(() => tasks.validarId('0')).toThrow(tasks.NotFoundError);
      expect(() => tasks.validarId('1.5')).toThrow(tasks.NotFoundError);
    });
  });
});
