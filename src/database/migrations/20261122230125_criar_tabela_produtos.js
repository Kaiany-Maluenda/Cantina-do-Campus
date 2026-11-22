//arquivo de migração para criar a tabela "produtos"

exports.up = function (knex) { // Função para criar a tabela "produtos"
  return knex.schema.createTable("produtos", (table) => {
    table.increments("id").primary();
    table.string("nome", 80).notNullable().unique();
    table.string("categoria", 30).notNullable();
    table.decimal("preco", 8, 2).notNullable();
    table.integer("estoque").notNullable();
    table.boolean("ativo").notNullable().defaultTo(true);
  });
};

exports.down = function (knex) { // Função para desfazer a criação da tabela "produtos"
  return knex.schema.dropTableIfExists("produtos");
};
