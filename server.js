import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoClient, ObjectId } from 'mongodb';
import { montarCliente, interpretarId, camposRemovidos, ErroEntrada } from './validacao.js';

const URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.DB_NAME || 'sistema_pedidos';
const PORT = Number(process.env.PORT || 3000);
const ORIGEM = URI.startsWith('mongodb+srv://') ? 'MongoDB Atlas / remoto' :
  URI.includes('127.0.0.1') || URI.includes('localhost') ? 'MongoDB local' : 'MongoDB remoto';
const PASTA_PUBLIC = path.join(path.dirname(fileURLToPath(import.meta.url)), 'public');
const ARQUIVOS = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/style.css', ['style.css', 'text/css; charset=utf-8']],
  ['/script.js', ['script.js', 'text/javascript; charset=utf-8']],
  ['/favicon.svg', ['favicon.svg', 'image/svg+xml']]
]);

function json(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(payload));
}

async function lerJson(req) {
  let texto = '';
  for await (const bloco of req) {
    texto += bloco.toString('utf8');
    if (Buffer.byteLength(texto, 'utf8') > 32_768) throw new ErroEntrada('JSON acima de 32 KB; use um documento menor.');
  }
  try { return JSON.parse(texto); }
  catch { throw new ErroEntrada('JSON inválido.'); }
}

function idMongo(texto) {
  const id = interpretarId(texto);
  return id.tipo === 'numero' ? id.valor : new ObjectId(id.valor);
}

async function iniciar() {
  const client = new MongoClient(URI, { serverSelectionTimeoutMS: 8000 });
  await client.connect();
  const db = client.db(DB_NAME);
  await db.command({ ping: 1 });
  const clientes = db.collection('clientes');
  const pedidos = db.collection('pedidos');

  const servidor = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      const rota = url.pathname;

      if (req.method === 'GET' && rota === '/api/health') {
        return json(res, 200, { conectado: true, banco: DB_NAME, origem: ORIGEM });
      }
      if (req.method === 'GET' && rota === '/api/clientes') {
        const docs = await clientes.find({}).sort({ nome: 1 }).limit(500).toArray();
        return json(res, 200, docs);
      }
      if (req.method === 'GET' && rota === '/api/pedidos') {
        const docs = await pedidos.find({}).sort({ _id: 1 }).limit(500).toArray();
        return json(res, 200, docs);
      }
      if (req.method === 'POST' && rota === '/api/clientes') {
        const novoCliente = montarCliente(await lerJson(req));
        // MongoDB gera ObjectId; os registros originais podem continuar com IDs numéricos.
        const resultado = await clientes.insertOne(novoCliente);
        return json(res, 201, { mensagem: 'Cliente cadastrado!', id: resultado.insertedId.toString() });
      }
      const matchCliente = /^\/api\/clientes\/([^/]+)$/.exec(rota);
      if (matchCliente && req.method === 'PUT') {
        const filtro = { _id: idMongo(matchCliente[1]) };
        const anterior = await clientes.findOne(filtro);
        if (!anterior) return json(res, 404, { erro: 'Cliente não encontrado.' });
        const novo = montarCliente(await lerJson(req));
        const remover = camposRemovidos(anterior, novo);
        const operacao = { $set: novo };
        if (Object.keys(remover).length) operacao.$unset = remover;
        await clientes.updateOne(filtro, operacao);
        return json(res, 200, { mensagem: 'Cliente atualizado!' });
      }
      if (matchCliente && req.method === 'DELETE') {
        const resultado = await clientes.deleteOne({ _id: idMongo(matchCliente[1]) });
        if (!resultado.deletedCount) return json(res, 404, { erro: 'Cliente não encontrado.' });
        return json(res, 200, { mensagem: 'Cliente excluído!' });
      }

      if (req.method === 'GET' && ARQUIVOS.has(rota)) {
        const [arquivo, contentType] = ARQUIVOS.get(rota);
        const conteudo = await readFile(path.join(PASTA_PUBLIC, arquivo));
        res.writeHead(200, { 'Content-Type': contentType, 'X-Content-Type-Options': 'nosniff' });
        return res.end(conteudo);
      }
      return json(res, 404, { erro: 'Rota não encontrada.' });
    } catch (error) {
      const status = error.status || (error.code === 11000 ? 409 : 500);
      if (status === 500) console.error('Erro no servidor:', error.message);
      return json(res, status, { erro: status === 500 ? 'Erro interno. Verifique o terminal do Node.js.' : error.message });
    }
  });

  servidor.listen(PORT, '127.0.0.1', () => {
    console.log('\n  CRUD MongoDB — Aula\n');
    console.log(`  Abra:   http://localhost:${PORT}`);
    console.log(`  Banco:  ${DB_NAME}`);
    console.log(`  Origem: ${ORIGEM}`);
    console.log('\n  Para encerrar: Ctrl+C\n');
  });
  async function encerrar() {
    servidor.close();
    await client.close();
    process.exit(0);
  }
  process.on('SIGINT', encerrar);
  process.on('SIGTERM', encerrar);
}

iniciar().catch(error => {
  console.error('\nNão foi possível conectar ao MongoDB.');
  console.error('Verifique se o servidor local está ligado ou se o Atlas aceita seu IP/usuário.');
  console.error('Detalhe:', error.message);
  process.exitCode = 1;
});
