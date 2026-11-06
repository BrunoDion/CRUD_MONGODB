# MongoLab — CRUD MongoDB para aula de Banco de Dados II

**Stack:** HTML, CSS, JavaScript puro, Node.js (HTTP nativo) e driver oficial `mongodb`.
**Sem frameworks:** não usa React, Vue, Express, Laravel nem ORM.
**Banco:** `sistema_pedidos`; coleções `clientes` e `pedidos`.

> Projeto de demonstração **local**, para aprendizado. Não publique a aplicação diretamente na internet: não há autenticação, controle de usuários ou permissões de acesso por usuário.

## 1. Começar no Windows (MongoDB local)

**Pré-requisitos:**
- Node.js **22 ou superior** — https://nodejs.org/
- MongoDB Community Server em execução — https://www.mongodb.com/try/download/community
- Opcional: MongoDB Compass — https://www.mongodb.com/try/download/compass

Abra a pasta do projeto no VS Code, abra **Terminal > Novo Terminal** ou use o CMD nesta pasta. Digite:

```bat
node -v
npm -v
npm install
npm start
```

Abra no navegador **http://localhost:3000**.

Por padrão, o arquivo `.env` já está configurado assim:

```dotenv
MONGODB_URI="mongodb://127.0.0.1:27017"
DB_NAME=sistema_pedidos
PORT=3000
```

Se as coleções já tiverem dados das aulas anteriores, **não precisa rodar o seed**. O projeto lê os registros existentes.

### Se o banco estiver vazio

Com o servidor Node desligado (Ctrl+C) ou num **segundo terminal**, rode:

```bat
npm run seed
```

O comando insere **somente os IDs que ainda não existem**: 10 clientes (IDs 2 a 11) e 15 pedidos (IDs 102 a 116). Não apaga nem substitui documentos já existentes. Depois execute `npm start` (se necessário) e clique em **Atualizar**.

**Observação sobre sua base original:** o pedido de ID 112 referencia `cliente_id: 1`, mas esse cliente **não aparece nos registros fornecidos**. Se já existe na coleção usada durante a aula, o app o exibirá normalmente. O script de exemplo não inventa nem altera esse cliente.

**Atalho para Windows:** `INICIAR_AULA.bat` confere se as dependências existem e inicia o projeto. O `.bat` de seed é opcional: `CARREGAR_DADOS.bat`.

## 2. O que mostrar na aula

### CRUD da coleção `clientes`

| Ação na tela | HTTP (front → Node) | MongoDB (Node → banco) |
|---|---|---|
| Cadastrar cliente | `POST /api/clientes` | `insertOne()` |
| Listar clientes | `GET /api/clientes` | `find()` |
| Editar cliente | `PUT /api/clientes/:id` | `updateOne()` (com `$set` e `$unset`) |
| Excluir cliente | `DELETE /api/clientes/:id` | `deleteOne()` |
| Consultar pedidos | `GET /api/pedidos` | `find()` |

**Como demonstrar a flexibilidade de schema:**

1. Clique em **+ Novo** e cadastre `Lucas Pereira`, cidade `Guarapuava`, sem telefone/e-mail e sem campos extras (`{}`).
2. Cadastre `Mariana Silva`, cidade `Curitiba`. Clique em **+ Tags** e salve com `tags: ["vip", "indicacao"]`.
3. Cadastre `Fernanda Lima`, cidade `Cascavel`. Clique em **+ Empresa** e **+ Preferências**, e salve com ambos os objetos incorporados.
4. Selecione `Mariana Silva`, adicione **+ Endereços** e salve. Mostre que `updateOne()` adicionou um campo novo sem migração/ALTER TABLE.
5. Retire uma chave do JSON de extras e salve novamente. O servidor usa `$unset` para remover esse campo.
6. Abra o **Compass** e atualize a coleção `clientes`: os documentos têm conjuntos de campos diferentes, porém convivem na mesma coleção.
7. Abra a aba **Pedidos**: compare um pedido com `pagamento` com outro que contém `entrega` ou `avaliacao`.

**Pergunta para reflexão:** flexibilidade de schema significa ausência de regras? **Não.** O MongoDB aceita documentos com estruturas distintas por padrão; a aplicação ainda precisa validar, planejar consultas e garantir a qualidade dos dados. Pode-se também configurar regras de validação da coleção no MongoDB.

### Exemplos de JSON para digitar manualmente no campo extra

**Cliente com array:**

```json
{
  "tags": ["frequente", "indicado"],
  "ativo": true
}
```

**Cliente com objeto incorporado:**

```json
{
  "preferencias": {
    "contato": "WhatsApp",
    "periodo": "manha"
  },
  "pontos": 150
}
```

**Cliente com array de documentos incorporados:**

```json
{
  "enderecos": [
    { "tipo": "residencial", "cidade": "Guarapuava" },
    { "tipo": "comercial", "cidade": "Curitiba" }
  ]
}
```

O projeto não exige que todos os clientes tenham essas chaves. Cada registro pode conter extras diferentes.

## 3. Conectar ao MongoDB Atlas (nuvem)

**Atenção:** o Atlas hospeda o **banco de dados**. O Node.js e a página continuam rodando localmente no computador do professor.

1. Abra https://www.mongodb.com/products/platform/atlas-database e crie uma conta, um projeto e um cluster (se disponível, use a opção gratuita).
2. Crie um **usuário de banco de dados** em *Database Access*. Esse usuário é diferente da conta de login do Atlas.
3. Em *Network Access*, permita **o seu IP público atual** (evite liberar `0.0.0.0/0`).
4. No cluster, escolha **Connect > Drivers > Node.js** (os nomes da interface podem variar) e copie a connection string `mongodb+srv://...`.
5. Abra `.env`, substitua apenas `MONGODB_URI` e mantenha `DB_NAME=sistema_pedidos`:

   ```dotenv
   MONGODB_URI="mongodb+srv://USUARIO:SENHA@SEU-CLUSTER.mongodb.net/?retryWrites=true&w=majority"
   DB_NAME=sistema_pedidos
   PORT=3000
   ```

   Troque `USUARIO`, `SENHA` e `SEU-CLUSTER` pelos valores verdadeiros **somente no seu computador**. Use a string exata fornecida pelo Atlas; o exemplo acima é apenas ilustrativo. Se a senha tiver caracteres especiais (como `@`, `#`, `/`), codifique-os no formato de URL. **Não compartilhe o `.env` com senhas.**

6. Se estiver executando `npm start`, encerre com **Ctrl+C** e execute novamente:

   ```bat
   npm run seed
   npm start
   ```

7. Abra **http://localhost:3000**, observe o indicador **MongoDB Atlas / remoto** e compare com os documentos no painel do Atlas ou no Compass conectado ao Atlas.

> **Importante:** trocar `.env` **não migra automaticamente** os dados locais para a nuvem. `npm run seed` insere a base fornecida neste projeto na conexão escolhida, sem sobrescrever IDs existentes.

### Voltar ao MongoDB local

No `.env`, restaure `MONGODB_URI="mongodb://127.0.0.1:27017"`, salve e reinicie `npm start`.

## 4. Estrutura do projeto

```text
crud-mongodb-aula/
├── .env                 # conexão (local por padrão; NÃO compartilhar se colocar senhas)
├── .env.example         # exemplo de conexão
├── .gitignore
├── package.json         # scripts e driver mongodb
├── server.js            # API REST + arquivos estáticos (HTTP nativo)
├── validacao.js         # validações didáticas
├── dados-exemplo.js     # registros enviados para a aula
├── seed.js              # carrega somente documentos ausentes
├── INICIAR_AULA.bat     # atalho Windows
├── CARREGAR_DADOS.bat   # atalho para importar exemplos
├── public/
│   ├── index.html       # página
│   ├── style.css        # visual
│   ├── script.js        # chamadas fetch() e eventos
│   └── favicon.svg
└── tests/
    └── validacao.test.js
```

## 5. Explicação do fluxo para os alunos

```text
Navegador (HTML/CSS/JavaScript)
    |
    | fetch('/api/clientes', { method: 'POST', ... })
    v
Node.js (server.js, HTTP nativo)
    |
    | clientes.insertOne(documento)
    v
MongoDB local OU MongoDB Atlas
    |
    | resposta do driver
    v
Node.js devolve JSON → navegador atualiza a lista
```

**Por que Node.js?** Não se deve conectar ao MongoDB diretamente do navegador: isso exporia credenciais e acesso ao banco. O Node atua como intermediário e aplica validações. O driver oficial `mongodb` é uma biblioteca, não um framework.

**IDs diferentes:** os registros fornecidos têm `_id` numérico; novas inserções via Node geram `_id` do tipo `ObjectId`. O projeto reconhece os dois tipos nos endpoints de edição e exclusão.

**Edição de extras:** o formulário trata nome, cidade, telefone e e-mail separadamente. Os outros campos ficam no textarea JSON. Campos removidos do JSON são removidos do documento com `$unset`; campos novos são adicionados com `$set`.

## 6. Problemas comuns

| Problema | O que conferir |
|---|---|
| `node` ou `npm` não reconhecido | Instale Node.js 22+ e reabra o terminal. |
| `ECONNREFUSED 127.0.0.1:27017` | MongoDB Community Server não está rodando. Confira o serviço no Windows. |
| `No servers found` / `Server selection timed out` no Atlas | IP público na lista de acesso, cluster ativo, conexão e internet. |
| `Authentication failed` | Usuário/senha de **Database Access** e caracteres especiais da senha. |
| A página abre, mas não carrega dados | Confira o terminal do Node; abra **http://localhost:3000**, não `index.html` com duplo clique. |
| Registro aparece no app mas não no Compass | Verifique a mesma conexão, o banco `sistema_pedidos`, a coleção `clientes` e atualize a consulta. |
| `EADDRINUSE` | A porta 3000 está em uso; altere `PORT=3001` em `.env` e abra `http://localhost:3001`. |
| `JSON inválido` | JSON usa aspas duplas; arrays `[ ]`; objetos `{ }`; sem vírgulas finais. |

Teste as validações sem precisar de MongoDB:

```bat
npm test
```

## 7. Referências oficiais

- Driver oficial Node.js: https://www.mongodb.com/docs/drivers/node/current/get-started/
- Atlas - conexão: https://www.mongodb.com/docs/atlas/connect-to-database-deployment/
- Atlas - acesso por IP: https://www.mongodb.com/docs/atlas/security/ip-access-list/
- Node.js - variáveis `.env`: https://nodejs.org/api/environment_variables.html

---
**Projeto desenvolvido para fins didáticos — Banco de Dados II.**
