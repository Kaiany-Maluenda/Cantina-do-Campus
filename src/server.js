// Arquivo principal do servidor, responsável por configurar e iniciar a aplicação Express

const express = require("express"); // Importa o módulo Express para criar o servidor e gerenciar rotas e requisições HTTP
const produtosRoutes = require("./routes/produtosRoutes"); // Importa as rotas relacionadas aos produtos, definidas no arquivo produtosRoutes.js
const pedidosRoutes = require("./routes/pedidosRoutes"); // Importa as rotas relacionadas aos pedidos, definidas no arquivo pedidosRoutes.js
const relatoriosRoutes = require("./routes/relatoriosRoutes"); // Importa as rotas relacionadas aos relatórios, definidas no arquivo relatoriosRoutes.js

const app = express(); // Cria uma instância do aplicativo Express, que será usada para configurar o servidor e definir as rotas e middlewares
const PORT = process.env.PORT || 3000; // Define a porta em que o servidor irá escutar

app.use(express.json()); // Middleware para habilitar o parsing de requisições com corpo em formato JSON, permitindo que os dados enviados pelo cliente sejam acessados no servidor

app.use("/api/produtos", produtosRoutes);
app.use("/api/pedidos", pedidosRoutes);
app.use("/api/relatorios", relatoriosRoutes);

app.listen(PORT, () => {
  console.log(`Servidor da cantina rodando em http://localhost:${PORT}`);
});