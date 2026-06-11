// src/routes/pedido.routes.js
const router = require("express").Router();
const { listar, listarExcluidos, buscarPorId, criar, atualizarStatus, excluir } =
  require("../controllers/pedido.controller");
const { authMiddleware, autorizar } = require("../middlewares/auth.middleware");

router.get("/excluidos",      authMiddleware, listarExcluidos);
router.get("/",               authMiddleware, listar);
router.get("/:id",            authMiddleware, buscarPorId);
router.post("/",              authMiddleware, criar);
router.patch("/:id/status",   authMiddleware, autorizar("ADMINISTRADOR","LOJISTA","FORNECEDOR"), atualizarStatus);
router.delete("/:id",         authMiddleware, excluir);

module.exports = router;
