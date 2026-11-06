// Frontend sem framework: apenas DOM e fetch().
const $ = id => document.getElementById(id);
const BASE = new Set(['_id', 'nome', 'cidade', 'telefone', 'email']);
const estado = { clientes: [], pedidos: [], clienteId: null, pedidoId: null };
let timerToast;

const EXEMPLOS = {
  tags: { tags: ['vip', 'indicacao'] },
  empresa: { empresa: { nome: 'Empresa Exemplo', ramo: 'Tecnologia' } },
  preferencias: { preferencias: { contato: 'WhatsApp', periodo: 'tarde' } },
  enderecos: { enderecos: [{ tipo: 'residencial', bairro: 'Centro' }, { tipo: 'comercial', bairro: 'Industrial' }] }
};

function toast(mensagem, erro = false) {
  const elemento = $('toast');
  elemento.textContent = mensagem;
  elemento.classList.toggle('error', erro);
  elemento.classList.add('visible');
  clearTimeout(timerToast);
  timerToast = setTimeout(() => elemento.classList.remove('visible'), 4100);
}

async function api(caminho, opcoes = {}) {
  let resposta;
  try {
    resposta = await fetch(caminho, { ...opcoes, headers: { 'Content-Type': 'application/json', ...(opcoes.headers || {}) }, cache: 'no-store' });
  } catch {
    throw new Error('Não foi possível acessar o Node.js. Confirme se npm start está rodando.');
  }
  let conteudo;
  try { conteudo = await resposta.json(); }
  catch { throw new Error('Resposta inválida do servidor.'); }
  if (!resposta.ok) throw new Error(conteudo.erro || `Erro HTTP ${resposta.status}`);
  return conteudo;
}

function textoNo(parent, tag, texto, classe = '') {
  const elemento = document.createElement(tag);
  elemento.textContent = texto;
  if (classe) elemento.className = classe;
  parent.appendChild(elemento);
  return elemento;
}

function extrasDe(documento) {
  return Object.fromEntries(Object.entries(documento).filter(([key]) => !BASE.has(key)));
}

function assinatura(documento) {
  return Object.keys(documento).sort().join('|');
}

function pintarStats() {
  $('stat-clientes').textContent = estado.clientes.length;
  $('stat-estruturas').textContent = new Set(estado.clientes.map(assinatura)).size;
  $('stat-extras').textContent = new Set(estado.clientes.flatMap(x => Object.keys(extrasDe(x)))).size;
}

function pintarCampos(elemento, documento, considerarBase = true) {
  elemento.replaceChildren();
  const chaves = Object.keys(documento).filter(x => !considerarBase || !BASE.has(x));
  if (!chaves.length) return textoNo(elemento, 'span', 'Sem campos adicionais neste documento.');
  for (const chave of chaves) {
    const valor = documento[chave];
    const tipo = Array.isArray(valor) ? '[array]' : valor === null ? 'null' : typeof valor === 'object' ? '{objeto}' : typeof valor;
    textoNo(elemento, 'span', `${chave} ${tipo}`, 'field-badge');
  }
}

function formatarCliente(cliente) {
  estado.clienteId = String(cliente._id);
  $('titulo-formulario').textContent = 'Editar cliente';
  $('salvar-cliente').textContent = 'Salvar alterações';
  $('excluir-cliente').hidden = false;
  $('nome').value = cliente.nome || '';
  $('cidade').value = cliente.cidade || '';
  $('telefone').value = cliente.telefone || '';
  $('email').value = cliente.email || '';
  $('extras').value = JSON.stringify(extrasDe(cliente), null, 2);
  $('json-cliente').textContent = JSON.stringify(cliente, null, 2);
  pintarCampos($('estrutura-atual'), extrasDe(cliente), false);
  pintarListaClientes();
}

function novoCliente() {
  estado.clienteId = null;
  $('titulo-formulario').textContent = 'Novo cliente';
  $('salvar-cliente').textContent = 'Cadastrar cliente';
  $('excluir-cliente').hidden = true;
  $('form-cliente').reset();
  $('extras').value = '{}';
  $('json-cliente').textContent = '// Selecione um cliente à esquerda';
  $('estrutura-atual').textContent = 'Selecione um cliente na lista.';
  pintarListaClientes();
}

function pintarListaClientes() {
  const filtro = $('busca').value.trim().toLocaleLowerCase('pt-BR');
  const filtrados = estado.clientes.filter(c => `${c.nome || ''} ${c.cidade || ''}`.toLocaleLowerCase('pt-BR').includes(filtro));
  $('contador-lista').textContent = `${filtrados.length} resultado(s)`;
  const corpo = $('lista-clientes');
  corpo.replaceChildren();
  if (!filtrados.length) {
    const tr = document.createElement('tr'); const td = textoNo(tr, 'td', 'Nenhum cliente encontrado.', 'estado'); td.colSpan = 4; corpo.appendChild(tr); return;
  }
  for (const cliente of filtrados) {
    const tr = document.createElement('tr');
    tr.dataset.id = String(cliente._id);
    tr.tabIndex = 0;
    tr.setAttribute('aria-label', `Selecionar ${cliente.nome}`);
    tr.classList.toggle('active', tr.dataset.id === estado.clienteId);
    const nome = document.createElement('td'); textoNo(nome, 'span', cliente.nome || '(Sem nome)'); textoNo(nome, 'span', String(cliente._id), 'muted'); tr.appendChild(nome);
    textoNo(tr, 'td', cliente.cidade || '—');
    const tdExtras = document.createElement('td');
    const adicionais = Object.keys(extrasDe(cliente));
    textoNo(tdExtras, 'span', adicionais.length ? adicionais.join(', ') : 'Nenhum', 'field-badge'); tr.appendChild(tdExtras);
    textoNo(tr, 'td', '›', 'arrow');
    tr.addEventListener('click', () => formatarCliente(cliente));
    tr.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); formatarCliente(cliente); } });
    corpo.appendChild(tr);
  }
}

async function carregarClientes(selecionarId = null) {
  estado.clientes = await api('/api/clientes');
  pintarStats();
  if (selecionarId !== null) {
    const encontrado = estado.clientes.find(c => String(c._id) === String(selecionarId));
    if (encontrado) formatarCliente(encontrado);
    else novoCliente();
  } else if (estado.clienteId !== null) {
    const atual = estado.clientes.find(c => String(c._id) === estado.clienteId);
    if (atual) formatarCliente(atual); else novoCliente();
  } else pintarListaClientes();
}

function pintarPedidos() {
  const corpo = $('lista-pedidos'); corpo.replaceChildren();
  if (!estado.pedidos.length) {
    const tr = document.createElement('tr'); const td = textoNo(tr, 'td', 'Sem pedidos. Execute npm run seed.', 'estado'); td.colSpan = 4; corpo.appendChild(tr); return;
  }
  for (const pedido of estado.pedidos) {
    const tr = document.createElement('tr'); tr.dataset.id = String(pedido._id); tr.tabIndex = 0;
    tr.classList.toggle('active', String(pedido._id) === estado.pedidoId);
    const cliente = estado.clientes.find(c => c._id === pedido.cliente_id);
    textoNo(tr, 'td', `#${pedido._id}`);
    textoNo(tr, 'td', cliente ? cliente.nome : `ID ${pedido.cliente_id}`);
    textoNo(tr, 'td', pedido.status || '—');
    textoNo(tr, 'td', Number.isFinite(pedido.total) ? pedido.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—');
    tr.addEventListener('click', () => selecionarPedido(pedido));
    tr.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selecionarPedido(pedido); } });
    corpo.appendChild(tr);
  }
}

function selecionarPedido(pedido) {
  estado.pedidoId = String(pedido._id);
  $('json-pedido').textContent = JSON.stringify(pedido, null, 2);
  pintarCampos($('campos-pedido'), pedido);
  pintarPedidos();
}

async function carregarPedidos() {
  estado.pedidos = await api('/api/pedidos');
  const selecionado = estado.pedidos.find(x => String(x._id) === estado.pedidoId);
  if (selecionado) selecionarPedido(selecionado); else pintarPedidos();
}

function extrairExtras() {
  const texto = $('extras').value.trim();
  if (!texto) return {};
  let dados;
  try { dados = JSON.parse(texto); }
  catch { throw new Error('O campo de JSON extra não está válido. Revise aspas, vírgulas e chaves.'); }
  if (!dados || typeof dados !== 'object' || Array.isArray(dados)) throw new Error('Os campos extras precisam ser um objeto JSON: { "chave": "valor" }.');
  return dados;
}

$('form-cliente').addEventListener('submit', async event => {
  event.preventDefault();
  const botao = $('salvar-cliente'); botao.disabled = true;
  try {
    const body = {
      nome: $('nome').value,
      cidade: $('cidade').value,
      telefone: $('telefone').value,
      email: $('email').value,
      extras: extrairExtras()
    };
    const editando = estado.clienteId !== null;
    const url = editando ? `/api/clientes/${encodeURIComponent(estado.clienteId)}` : '/api/clientes';
    const resultado = await api(url, { method: editando ? 'PUT' : 'POST', body: JSON.stringify(body) });
    await carregarClientes(editando ? estado.clienteId : resultado.id);
    toast(resultado.mensagem);
  } catch (error) { toast(error.message, true); }
  finally { botao.disabled = false; }
});

$('excluir-cliente').addEventListener('click', async () => {
  const id = estado.clienteId;
  if (id === null) return;
  const c = estado.clientes.find(x => String(x._id) === id);
  if (!confirm(`Excluir ${c?.nome || 'este cliente'} do banco de dados?\n\nAtenção: os pedidos não serão excluídos automaticamente.`)) return;
  try {
    const resultado = await api(`/api/clientes/${encodeURIComponent(id)}`, { method: 'DELETE' });
    novoCliente();
    await carregarClientes();
    await carregarPedidos();
    toast(resultado.mensagem);
  } catch (error) { toast(error.message, true); }
});

$('novo-cliente').addEventListener('click', novoCliente);
$('busca').addEventListener('input', pintarListaClientes);
$('recarregar-clientes').addEventListener('click', () => carregarClientes().then(() => toast('Clientes atualizados.')).catch(e => toast(e.message, true)));
$('recarregar-pedidos').addEventListener('click', () => carregarPedidos().then(() => toast('Pedidos atualizados.')).catch(e => toast(e.message, true)));

for (const botao of document.querySelectorAll('[data-exemplo]')) {
  botao.addEventListener('click', () => {
    try {
      const atual = extrairExtras();
      const exemplo = EXEMPLOS[botao.dataset.exemplo];
      $('extras').value = JSON.stringify({ ...atual, ...exemplo }, null, 2);
      toast(`Campo ${botao.dataset.exemplo} adicionado ao JSON. Agora salve.`);
    } catch (error) { toast(error.message, true); }
  });
}

function trocarAba(aba) {
  const clientes = aba === 'clientes';
  $('painel-clientes').hidden = !clientes;
  $('painel-pedidos').hidden = clientes;
  $('tab-clientes').classList.toggle('selected', clientes);
  $('tab-pedidos').classList.toggle('selected', !clientes);
  $('tab-clientes').setAttribute('aria-selected', String(clientes));
  $('tab-pedidos').setAttribute('aria-selected', String(!clientes));
}
$('tab-clientes').addEventListener('click', () => trocarAba('clientes'));
$('tab-pedidos').addEventListener('click', () => trocarAba('pedidos'));

async function iniciar() {
  try {
    const resposta = await api('/api/health');
    $('nome-banco').textContent = resposta.banco;
    $('connection-label').textContent = resposta.origem;
    $('connection-dot').classList.add('online');
    await carregarClientes();
    await carregarPedidos();
  } catch (error) {
    $('connection-label').textContent = 'Sem conexão';
    $('connection-dot').classList.add('offline');
    $('lista-clientes').textContent = 'Falha ao carregar os clientes.';
    toast(error.message, true);
  }
}
iniciar();
