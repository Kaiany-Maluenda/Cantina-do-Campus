// Arquivo controller para gerar relatórios relacionados aos pedidos e produtos

const db = require("../database/connection"); // Importa a conexão com o banco de dados usando o Knex

async function vendasPorCategoria(req, res) {
  try {
    const dados = await db("pedidos")
      .join("produtos", "pedidos.produto_id", "produtos.id")
      .select("produtos.categoria")
      .sum({ total_vendido: "pedidos.valor_total" })
      .sum({ quantidade_itens: "pedidos.quantidade" })
      .count({ total_pedidos: "pedidos.id" })
      .groupBy("produtos.categoria")
      .orderBy("produtos.categoria", "asc");

    return res.status(200).json(dados);
  } catch (err) {
    console.error(err); // Registra o erro detalhado no console do servidor para depuração
    return res.status(500).json({ error: "Erro ao gerar relatório de vendas por categoria." });
  }
}

async function topProdutos(req, res) {
  try {
    const dados = await db("pedidos")
      .join("produtos", "pedidos.produto_id", "produtos.id")
      .select("produtos.id", "produtos.nome")
      .sum({ quantidade_vendida: "pedidos.quantidade" })
      .sum({ total_vendido: "pedidos.valor_total" })
      .groupBy("produtos.id", "produtos.nome")
      .orderBy("quantidade_vendida", "desc")
      .limit(5);

    return res.status(200).json(dados);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao gerar relatório de top produtos." });
  }
}

async function faturamento(req, res) {
  try {
    const { data_inicio, data_fim } = req.query;

    if (!data_inicio || !data_fim) {
      return res.status(400).json({
        error: "Parâmetros obrigatórios: data_inicio e data_fim.",
      });
    }

    const inicio = data_inicio.length === 10 ? `${data_inicio} 00:00:00` : data_inicio;
    const fim = data_fim.length === 10 ? `${data_fim} 23:59:59` : data_fim;

    const [resumo] = await db("pedidos")
      .sum({ faturamento_total: "valor_total" })
      .count({ total_pedidos: "id" })
      .whereBetween("created_at", [inicio, fim]);

    return res.status(200).json({
      data_inicio,
      data_fim,
      faturamento_total: Number(resumo.faturamento_total || 0).toFixed(2),
      total_pedidos: Number(resumo.total_pedidos || 0),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao calcular faturamento por período." });
  }
}

module.exports = {
  vendasPorCategoria,
  topProdutos,
  faturamento,
};
