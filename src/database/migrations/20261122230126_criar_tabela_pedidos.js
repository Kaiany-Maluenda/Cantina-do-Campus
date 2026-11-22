//Arquivo de migração para criar a tabela "pedidos"

exports.up = function (knex) { // Função para criar a tabela "pedidos"
  return knex.schema.createTable("pedidos", (table) => {
    table.increments("id").primary();
    table.string("aluno_nome", 100).notNullable();
    table
      .integer("produto_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("produtos");
    table.integer("quantidade").notNullable(); 
    table.decimal("valor_total", 8, 2).notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) { // Função para desfazer a criação da tabela "pedidos"
  return knex.schema.dropTableIfExists("pedidos");
};