// src/routes/fornecedor.routes.js
const router = require("express").Router();
const { listar, buscarPorId, criar, atualizar } = require("../controllers/fornecedor.controller");
const { authMiddleware, autorizar } = require("../middlewares/auth.middleware");

router.get("/",    listar);
router.get("/:id", buscarPorId);
router.post("/",   authMiddleware, autorizar("FORNECEDOR","ADMINISTRADOR"), criar);
router.put("/:id", authMiddleware, autorizar("FORNECEDOR","ADMINISTRADOR"), atualizar);

module.exports = router;
