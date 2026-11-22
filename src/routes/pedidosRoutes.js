// Arquivo de rotas para pedidos, definindo os endpoints e associando-os aos métodos do controller correspondente

const express = require("express"); // Importa o módulo Express para criar rotas e gerenciar requisições HTTP
const pedidosController = require("../controllers/pedidosController"); // Importa o controller de pedidos, que contém as funções para lidar com as operações relacionadas à tabela "pedidos"

const router = express.Router();

router.get("/", pedidosController.listar);
router.get("/:id", pedidosController.buscarPorId);
router.post("/", pedidosController.criar);
router.delete("/:id", pedidosController.remover);

module.exports = router;