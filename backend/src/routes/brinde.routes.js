// src/routes/brinde.routes.js
const router = require("express").Router();
const { meusBrindes, marcarEntregue } = require("../controllers/brinde.controller");
const { authMiddleware, autorizar } = require("../middlewares/auth.middleware");

router.get("/",              authMiddleware, meusBrindes);
router.patch("/:id/entregar", authMiddleware, autorizar("ADMINISTRADOR","LOJISTA","FORNECEDOR","EMPREENDEDOR"), marcarEntregue);

module.exports = router;
