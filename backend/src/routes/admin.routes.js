// src/routes/admin.routes.js
const router = require("express").Router();
const ctrl = require("../controllers/admin.controller");
const { authMiddleware, autorizar } = require("../middlewares/auth.middleware");

const ADMIN = autorizar("ADMINISTRADOR");

router.get("/resumo",           authMiddleware, ADMIN, ctrl.resumo);
router.get("/usuarios",         authMiddleware, ADMIN, ctrl.listarUsuarios);
router.put("/usuarios/:id",     authMiddleware, ADMIN, ctrl.atualizarUsuario);
router.delete("/usuarios/:id",  authMiddleware, ADMIN, ctrl.excluirUsuario);
router.get("/lojas",            authMiddleware, ADMIN, ctrl.listarLojas);
router.put("/lojas/:id",        authMiddleware, ADMIN, ctrl.atualizarLoja);
router.get("/produtos",         authMiddleware, ADMIN, ctrl.listarProdutos);
router.get("/pedidos",          authMiddleware, ADMIN, ctrl.listarPedidos);

module.exports = router;
