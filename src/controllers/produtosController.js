//Arquivo controller para gerenciar as operações relacionadas à tabela "produtos"

const db = require("../database/connection"); // Importa a conexão com o banco de dados usando o Knex

async function listar(req, res) { // Função para listar os produtos com base nos filtros de categoria e status ativo    
  try {
    const { categoria, ativo } = req.query;
    const query = db("produtos").select(
      "id",
      "nome",
      "categoria",
      "preco",
      "estoque",
      "ativo"
    );

    if (categoria) {
      query.where("categoria", categoria);
    }

    if (ativo !== undefined) {
      if (ativo === "true" || ativo === "1") {
        query.where("ativo", true);
      } else if (ativo === "false" || ativo === "0") {
        query.where("ativo", false);
      } else {
        return res.status(400).json({ error: "Parâmetro 'ativo' inválido. Use true ou false." });
      }
    }

    const produtos = await query.orderBy("id", "asc"); // Ordena os resultados pelo ID do produto em ordem crescente
    return res.status(200).json(produtos);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao listar produtos." });
  }
}

async function buscarPorId(req, res) { // Função para buscar um produto específico pelo ID
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "ID de produto inválido." });
    }

    const produto = await db("produtos") // Inicia a consulta na tabela "produtos"
      .select("id", "nome", "categoria", "preco", "estoque", "ativo")
      .where("id", id)
      .first();

    if (!produto) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }

    return res.status(200).json(produto);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao buscar produto." });
  }
}

async function criar(req, res) { // Função para criar um novo produto, aplicando as regras de negócio definidas (R5)
  try {
    const { nome, categoria, preco, estoque, ativo } = req.body;

    if (
      !nome ||
      typeof nome !== "string" ||
      !nome.trim() ||
      !categoria ||
      typeof categoria !== "string" ||
      !categoria.trim() ||
      preco === undefined ||
      estoque === undefined
    ) {
      return res.status(400).json({
        error: "Campos obrigatórios: nome, categoria, preco e estoque.",
      });
    }

    const precoNum = Number(preco);
    const estoqueNum = Number(estoque);

    if (Number.isNaN(precoNum) || precoNum <= 0) {
      return res.status(400).json({ error: "Preço deve ser um número maior que zero." });
    }

    if (!Number.isInteger(estoqueNum) || estoqueNum < 0) {
      return res.status(400).json({ error: "Estoque deve ser um inteiro maior ou igual a zero." });
    }

    const nomeLimpo = nome.trim();
    const categoriaLimpa = categoria.trim();

    const existente = await db("produtos") // Verifica se já existe um produto com o mesmo nome
      .select("id")
      .where("nome", nomeLimpo)
      .first();

    if (existente) {
      return res.status(409).json({ error: "Já existe um produto cadastrado com esse nome." });
    }

    const [criado] = await db("produtos") // Insere o novo produto na tabela "produtos" e retorna os campos especificados
      .insert({
        nome: nomeLimpo,
        categoria: categoriaLimpa,
        preco: precoNum.toFixed(2),
        estoque: estoqueNum,
        ativo: ativo !== undefined ? Boolean(ativo) : true,
      })
      .returning(["id", "nome", "categoria", "preco", "estoque", "ativo"]);

    return res.status(201).json(criado);
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT" || err.code === "23505") {
      return res.status(409).json({ error: "Nome de produto duplicado." });
    }
    return res.status(500).json({ error: "Erro ao criar produto." });
  }
}

async function atualizar(req, res) { // Função para atualizar os dados de um produto existente, aplicando as regras de negócio definidas (R5)
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "ID de produto inválido." });
    }

    const atual = await db("produtos").where("id", id).first(); // Verifica se o produto existe antes de tentar atualizar
    if (!atual) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }

    const { nome, categoria, preco, estoque, ativo } = req.body; // Extrai os campos enviados no corpo da requisição para atualização
    const dadosAtualizar = {};

    if (nome !== undefined) { // Valida o campo "nome" se ele foi enviado para atualização
      if (typeof nome !== "string" || !nome.trim()) {
        return res.status(400).json({ error: "Nome inválido." });
      }
      const nomeLimpo = nome.trim();
      const duplicado = await db("produtos")
        .select("id")
        .where("nome", nomeLimpo)
        .andWhereNot("id", id)
        .first();

      if (duplicado) {
        return res.status(409).json({ error: "Já existe outro produto com esse nome." });
      }
      dadosAtualizar.nome = nomeLimpo;
    }

    if (categoria !== undefined) {
      if (typeof categoria !== "string" || !categoria.trim()) {
        return res.status(400).json({ error: "Categoria inválida." });
      }
      dadosAtualizar.categoria = categoria.trim();
    }

    if (preco !== undefined) {
      const precoNum = Number(preco);
      if (Number.isNaN(precoNum) || precoNum <= 0) {
        return res.status(400).json({ error: "Preço inválido." });
      }
      dadosAtualizar.preco = precoNum.toFixed(2);
    }

    if (estoque !== undefined) {
      const estoqueNum = Number(estoque);
      if (!Number.isInteger(estoqueNum) || estoqueNum < 0) {
        return res.status(400).json({ error: "Estoque não pode ser negativo." });
      }
      dadosAtualizar.estoque = estoqueNum;
    }

    if (ativo !== undefined) {
      dadosAtualizar.ativo = Boolean(ativo);
    }

    if (Object.keys(dadosAtualizar).length === 0) {
      return res.status(400).json({ error: "Nenhum campo válido enviado para atualização." });
    }

    const [atualizado] = await db("produtos")
      .where("id", id)
      .update(dadosAtualizar)
      .returning(["id", "nome", "categoria", "preco", "estoque", "ativo"]);

    return res.status(200).json(atualizado);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao atualizar produto." });
  }
}

async function remover(req, res) { // Função para remover um produto, aplicando a regra de negócio R5 (não remover produtos com pedidos vinculados)
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "ID de produto inválido." });
    }

    const produto = await db("produtos").select("id").where("id", id).first();
    if (!produto) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }

    // Regra R5: não deletar produto com histórico de pedidos
    const pedidoVinculado = await db("pedidos")
      .select("id")
      .where("produto_id", id)
      .first();

    if (pedidoVinculado) {
      return res.status(409).json({
        error: "Não é possível remover produto que possui pedidos vinculados.",
      });
    }

    await db("produtos").where("id", id).del(); // Remove o produto da tabela "produtos" se não houver pedidos vinculados
    return res.status(204).send();
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT" || err.code === "23503") {
      return res.status(409).json({
        error: "Produto possui vínculo referencial e não pode ser removido.",
      });
    }
    return res.status(500).json({ error: "Erro ao remover produto." });
  }
}

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover,
};