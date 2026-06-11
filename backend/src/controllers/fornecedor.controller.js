// src/controllers/fornecedor.controller.js
const prisma = require("../config/prisma");

async function listar(req, res, next) {
  try {
    const fornecedores = await prisma.fornecedor.findMany({
      where: { ativo: true },
      include: { usuario: { select: { nome: true, email: true } } },
    });
    res.json(fornecedores);
  } catch (err) { next(err); }
}

async function buscarPorId(req, res, next) {
  try {
    const fornecedor = await prisma.fornecedor.findUnique({
      where: { id: Number(req.params.id) },
      include: { produtos: { where: { ativo: true } } },
    });
    if (!fornecedor) return res.status(404).json({ erro: "Fornecedor não encontrado." });
    res.json(fornecedor);
  } catch (err) { next(err); }
}

async function criar(req, res, next) {
  try {
    const usuarioId = req.usuario.id;
    const { nome, descricao, cnpj, contato } = req.body;
    const fornecedor = await prisma.fornecedor.create({
      data: { nome, descricao, cnpj, contato, usuarioId },
    });
    res.status(201).json(fornecedor);
  } catch (err) { next(err); }
}

async function atualizar(req, res, next) {
  try {
    const fornecedor = await prisma.fornecedor.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    });
    res.json(fornecedor);
  } catch (err) { next(err); }
}

module.exports = { listar, buscarPorId, criar, atualizar };
