// src/routes/carteira.routes.js
const router = require("express").Router();
const { minhaCarteira } = require("../controllers/carteira.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

router.get("/", authMiddleware, minhaCarteira);

module.exports = router;
