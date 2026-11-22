//Arquivo controller para gerenciar as operações relacionadas à tabela "pedidos"

const db = require("../database/connection"); // Importa a conexão com o banco de dados usando o Knex

async function listar(req, res) { // Função para listar os pedidos com base nos filtros de limite, deslocamento e nome do aluno
  try {
    const limit = req.query.limit !== undefined ? Number(req.query.limit) : 10; // Define o limite de registros a serem retornados, padrão é 10
    const offset = req.query.offset !== undefined ? Number(req.query.offset) : 0;
    const { aluno_nome } = req.query;

    if (!Number.isInteger(limit) || limit <= 0 || !Number.isInteger(offset) || offset < 0) { // Valida os parâmetros limit e offset, garantindo que sejam inteiros positivos
      return res.status(400).json({
        error: "Parâmetros 'limit' (inteiro > 0) e 'offset' (inteiro >= 0) são obrigatórios e válidos.",
      });
    }

    const query = db("pedidos") // Inicia a consulta na tabela "pedidos"
      .join("produtos", "pedidos.produto_id", "produtos.id")
      .select(
        "pedidos.id",
        "pedidos.aluno_nome",
        "pedidos.produto_id",
        "produtos.nome as produto_nome",
        "pedidos.quantidade",
        "pedidos.valor_total",
        "pedidos.created_at",
        "pedidos.updated_at"
      );

    if (aluno_nome && aluno_nome.trim()) { // Se o parâmetro aluno_nome for fornecido e não estiver vazio, adiciona um filtro à consulta para buscar pedidos cujo nome do aluno contenha a string fornecida (case-insensitive)
      query.where("pedidos.aluno_nome", "like", `%${aluno_nome.trim()}%`);
    }

    const pedidos = await query // Executa a consulta, ordenando os resultados pelo ID do pedido em ordem crescente, aplicando o limite e o deslocamento definidos
      .orderBy("pedidos.id", "asc")
      .limit(limit)
      .offset(offset);

    return res.status(200).json(pedidos);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao listar pedidos." });
  }
}

async function buscarPorId(req, res) { // Função para buscar um pedido específico pelo ID
  try {
    const id = Number(req.params.id); // Converte o parâmetro de rota para número
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "ID de pedido inválido." });
    }

    const pedido = await db("pedidos") // Inicia a consulta na tabela "pedidos"
      .join("produtos", "pedidos.produto_id", "produtos.id")
      .select(
        "pedidos.id",
        "pedidos.aluno_nome",
        "pedidos.produto_id",
        "produtos.nome as produto_nome",
        "pedidos.quantidade",
        "pedidos.valor_total",
        "pedidos.created_at",
        "pedidos.updated_at"
      )
      .where("pedidos.id", id) 
      .first();

    if (!pedido) {
      return res.status(404).json({ error: "Pedido não encontrado." });
    }

    return res.status(200).json(pedido);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao buscar pedido." });
  }
}

async function criar(req, res) { // Função para criar um novo pedido, aplicando as regras de negócio definidas (R1, R2, R3, R4)
  try {
    const { aluno_nome, produto_id, quantidade } = req.body;
    // valor_total enviado pelo cliente é propositalmente ignorado (Regra R1)

    const prodId = Number(produto_id);
    const qtd = Number(quantidade);

    if ( // Validação dos parâmetros obrigatórios e tipos corretos
      !aluno_nome ||
      typeof aluno_nome !== "string" ||
      !aluno_nome.trim() ||
      !Number.isInteger(prodId) ||
      prodId <= 0 ||
      !Number.isInteger(qtd) ||
      qtd < 1
    ) {
      return res.status(400).json({
        error: "Informe aluno_nome, produto_id válido e quantidade mínima de 1.",
      });
    }

    const resultado = await db.transaction(async (trx) => { // Inicia uma transação para garantir que todas as operações sejam atômicas
      const produto = await trx("produtos")
        .select("id", "nome", "preco", "estoque", "ativo")
        .where("id", prodId)
        .first();

      if (!produto) {
        return { erro: { status: 404, message: "Produto não encontrado." } };
      }

      // Regra R4: produto inativo não vende
      if (!produto.ativo) {
        return { erro: { status: 400, message: "Produto inativo não pode ser vendido." } };
      }

      // Regra R2: estoque controla a venda
      if (produto.estoque < qtd) {
        return {
          erro: {
            status: 409,
            message: `Estoque insuficiente. Disponível: ${produto.estoque}, solicitado: ${qtd}.`,
          },
        };
      }

      // Regra R1: preço vem do banco e valor_total é calculado pela API
      const valorTotal = (Number(produto.preco) * qtd).toFixed(2);

      // Regra R3: debita estoque na criação
      await trx("produtos")
        .where("id", prodId)
        .decrement("estoque", qtd);

      const [pedidoCriado] = await trx("pedidos") // Insere o novo pedido na tabela "pedidos" e retorna os campos especificados
        .insert({
          aluno_nome: aluno_nome.trim(),
          produto_id: prodId,
          quantidade: qtd,
          valor_total: valorTotal,
        })
        .returning([
          "id",
          "aluno_nome",
          "produto_id",
          "quantidade",
          "valor_total",
          "created_at",
          "updated_at",
        ]);

      return {
        pedido: {
          ...pedidoCriado,
          produto_nome: produto.nome,
        },
      };
    });

    if (resultado.erro) {
      return res.status(resultado.erro.status).json({ error: resultado.erro.message });
    }

    return res.status(201).json(resultado.pedido);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao criar pedido." });
  }
}

async function remover(req, res) { // Função para remover um pedido, aplicando a regra de negócio R3 (devolver quantidade ao estoque)
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "ID de pedido inválido." });
    }

    const resultado = await db.transaction(async (trx) => { // Inicia uma transação para garantir que todas as operações sejam atômicas
      const pedido = await trx("pedidos")
        .select("id", "produto_id", "quantidade")
        .where("id", id)
        .first();

      if (!pedido) {
        return { naoEncontrado: true };
      }

      // Regra R3: devolve quantidade ao estoque ao cancelar/deletar pedido
      await trx("produtos")
        .where("id", pedido.produto_id)
        .increment("estoque", pedido.quantidade);

      await trx("pedidos").where("id", id).del();

      return { ok: true };
    });

    if (resultado.naoEncontrado) {
      return res.status(404).json({ error: "Pedido não encontrado." });
    }

    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: "Erro ao remover pedido." });
  }
}

module.exports = {
  listar,
  buscarPorId,
  criar,
  remover,
};