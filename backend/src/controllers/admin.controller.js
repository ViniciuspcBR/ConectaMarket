// src/controllers/admin.controller.js
const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");

// ── Usuários ──────────────────────────────────────────────────────
async function listarUsuarios(req, res, next) {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: { id: true, nome: true, email: true, role: true, ativo: true, criadoEm: true },
      orderBy: { criadoEm: "desc" },
    });
    res.json(usuarios);
  } catch (err) { next(err); }
}

async function atualizarUsuario(req, res, next) {
  try {
    const { nome, role, ativo } = req.body;
    const usuario = await prisma.usuario.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(nome  !== undefined && { nome }),
        ...(role  !== undefined && { role }),
        ...(ativo !== undefined && { ativo }),
      },
      select: { id: true, nome: true, email: true, role: true, ativo: true },
    });
    res.json(usuario);
  } catch (err) { next(err); }
}

async function excluirUsuario(req, res, next) {
  try {
    await prisma.usuario.update({
      where: { id: Number(req.params.id) },
      data: { ativo: false },
    });
    res.json({ mensagem: "Usuário desativado." });
  } catch (err) { next(err); }
}

// ── Lojas ─────────────────────────────────────────────────────────
async function listarLojas(req, res, next) {
  try {
    const lojas = await prisma.loja.findMany({
      include: { usuario: { select: { nome: true, email: true } }, _count: { select: { produtos: { where: { ativo: true } } } } },
      orderBy: { criadoEm: "desc" },
    });
    res.json(lojas);
  } catch (err) { next(err); }
}

async function atualizarLoja(req, res, next) {
  try {
    const loja = await prisma.loja.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    });
    res.json(loja);
  } catch (err) { next(err); }
}

// ── Produtos ──────────────────────────────────────────────────────
async function listarProdutos(req, res, next) {
  try {
    const produtos = await prisma.produto.findMany({
      include: {
        loja:         { select: { nome: true } },
        fornecedor:   { select: { nome: true } },
        empreendedor: { select: { nomeNegocio: true } },
      },
      orderBy: { criadoEm: "desc" },
    });
    res.json(produtos);
  } catch (err) { next(err); }
}

// ── Pedidos ───────────────────────────────────────────────────────
async function listarPedidos(req, res, next) {
  try {
    const pedidos = await prisma.pedido.findMany({
      include: {
        cliente: { select: { nome: true, email: true } },
        loja:    { select: { nome: true } },
        itens:   { include: { produto: { select: { nome: true } } } },
      },
      orderBy: { criadoEm: "desc" },
    });
    res.json(pedidos);
  } catch (err) { next(err); }
}

// ── Dashboard resumo ──────────────────────────────────────────────
async function resumo(req, res, next) {
  try {
    const [totalUsuarios, totalProdutos, totalPedidos, totalLojas] = await Promise.all([
      prisma.usuario.count(),
      prisma.produto.count({ where: { ativo: true } }),
      prisma.pedido.count(),
      prisma.loja.count({ where: { ativa: true } }),
    ]);

    const receitaTotal = await prisma.pedido.aggregate({
      _sum: { total: true },
      where: { status: "ENTREGUE" },
    });

    const pedidosPorStatus = await prisma.pedido.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    res.json({
      totalUsuarios,
      totalProdutos,
      totalPedidos,
      totalLojas,
      receitaTotal: receitaTotal._sum.total || 0,
      pedidosPorStatus,
    });
  } catch (err) { next(err); }
}

module.exports = { listarUsuarios, atualizarUsuario, excluirUsuario,
                   listarLojas, atualizarLoja, listarProdutos, listarPedidos, resumo };
