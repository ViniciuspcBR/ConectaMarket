// src/controllers/campanha.controller.js
const prisma = require("../config/prisma");

async function listar(req, res, next) {
  try {
    const agora = new Date();
    const campanhas = await prisma.campanha.findMany({
      where: { ativa: true, inicio: { lte: agora }, fim: { gte: agora } },
      include: { produtos: { include: { produto: true } } },
    });
    res.json(campanhas);
  } catch (err) { next(err); }
}

async function criar(req, res, next) {
  try {
    const { nome, descricao, tipo, valor, inicio, fim, produtoIds } = req.body;

    const campanha = await prisma.campanha.create({
      data: {
        nome, descricao, tipo, valor,
        inicio: new Date(inicio),
        fim: new Date(fim),
        produtos: {
          create: produtoIds.map((id) => ({ produtoId: id })),
        },
      },
      include: { produtos: true },
    });

    res.status(201).json(campanha);
  } catch (err) { next(err); }
}

async function atualizar(req, res, next) {
  try {
    const campanha = await prisma.campanha.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    });
    res.json(campanha);
  } catch (err) { next(err); }
}

module.exports = { listar, criar, atualizar };
