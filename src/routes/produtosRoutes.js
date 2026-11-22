// Arquivo de rotas para produtos, definindo os endpoints e associando-os aos métodos do controller correspondente

const express = require("express"); // Importa o módulo Express para criar rotas e gerenciar requisições HTTP
const produtosController = require("../controllers/produtosController"); // Importa o controller de produtos, que contém as funções para lidar com as operações relacionadas à tabela "produtos"

const router = express.Router(); // Cria uma instância do roteador do Express para definir as rotas relacionadas aos produtos

router.get("/", produtosController.listar); 
router.get("/:id", produtosController.buscarPorId);
router.post("/", produtosController.criar);
router.put("/:id", produtosController.atualizar);
router.delete("/:id", produtosController.remover);

module.exports = router;