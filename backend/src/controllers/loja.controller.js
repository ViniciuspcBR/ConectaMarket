// src/controllers/loja.controller.js
const prisma = require("../config/prisma");

async function listar(req, res, next) {
  try {
    const lojas = await prisma.loja.findMany({
      where: { ativa: true },
      include: { usuario: { select: { nome: true, email: true } } },
    });
    res.json(lojas);
  } catch (err) { next(err); }
}

async function buscarPorId(req, res, next) {
  try {
    const loja = await prisma.loja.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        produtos: { where: { ativo: true } },
        usuario:  { select: { nome: true, email: true } },
      },
    });
    if (!loja) return res.status(404).json({ erro: "Loja não encontrada." });
    res.json(loja);
  } catch (err) { next(err); }
}

async function criar(req, res, next) {
  try {
    const usuarioId = req.usuario.id;
    const { nome, descricao, cnpj, endereco, logo } = req.body;
    const loja = await prisma.loja.create({
      data: { nome, descricao, cnpj, endereco, logo, usuarioId },
    });
    res.status(201).json(loja);
  } catch (err) { next(err); }
}

async function atualizar(req, res, next) {
  try {
    const loja = await prisma.loja.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    });
    res.json(loja);
  } catch (err) { next(err); }
}

module.exports = { listar, buscarPorId, criar, atualizar };
