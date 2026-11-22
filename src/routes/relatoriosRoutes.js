// Arquivo de rotas para relatórios, definindo os endpoints e associando-os aos métodos do controller correspondente

const express = require("express"); // Importa o módulo Express para criar rotas e gerenciar requisições HTTP
const relatoriosController = require("../controllers/relatoriosController"); // Importa o controller de relatórios, que contém as funções para lidar com a geração de relatórios relacionados aos pedidos e produtos

const router = express.Router(); // Cria uma instância do roteador do Express para definir as rotas relacionadas aos relatórios

router.get("/vendas-por-categoria", relatoriosController.vendasPorCategoria);
router.get("/top-produtos", relatoriosController.topProdutos);
router.get("/faturamento", relatoriosController.faturamento);

module.exports = router;