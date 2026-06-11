// src/routes/loja.routes.js
const router = require("express").Router();
const { listar, buscarPorId, criar, atualizar } = require("../controllers/loja.controller");
const { authMiddleware, autorizar } = require("../middlewares/auth.middleware");

router.get("/",    listar);
router.get("/:id", buscarPorId);
router.post("/",   authMiddleware, autorizar("LOJISTA","ADMINISTRADOR"), criar);
router.put("/:id", authMiddleware, autorizar("LOJISTA","ADMINISTRADOR"), atualizar);

module.exports = router;
