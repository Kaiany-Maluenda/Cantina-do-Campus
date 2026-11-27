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

## *Endpoints da API*

### Produtos (`/api/produtos`)

* **GET `/api/produtos`** — Lista todos os produtos, com filtros opcionais por `categoria` e `ativo` (`true` ou `false`).
  * Requisição: `GET /api/produtos?categoria=Salgados&ativo=true`
  * Resposta (`200 OK`):
    ```json
    [
      {
        "id": 1,
        "nome": "Coxinha de Frango",
        "categoria": "Salgados",
        "preco": "6.50",
        "estoque": 25,
        "ativo": true
      }
    ]
    ```

* **GET `/api/produtos/:id`** — Busca um produto específico pelo `id`. Retorna `404` se não existir.
  * Requisição: `GET /api/produtos/1`
  * Resposta (`200 OK`):
    ```json
    {
      "id": 1,
      "nome": "Coxinha de Frango",
      "categoria": "Salgados",
      "preco": "6.50",
      "estoque": 25,
      "ativo": true
    }
    ```

* **POST `/api/produtos`** — Cadastra um novo produto. Valida campos obrigatórios (`400`) e nome duplicado (`409`).
  * Requisição (`POST /api/produtos`):
    ```json
    {
      "nome": "Empada de Frango",
      "categoria": "Salgados",
      "preco": 6.0,
      "estoque": 15,
      "ativo": true
    }
    ```
  * Resposta (`201 Created`):
    ```json
    {
      "id": 8,
      "nome": "Empada de Frango",
      "categoria": "Salgados",
      "preco": "6.00",
      "estoque": 15,
      "ativo": true
    }
    ```

* **PUT `/api/produtos/:id`** — Atualiza dados de um produto existente, incluindo o campo `ativo`.
  * Requisição (`PUT /api/produtos/7`):
    ```json
    {
      "ativo": true,
      "estoque": 12
    }
    ```
  * Resposta (`200 OK`):
    ```json
    {
      "id": 7,
      "nome": "Torta de Limão",
      "categoria": "Sobremesas",
      "preco": "8.00",
      "estoque": 12,
      "ativo": true
    }
    ```

* **DELETE `/api/produtos/:id`** — Remove um produto sem pedidos vinculados. Retorna `409` se houver histórico de pedidos.
  * Requisição: `DELETE /api/produtos/3`
  * Resposta (`204 No Content`): sem corpo de resposta.

### Pedidos (`/api/pedidos`)

* **GET `/api/pedidos`** — Lista pedidos com paginação obrigatória (`limit` padrão `10`, `offset` padrão `0`) e filtro opcional por `aluno_nome`.
  * Requisição: `GET /api/pedidos?limit=10&offset=0&aluno_nome=Ana`
  * Resposta (`200 OK`):
    ```json
    [
      {
        "id": 1,
        "aluno_nome": "Ana Silva",
        "produto_id": 1,
        "produto_nome": "Coxinha de Frango",
        "quantidade": 2,
        "valor_total": "13.00",
        "created_at": "2026-11-10 09:30:00",
        "updated_at": "2026-11-10 09:30:00"
      }
    ]
    ```

* **GET `/api/pedidos/:id`** — Retorna um pedido específico com o nome do produto via `join`. Retorna `404` se não existir.
  * Requisição: `GET /api/pedidos/1`
  * Resposta (`200 OK`):
    ```json
    {
      "id": 1,
      "aluno_nome": "Ana Silva",
      "produto_id": 1,
      "produto_nome": "Coxinha de Frango",
      "quantidade": 2,
      "valor_total": "13.00",
      "created_at": "2026-11-10 09:30:00",
      "updated_at": "2026-11-10 09:30:00"
    }
    ```

* **POST `/api/pedidos`** — Cria um pedido aplicando as regras **R1**, **R2** e **R4** dentro de uma transação.
  * Requisição (`POST /api/pedidos`):
    ```json
    {
      "aluno_nome": "Lucas Rocha",
      "produto_id": 1,
      "quantidade": 2,
      "valor_total": 999
    }
    ```
  * Resposta (`201 Created`):
    ```json
    {
      "id": 6,
      "aluno_nome": "Lucas Rocha",
      "produto_id": 1,
      "quantidade": 2,
      "valor_total": "13.00",
      "created_at": "2026-11-26 22:00:00",
      "updated_at": "2026-11-26 22:00:00",
      "produto_nome": "Coxinha de Frango"
    }
    ```

* **DELETE `/api/pedidos/:id`** — Cancela/remove um pedido aplicando a regra **R3** (devolve a quantidade ao estoque).
  * Requisição: `DELETE /api/pedidos/1`
  * Resposta (`204 No Content`): sem corpo de resposta.

### Relatórios (`/api/relatorios`)

* **GET `/api/relatorios/vendas-por-categoria`** — Agrupa por `categoria` (`groupBy`) retornando total vendido, quantidade de itens e total de pedidos (`sum` e `count`).
  * Requisição: `GET /api/relatorios/vendas-por-categoria`
  * Resposta (`200 OK`):
    ```json
    [
      {
        "categoria": "Bebidas",
        "total_vendido": 18.5,
        "quantidade_itens": 5,
        "total_pedidos": 3
      }
    ]
    ```

* **GET `/api/relatorios/top-produtos`** — Retorna os 5 produtos mais vendidos ordenados por `quantidade_vendida` decrescente.
  * Requisição: `GET /api/relatorios/top-produtos`
  * Resposta (`200 OK`):
    ```json
    [
      {
        "id": 2,
        "nome": "Pastel de Carne",
        "quantidade_vendida": 3,
        "total_vendido": 21
      }
    ]
    ```

* **GET `/api/relatorios/faturamento`** — Calcula o faturamento e o total de pedidos no intervalo `data_inicio` e `data_fim` via `whereBetween`.
  * Requisição: `GET /api/relatorios/faturamento?data_inicio=2026-11-10&data_fim=2026-11-21`
  * Resposta (`200 OK`):
    ```json
    {
      "data_inicio": "2026-11-10",
      "data_fim": "2026-11-21",
      "faturamento_total": "64.50",
      "total_pedidos": 5
    }
    ```
___________________________________________________________________

# *Uso de Transações com db.transaction()*

No controller de pedidos (pedidosControllers.js), utilizamos db.transaction(async (trx) => { ... }) em duas operações críticas que exigem mais de uma alteração no banco de dados:

Criação de pedido (POST /api/pedidos): consulta o produto, valida se está ativo (ativo = true) e se há estoque suficiente (estoque >= quantidade), calcula valor_total no servidor com base no preço do banco (ignorando qualquer valor_total enviado pelo cliente), debita a quantidade do estoque (decrement) e insere o registro na tabela pedidos.

Remoção/cancelamento de pedido (DELETE /api/pedidos/:id): localiza o pedido, devolve a quantidade ao estoque do produto (increment) e exclui o pedido da tabela pedidos.
