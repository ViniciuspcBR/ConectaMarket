// src/app.js
const express = require("express");
const cors    = require("cors");

const authRoutes       = require("./routes/auth.routes");
const usuarioRoutes    = require("./routes/usuario.routes");
const produtoRoutes    = require("./routes/produto.routes");
const pedidoRoutes     = require("./routes/pedido.routes");
const lojaRoutes       = require("./routes/loja.routes");
const fornecedorRoutes = require("./routes/fornecedor.routes");
const campanhaRoutes   = require("./routes/campanha.routes");
const avaliacaoRoutes  = require("./routes/avaliacao.routes");
const adminRoutes      = require("./routes/admin.routes");
const carteiraRoutes   = require("./routes/carteira.routes");
const brindeRoutes     = require("./routes/brinde.routes");
const errorMiddleware  = require("./middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth",        authRoutes);
app.use("/api/usuarios",    usuarioRoutes);
app.use("/api/produtos",    produtoRoutes);
app.use("/api/pedidos",     pedidoRoutes);
app.use("/api/lojas",       lojaRoutes);
app.use("/api/fornecedores",fornecedorRoutes);
app.use("/api/campanhas",   campanhaRoutes);
app.use("/api/avaliacoes",  avaliacaoRoutes);
app.use("/api/admin",       adminRoutes);
app.use("/api/carteira",    carteiraRoutes);
app.use("/api/brindes",     brindeRoutes);

app.get("/", (req, res) => res.json({ status: "ConectaMarket API 🚀" }));

app.use(errorMiddleware);

module.exports = app;
