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

// GET /api/campanhas/minhas — todas, incluindo inativas/expiradas (para edição)
async function listarMinhas(req, res, next) {
  try {
    const campanhas = await prisma.campanha.findMany({
      include: { produtos: { include: { produto: true } } },
      orderBy: { criadoEm: "desc" },
    });
    res.json(campanhas);
  } catch (err) { next(err); }
}

async function criar(req, res, next) {
  try {
    const { nome, descricao, tipo, valor, inicio, fim, produtoIds } = req.body;

    const campanha = await prisma.campanha.create({
      data: {
        nome, descricao, tipo, valor: Number(valor),
        inicio: new Date(inicio),
        fim: new Date(fim),
        produtos: {
          create: (produtoIds || []).map((id) => ({ produtoId: id })),
        },
      },
      include: { produtos: true },
    });

    res.status(201).json(campanha);
  } catch (err) { next(err); }
}

// PUT /api/campanhas/:id
// Atualiza dados da campanha E a lista de produtos vinculados
async function atualizar(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { nome, descricao, tipo, valor, inicio, fim, ativa, produtoIds } = req.body;

    // Monta apenas os campos escalares que vieram no body
    const data = {};
    if (nome       !== undefined) data.nome = nome;
    if (descricao  !== undefined) data.descricao = descricao;
    if (tipo       !== undefined) data.tipo = tipo;
    if (valor      !== undefined) data.valor = Number(valor);
    if (inicio     !== undefined) data.inicio = new Date(inicio);
    if (fim        !== undefined) data.fim = new Date(fim);
    if (ativa      !== undefined) data.ativa = ativa;

    // Se produtoIds foi enviado, substitui a lista de produtos vinculados
    if (produtoIds !== undefined) {
      await prisma.campanhaProduto.deleteMany({ where: { campanhaId: id } });
      if (produtoIds.length > 0) {
        await prisma.campanhaProduto.createMany({
          data: produtoIds.map((produtoId) => ({ campanhaId: id, produtoId })),
        });
      }
    }

    const campanha = await prisma.campanha.update({
      where: { id },
      data,
      include: { produtos: { include: { produto: true } } },
    });

    res.json(campanha);
  } catch (err) { next(err); }
}

module.exports = { listar, listarMinhas, criar, atualizar };
