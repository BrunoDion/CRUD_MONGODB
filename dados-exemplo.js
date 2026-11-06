// Transcrição da base enviada para a aula. IDs originais preservados.
// O cliente _id: 1 não está nesta lista porque não foi fornecido;
// o pedido 112 permanece com cliente_id: 1, como no material original.
export const clientesExemplo = [
  { _id: 2, nome: 'Maria Oliveira', cidade: 'Guarapuava', telefone: '(42) 99999-0002', email: 'maria@example.com', endereco: { bairro: 'Centro', numero: 120 } },
  { _id: 3, nome: 'Carlos Mendes', cidade: 'Curitiba', email: 'carlos@example.com' },
  { _id: 4, nome: 'Ana Souza', cidade: 'Ponta Grossa', telefone: '(42) 99999-0004', enderecos: [{ tipo: 'residencial', bairro: 'Centro' }, { tipo: 'comercial', bairro: 'Uvaranas' }] },
  { _id: 5, nome: 'Pedro Costa', cidade: 'Guarapuava', telefone: '(42) 99999-0005', empresa: { nome: 'Costa Reformas', ramo: 'Construção civil' } },
  { _id: 6, nome: 'Julia Fernandes', cidade: 'Cascavel', tags: ['cliente frequente', 'indicacao'] },
  { _id: 7, nome: 'Ricardo Lima', cidade: 'Toledo', telefone: '(45) 99999-0007', preferencias: { contato: 'WhatsApp', periodo: 'manha' } },
  { _id: 8, nome: 'Beatriz Ribeiro', cidade: 'Guarapuava', email: 'beatriz@example.com', observacoes: 'Prefere retirada na loja' },
  { _id: 9, nome: 'Felipe Almeida', cidade: 'Curitiba', telefone: '(41) 99999-0009', ativo: false },
  { _id: 10, nome: 'Camila Rocha', cidade: 'Pato Branco', telefone: '(46) 99999-0010', email: 'camila@example.com', redes_sociais: { instagram: '@camila_exemplo' } },
  { _id: 11, nome: 'Rafael Martins', cidade: 'Guarapuava', telefones: ['(42) 99999-0011', '(42) 98888-0011'] }
];

export const pedidosExemplo = [
  { _id: 102, cliente_id: 2, status: 'Pendente', data: new Date('2026-10-24T12:00:00Z'), itens: [{ produto: 'Tinta Acrilica 18L', quantidade: 1, preco: 145 }, { produto: 'Rolo de pintura', quantidade: 2, preco: 18 }], total: 181, pagamento: { forma: 'PIX', pago: false } },
  { _id: 103, cliente_id: 3, status: 'Entregue', data: new Date('2026-10-24T12:00:00Z'), itens: [{ produto: 'Lixa', quantidade: 3, preco: 8 }, { produto: 'Fita crepe', quantidade: 2, preco: 12 }], total: 48 },
  { _id: 104, cliente_id: 4, status: 'Aprovado', data: new Date('2026-10-25T12:00:00Z'), itens: [{ produto: 'Massa corrida', quantidade: 2, preco: 62 }, { produto: 'Espatula', quantidade: 1, preco: 22 }], total: 146, entrega: { tipo: 'delivery', cidade: 'Ponta Grossa' } },
  { _id: 105, cliente_id: 5, status: 'Pendente', data: new Date('2026-10-25T12:00:00Z'), itens: [{ produto: 'Furadeira', quantidade: 1, preco: 390 }, { produto: 'Broca', quantidade: 1, preco: 45 }], total: 435, prioridade: 'alta' },
  { _id: 106, cliente_id: 6, status: 'Entregue', data: new Date('2026-10-26T12:00:00Z'), itens: [{ produto: 'Tinta esmalte', quantidade: 4, preco: 75 }], total: 300, avaliacao: 5 },
  { _id: 107, cliente_id: 7, status: 'Aprovado', data: new Date('2026-10-26T12:00:00Z'), itens: [{ produto: 'Selador', quantidade: 1, preco: 95 }, { produto: 'Rolo de pintura', quantidade: 2, preco: 20 }], total: 135, observacao: 'Separar mercadoria para retirada' },
  { _id: 108, cliente_id: 8, status: 'Pendente', data: new Date('2026-10-27T12:00:00Z'), itens: [{ produto: 'Cimento', quantidade: 6, preco: 38 }, { produto: 'Argamassa', quantidade: 2, preco: 29 }], total: 286 },
  { _id: 109, cliente_id: 9, status: 'Cancelado', data: new Date('2026-10-27T12:00:00Z'), itens: [{ produto: 'Serra eletrica', quantidade: 1, preco: 280 }, { produto: 'Disco de corte', quantidade: 1, preco: 35 }], total: 315, motivo_cancelamento: 'Cliente desistiu da compra' },
  { _id: 110, cliente_id: 10, status: 'Entregue', data: new Date('2026-10-28T12:00:00Z'), itens: [{ produto: 'Piso ceramico (caixa)', quantidade: 3, preco: 69 }, { produto: 'Rejunte', quantidade: 2, preco: 18 }], total: 243, pagamento: { forma: 'cartao', parcelas: 3 } },
  { _id: 111, cliente_id: 11, status: 'Pendente', data: new Date('2026-10-28T12:00:00Z'), itens: [{ produto: 'Lampada LED', quantidade: 2, preco: 25 }, { produto: 'Interruptor', quantidade: 1, preco: 32 }], total: 82 },
  { _id: 112, cliente_id: 1, status: 'Aprovado', data: new Date('2026-10-29T12:00:00Z'), itens: [{ produto: 'Tinta Branca', quantidade: 1, preco: 50 }, { produto: 'Pincel', quantidade: 2, preco: 20 }], total: 90, vendedor: 'Mariana' },
  { _id: 113, cliente_id: 4, status: 'Entregue', data: new Date('2026-10-29T12:00:00Z'), itens: [{ produto: 'Rolo de pintura', quantidade: 2, preco: 28 }, { produto: 'Bandeja', quantidade: 2, preco: 18 }], total: 92, entrega: { tipo: 'retirada', retirado: true } },
  { _id: 114, cliente_id: 6, status: 'Pendente', data: new Date('2026-10-30T12:00:00Z'), itens: [{ produto: 'Escada', quantidade: 1, preco: 240 }, { produto: 'Luva de protecao', quantidade: 2, preco: 15 }], total: 270, tags: ['obra', 'urgente'] },
  { _id: 115, cliente_id: 2, status: 'Aprovado', data: new Date('2026-10-30T12:00:00Z'), itens: [{ produto: 'Lixa', quantidade: 5, preco: 7 }, { produto: 'Tinta spray', quantidade: 1, preco: 38 }], total: 73 },
  { _id: 116, cliente_id: 10, status: 'Entregue', data: new Date('2026-10-31T12:00:00Z'), itens: [{ produto: 'Cabo eletrico (rolo)', quantidade: 2, preco: 110 }, { produto: 'Tomada', quantidade: 3, preco: 25 }], total: 295, pagamento: { forma: 'boleto', pago: true }, observacao: 'Entregue no endereco comercial' }
];
