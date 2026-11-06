// Validação simples para um projeto didático, sem biblioteca de validação.
// Não é uma API pronta para publicação na internet.
const RESERVADOS = new Set(['_id', 'nome', 'cidade', 'telefone', 'email', '__proto__', 'prototype', 'constructor']);

export class ErroEntrada extends Error {
  constructor(message) {
    super(message);
    this.status = 400;
  }
}

function objetoSimples(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}

function validarChavesProfundas(value, nivel = 0) {
  if (nivel > 8) throw new ErroEntrada('Campos extras muito profundos (máximo: 8 níveis).');
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
  if (typeof value === 'number' && Number.isFinite(value)) return;
  if (Array.isArray(value)) {
    if (value.length > 100) throw new ErroEntrada('Um array pode conter no máximo 100 itens neste exemplo.');
    value.forEach(item => validarChavesProfundas(item, nivel + 1));
    return;
  }
  if (!objetoSimples(value)) throw new ErroEntrada('Campos extras devem conter JSON válido (objetos, arrays e valores simples).');
  for (const [key, child] of Object.entries(value)) {
    if (!key || key.startsWith('$') || key.includes('.') || ['__proto__', 'constructor', 'prototype'].includes(key)) {
      throw new ErroEntrada(`Nome de campo não permitido: ${key}`);
    }
    validarChavesProfundas(child, nivel + 1);
  }
}

function campoTexto(value, nome, obrigatorio = false) {
  if (value === undefined || value === null || value === '') {
    if (obrigatorio) throw new ErroEntrada(`Preencha o campo ${nome}.`);
    return undefined;
  }
  if (typeof value !== 'string') throw new ErroEntrada(`O campo ${nome} deve ser texto.`);
  const texto = value.trim();
  if (obrigatorio && texto.length < 2) throw new ErroEntrada(`${nome}: mínimo de 2 caracteres.`);
  if (texto.length > 150) throw new ErroEntrada(`${nome}: máximo de 150 caracteres.`);
  return texto || undefined;
}

export function montarCliente(body) {
  if (!objetoSimples(body)) throw new ErroEntrada('Envie um objeto JSON com o cliente.');
  const nome = campoTexto(body.nome, 'nome', true);
  const cidade = campoTexto(body.cidade, 'cidade', true);
  const telefone = campoTexto(body.telefone, 'telefone');
  const email = campoTexto(body.email, 'email');
  const extras = body.extras === undefined ? {} : body.extras;
  if (!objetoSimples(extras)) throw new ErroEntrada('Campos extras devem formar um objeto JSON, como {"tags":["vip"]}.');
  for (const key of Object.keys(extras)) {
    if (RESERVADOS.has(key)) throw new ErroEntrada(`Não inclua '${key}' nos campos extras; use o campo próprio.`);
  }
  validarChavesProfundas(extras);
  const cliente = { nome, cidade };
  if (telefone !== undefined) cliente.telefone = telefone;
  if (email !== undefined) cliente.email = email;
  // Cada cliente pode ter campos adicionais diferentes.
  return { ...cliente, ...extras };
}

export function interpretarId(texto) {
  if (/^(0|[1-9][0-9]*)$/.test(texto)) {
    const numero = Number(texto);
    if (!Number.isSafeInteger(numero)) throw new ErroEntrada('ID numérico muito grande.');
    return { tipo: 'numero', valor: numero };
  }
  if (/^[a-f\d]{24}$/i.test(texto)) return { tipo: 'objectid', valor: texto };
  throw new ErroEntrada('Identificador inválido.');
}

// Retorna os campos retirados da edição, para que updateOne use $unset.
export function camposRemovidos(documentoAnterior, novoDocumento) {
  return Object.fromEntries(
    Object.keys(documentoAnterior)
      .filter(key => key !== '_id' && !(key in novoDocumento))
      .map(key => [key, ''])
  );
}
