// src/routes/campanha.routes.js
const router = require("express").Router();
const { listar, listarMinhas, criar, atualizar } = require("../controllers/campanha.controller");
const { authMiddleware, autorizar } = require("../middlewares/auth.middleware");

const PERMITIDO = autorizar("ADMINISTRADOR","LOJISTA","FORNECEDOR","EMPREENDEDOR");

router.get("/minhas", authMiddleware, PERMITIDO, listarMinhas);
router.get("/",       listar);
router.post("/",      authMiddleware, PERMITIDO, criar);
router.put("/:id",    authMiddleware, PERMITIDO, atualizar);

module.exports = router;
