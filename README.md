# Cantina do Campus — API Back-End

API REST desenvolvida para o **Trabalho Prático — Cantina ULBRA API** (Disciplina: Desenvolvimento Back-End — Aula 6 | Professor: Victor Costa Melo | ULBRA). O sistema gerencia produtos, pedidos e relatórios da cantina do campus, garantindo regras de negócio, integridade referencial e atomicidade nas operações de estoque.

## Integrantes da Dupla

* **Kaiany Moraes Maluenda**
* **Mauro Guilherme Minossi**

## Tecnologias Utilizadas

* **Node.js**
* **Express** (`^5.3.0`) com rotas isoladas via `express.Router()`
* **Knex.js** (`^3.3.0`) como Query Builder, migrations, seeds e transações
* **SQLite3** (`^6.0.1`) como banco de dados relacional local

## Instalação das Dependências

Na raiz do projeto, instale as dependências com:

```bash
npm install

___________________________________________________________________

Configuração do Banco de Dados (Migrations e Seed)

Criar as tabelas (produtos e pedidos):
npx knex migrate:latest

Popular o banco com dados iniciais:
npx knex seed:run

___________________________________________________________________

Com o banco criado e populado, inicie a aplicação na porta 3000 (ou na porta definida em process.env.PORT):

node server.js

(O servidor ficará disponível em http://localhost:3000)

___________________________________________________________________

