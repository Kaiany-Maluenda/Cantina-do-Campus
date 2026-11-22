// Arquivo controller para gerar relatórios relacionados aos pedidos e produtos

const db = require("../database/connection"); // Importa a conexão com o banco de dados usando o Knex

async function vendasPorCategoria(req, res) { // Função para gerar relatório de vendas por categoria, incluindo total vendido, quantidade de itens vendidos e total de pedidos por categoria
  try {
    const dados = await db("pedidos") // Inicia a consulta na tabela "pedidos" e realiza um join com a tabela "produtos" para agrupar os resultados por categoria de produto
      .join("produtos", "pedidos.produto_id", "produtos.id") 
      .select(
        "produtos.categoria",
        db.sum("pedidos.valor_total as total_vendido"),
        db.sum("pedidos.quantidade as quantidade_itens"),
        db.count("pedidos.id as total_pedidos")
      )
      .groupBy("produtos.categoria")
      .orderBy("produtos.categoria", "asc");

    return res.status(200).json(dados);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao gerar relatório de vendas por categoria." });
  }
}

async function topProdutos(req, res) { // Função para gerar relatório dos 5 produtos mais vendidos, incluindo quantidade vendida e total vendido
  try {
    const dados = await db("pedidos")
      .join("produtos", "pedidos.produto_id", "produtos.id")
      .select(
        "produtos.id",
        "produtos.nome",
        db.sum("pedidos.quantidade as quantidade_vendida"),
        db.sum("pedidos.valor_total as total_vendido")
      )
      .groupBy("produtos.id", "produtos.nome")
      .orderBy("quantidade_vendida", "desc")
      .limit(5);

    return res.status(200).json(dados);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao gerar relatório de top produtos." });
  }
}

async function faturamento(req, res) { // Função para calcular o faturamento total e o número de pedidos em um período específico, com base nos parâmetros data_inicio e data_fim fornecidos na query string
  try {
    const { data_inicio, data_fim } = req.query;

    if (!data_inicio || !data_fim) {
      return res.status(400).json({
        error: "Parâmetros obrigatórios: data_inicio e data_fim.",
      });
    }

    const [resumo] = await db("pedidos")
      .select(
        db.sum("valor_total as faturamento_total"),
        db.count("id as total_pedidos")
      )
      .whereBetween("created_at", [data_inicio, data_fim]);

    return res.status(200).json({
      data_inicio,
      data_fim,
      faturamento_total: Number(resumo.faturamento_total || 0).toFixed(2),
      total_pedidos: Number(resumo.total_pedidos || 0),
    });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao calcular faturamento por período." });
  }
}

module.exports = {
  vendasPorCategoria,
  topProdutos,
  faturamento,
};