// src/routes/usuario.routes.js
const router = require("express").Router();
const { listar, perfil, atualizarPerfil } = require("../controllers/usuario.controller");
const { authMiddleware, autorizar } = require("../middlewares/auth.middleware");

router.get("/",        authMiddleware, autorizar("ADMINISTRADOR"), listar);
router.get("/perfil",  authMiddleware, perfil);
router.put("/perfil",  authMiddleware, atualizarPerfil);

module.exports = router;
