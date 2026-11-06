import { MongoClient } from 'mongodb';
import { clientesExemplo, pedidosExemplo } from './dados-exemplo.js';

const URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.DB_NAME || 'sistema_pedidos';
const client = new MongoClient(URI, { serverSelectionTimeoutMS: 8000 });

async function inserirSeFaltar(colecao, docs) {
  let inseridos = 0;
  for (const doc of docs) {
    const resultado = await colecao.updateOne(
      { _id: doc._id },
      { $setOnInsert: doc },
      { upsert: true }
    );
    if (resultado.upsertedCount) inseridos++;
  }
  return inseridos;
}

try {
  await client.connect();
  const db = client.db(DB_NAME);
  console.log(`Conectado ao banco: ${DB_NAME}`);
  const adicionadosClientes = await inserirSeFaltar(db.collection('clientes'), clientesExemplo);
  const adicionadosPedidos = await inserirSeFaltar(db.collection('pedidos'), pedidosExemplo);
  console.log(`Clientes: ${adicionadosClientes} adicionados; ${clientesExemplo.length - adicionadosClientes} já existiam.`);
  console.log(`Pedidos: ${adicionadosPedidos} adicionados; ${pedidosExemplo.length - adicionadosPedidos} já existiam.`);
  console.log('Concluído. Nenhum registro existente foi substituído.');
  console.log('Nota: pedido 112 referencia cliente_id 1, não fornecido na lista de clientes.');
} catch (error) {
  console.error('Falha ao preparar os dados:', error.message);
  process.exitCode = 1;
} finally {
  await client.close();
}
