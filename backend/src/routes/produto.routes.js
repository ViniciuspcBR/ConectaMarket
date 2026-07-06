// src/routes/produto.routes.js
const router = require("express").Router();
const { listar, buscarPorId, criar, criarLote, atualizar, remover } = require("../controllers/produto.controller");
const { authMiddleware, autorizar, authOpcional } = require("../middlewares/auth.middleware");

const VENDEDOR = ["LOJISTA","FORNECEDOR","EMPREENDEDOR","ADMINISTRADOR"];

router.get("/",       authOpcional, listar);
router.get("/:id",    buscarPorId);
router.post("/lote",  authMiddleware, autorizar(...VENDEDOR), criarLote);
router.post("/",      authMiddleware, autorizar(...VENDEDOR), criar);
router.put("/:id",    authMiddleware, autorizar(...VENDEDOR), atualizar);
router.delete("/:id", authMiddleware, autorizar(...VENDEDOR), remover);

module.exports = router;
