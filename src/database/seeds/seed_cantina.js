//Arquivo de seed para popular a tabela "produtos" e "pedidos" com dados iniciais

exports.seed = async function (knex) {  // Função para popular as tabelas "produtos" e "pedidos" com dados iniciais
  // Deleta todos os registros existentes nas tabelas "pedidos" e "produtos"
  await knex("pedidos").del(); 
  await knex("produtos").del();

  const produtosInseridos = await knex("produtos") //inserir os produtos na tabela "produtos" e retornar os registros inseridos
    .insert([
      { nome: "Coxinha de Frango", categoria: "Salgados", preco: 6.5, estoque: 25, ativo: true },
      { nome: "Pastel de Carne", categoria: "Salgados", preco: 7.0, estoque: 18, ativo: true },
      { nome: "Pão de Queijo", categoria: "Salgados", preco: 4.5, estoque: 40, ativo: true },
      { nome: "Suco Natural de Laranja", categoria: "Bebidas", preco: 5.5, estoque: 20, ativo: true },
      { nome: "Refrigerante Lata", categoria: "Bebidas", preco: 5.0, estoque: 30, ativo: true },
      { nome: "Café Expresso", categoria: "Bebidas", preco: 4.0, estoque: 15, ativo: true },
      { nome: "Torta de Limão", categoria: "Sobremesas", preco: 8.0, estoque: 10, ativo: false }
    ])
    .returning(["id", "nome", "preco"]);

  const porNome = Object.fromEntries(produtosInseridos.map((p) => [p.nome, p])); // Cria um objeto com os produtos inseridos, onde a chave é o nome do produto e o valor é o registro do produto

  await knex("pedidos").insert([ // Insere os pedidos na tabela "pedidos"
    {
      aluno_nome: "Ana Silva",
      produto_id: porNome["Coxinha de Frango"].id,
      quantidade: 2,
      valor_total: Number(porNome["Coxinha de Frango"].preco) * 2,
      created_at: "2026-11-10 09:30:00",
      updated_at: "2026-11-10 09:30:00"
    },
    {
      aluno_nome: "Bruno Costa",
      produto_id: porNome["Suco Natural de Laranja"].id,
      quantidade: 1,
      valor_total: Number(porNome["Suco Natural de Laranja"].preco) * 1,
      created_at: "2026-11-12 10:15:00",
      updated_at: "2026-11-12 10:15:00"
    },
    {
      aluno_nome: "Carla Dias",
      produto_id: porNome["Pastel de Carne"].id,
      quantidade: 3,
      valor_total: Number(porNome["Pastel de Carne"].preco) * 3,
      created_at: "2026-11-15 14:00:00",
      updated_at: "2026-11-15 14:00:00"
    },
    {
      aluno_nome: "Ana Silva",
      produto_id: porNome["Café Expresso"].id,
      quantidade: 2,
      valor_total: Number(porNome["Café Expresso"].preco) * 2,
      created_at: "2026-11-18 08:20:00",
      updated_at: "2026-11-18 08:20:00"
    },
    {
      aluno_nome: "Diego Melo",
      produto_id: porNome["Refrigerante Lata"].id,
      quantidade: 2,
      valor_total: Number(porNome["Refrigerante Lata"].preco) * 2,
      created_at: "2026-11-21 19:10:00",
      updated_at: "2026-11-21 19:10:00"
    }
  ]);
};
