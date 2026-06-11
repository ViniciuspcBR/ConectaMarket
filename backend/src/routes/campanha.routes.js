// src/routes/campanha.routes.js
const router = require("express").Router();
const { listar, criar, atualizar } = require("../controllers/campanha.controller");
const { authMiddleware, autorizar } = require("../middlewares/auth.middleware");

router.get("/",    listar);
router.post("/",   authMiddleware, autorizar("ADMINISTRADOR","LOJISTA"), criar);
router.put("/:id", authMiddleware, autorizar("ADMINISTRADOR","LOJISTA"), atualizar);

module.exports = router;
