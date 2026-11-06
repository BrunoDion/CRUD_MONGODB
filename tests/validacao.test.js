import test from 'node:test';
import assert from 'node:assert/strict';
import { montarCliente, interpretarId, camposRemovidos } from '../validacao.js';

test('aceita documentos com diferentes campos extras e estruturas', () => {
  const x = montarCliente({ nome: 'Ana', cidade: 'Guarapuava', extras: { tags: ['vip'], empresa: { ramo: 'TI' }, ativo: false } });
  assert.deepEqual(x, { nome: 'Ana', cidade: 'Guarapuava', tags: ['vip'], empresa: { ramo: 'TI' }, ativo: false });
  const y = montarCliente({ nome: 'Maria', cidade: 'Curitiba', extras: {} });
  assert.deepEqual(y, { nome: 'Maria', cidade: 'Curitiba' });
});
test('não permite operadores ou campos especiais em extras', () => {
  assert.throws(() => montarCliente({ nome: 'Ana', cidade: 'Curitiba', extras: { '$where': 'x' } }));
  assert.throws(() => montarCliente({ nome: 'Ana', cidade: 'Curitiba', extras: JSON.parse('{"__proto__":{}}') }));
  assert.throws(() => montarCliente({ nome: 'Ana', cidade: 'Curitiba', extras: { telefone: '999' } }));
});
test('interpreta IDs numéricos da aula e ObjectId do MongoDB', () => {
  assert.deepEqual(interpretarId('7'), { tipo: 'numero', valor: 7 });
  assert.equal(interpretarId('507f1f77bcf86cd799439011').tipo, 'objectid');
  assert.throws(() => interpretarId('abc'));
});
test('edição remove apenas campos que deixaram de existir', () => {
  assert.deepEqual(camposRemovidos({ _id: 2, nome: 'Ana', cidade: 'Curitiba', tags: ['vip'] }, { nome: 'Ana', cidade: 'Curitiba' }), { tags: '' });
});
