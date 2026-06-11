// src/controllers/avaliacao.controller.js
const prisma = require("../config/prisma");

async function criar(req, res, next) {
  try {
    const usuarioId = req.usuario.id;
    const { produtoId, nota, comentario } = req.body;

    if (nota < 1 || nota > 5) {
      return res.status(400).json({ erro: "Nota deve ser entre 1 e 5." });
    }

    const avaliacao = await prisma.avaliacao.create({
      data: { usuarioId, produtoId, nota, comentario },
    });

    res.status(201).json(avaliacao);
  } catch (err) { next(err); }
}

async function listarPorProduto(req, res, next) {
  try {
    const avaliacoes = await prisma.avaliacao.findMany({
      where: { produtoId: Number(req.params.produtoId) },
      include: { usuario: { select: { nome: true } } },
      orderBy: { criadoEm: "desc" },
    });
    res.json(avaliacoes);
  } catch (err) { next(err); }
}

module.exports = { criar, listarPorProduto };
