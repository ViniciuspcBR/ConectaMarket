// src/routes/avaliacao.routes.js
const router = require("express").Router();
const { criar, listarPorProduto } = require("../controllers/avaliacao.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

router.get("/produto/:produtoId", listarPorProduto);
router.post("/",                  authMiddleware, criar);

module.exports = router;
