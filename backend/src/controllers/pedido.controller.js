// src/controllers/pedido.controller.js
const prisma = require("../config/prisma");

// GET /api/pedidos
async function listar(req, res, next) {
  try {
    const { role, id: usuarioId } = req.usuario;
    const pedidos = await prisma.pedido.findMany({
      where: role === "ADMINISTRADOR"
        ? { excluido: false }
        : { clienteId: usuarioId, excluido: false },
      include: {
        itens:   { include: { produto: { select: { nome: true, imagem: true, preco: true } } } },
        cliente: { select: { nome: true, email: true } },
        loja:    { select: { nome: true } },
      },
      orderBy: { criadoEm: "desc" },
    });
    res.json(pedidos);
  } catch (err) { next(err); }
}

// GET /api/pedidos/excluidos — histórico de excluídos (só admin/vendedor)
async function listarExcluidos(req, res, next) {
  try {
    const { role, id: usuarioId } = req.usuario;
    const pedidos = await prisma.pedido.findMany({
      where: role === "ADMINISTRADOR"
        ? { excluido: true }
        : { clienteId: usuarioId, excluido: true },
      include: {
        itens:   { include: { produto: { select: { nome: true, imagem: true } } } },
        cliente: { select: { nome: true, email: true } },
      },
      orderBy: { criadoEm: "desc" },
    });
    res.json(pedidos);
  } catch (err) { next(err); }
}

// GET /api/pedidos/:id
async function buscarPorId(req, res, next) {
  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        itens:   { include: { produto: true } },
        cliente: { select: { nome: true, email: true, telefone: true } },
        loja:    true,
      },
    });
    if (!pedido) return res.status(404).json({ erro: "Pedido não encontrado." });
    res.json(pedido);
  } catch (err) { next(err); }
}

// POST /api/pedidos
async function criar(req, res, next) {
  try {
    const clienteId = req.usuario.id;
    const { lojaId, observacao, itens, formaPagamento, enderecoEntrega } = req.body;

    const ids = itens.map((i) => i.produtoId);
    const produtos = await prisma.produto.findMany({ where: { id: { in: ids } } });

    const itensMontados = itens.map((item) => {
      const produto = produtos.find((p) => p.id === item.produtoId);
      if (!produto) throw { status: 400, message: `Produto ${item.produtoId} não encontrado.` };
      return {
        produtoId:  item.produtoId,
        quantidade: item.quantidade,
        precoUnit:  produto.preco,
        subtotal:   produto.preco * item.quantidade,
      };
    });

    const total = itensMontados.reduce((acc, i) => acc + i.subtotal, 0);

    const pedido = await prisma.pedido.create({
      data: {
        clienteId, lojaId, observacao, total,
        formaPagamento:  formaPagamento  || "PIX",
        enderecoEntrega: enderecoEntrega || null,
        itens: { create: itensMontados },
      },
      include: { itens: true },
    });

    res.status(201).json(pedido);
  } catch (err) { next(err); }
}

// PATCH /api/pedidos/:id/status
async function atualizarStatus(req, res, next) {
  try {
    const { status } = req.body;
    const pedidoId   = Number(req.params.id);

    const statusValidos = ["PENDENTE","CONFIRMADO","EM_PREPARO","ENVIADO","ENTREGUE","CANCELADO"];
    if (!statusValidos.includes(status))
      return res.status(400).json({ erro: "Status inválido." });

    const pedido = await prisma.pedido.findUnique({
      where:   { id: pedidoId },
      include: { itens: true },
    });
    if (!pedido) return res.status(404).json({ erro: "Pedido não encontrado." });

    // ── Lógica de estoque ────────────────────────────────────────
    // Statuses que significam "estoque já foi descontado"
    const statusDescontado = ["CONFIRMADO","EM_PREPARO","ENVIADO","ENTREGUE"];
    const eraDescontado    = statusDescontado.includes(pedido.status);
    const seraDescontado   = statusDescontado.includes(status);

    if (!eraDescontado && seraDescontado) {
      // Estava sem desconto → vai descontar
      for (const item of pedido.itens) {
        const p = await prisma.produto.findUnique({ where: { id: item.produtoId } });
        if (!p) continue;
        await prisma.produto.update({
          where: { id: item.produtoId },
          data:  { estoque: Math.max(0, p.estoque - item.quantidade) },
        });
      }
    } else if (eraDescontado && !seraDescontado) {
      // Estava descontado → vai devolver (CANCELADO ou PENDENTE de volta)
      for (const item of pedido.itens) {
        const p = await prisma.produto.findUnique({ where: { id: item.produtoId } });
        if (!p) continue;
        await prisma.produto.update({
          where: { id: item.produtoId },
          data:  { estoque: p.estoque + item.quantidade },
        });
      }
    }
    // Se ambos são do mesmo grupo (ambos descontados ou ambos não), não mexe no estoque

    const atualizado = await prisma.pedido.update({
      where: { id: pedidoId },
      data:  { status },
    });

    res.json(atualizado);
  } catch (err) { next(err); }
}

// DELETE /api/pedidos/:id — soft delete + devolve estoque se necessário
async function excluir(req, res, next) {
  try {
    const pedidoId          = Number(req.params.id);
    const { role, id: uid } = req.usuario;

    const pedido = await prisma.pedido.findUnique({
      where:   { id: pedidoId },
      include: { itens: true },
    });
    if (!pedido) return res.status(404).json({ erro: "Pedido não encontrado." });

    if (role !== "ADMINISTRADOR" && pedido.clienteId !== uid)
      return res.status(403).json({ erro: "Sem permissão para excluir este pedido." });

    if (!["PENDENTE","CANCELADO"].includes(pedido.status))
      return res.status(400).json({ erro: "Só é possível excluir pedidos pendentes ou cancelados." });

    // Se estava CONFIRMADO ou EM_PREPARO antes de cancelar e agora excluindo
    // garantir que o estoque voltou (pedido cancelado já devolveu, pendente nunca descontou)
    // mas por segurança: se status for CANCELADO e estoque não voltou ainda, devolve
    // (aqui o pedido cancelado já devolveu, então só precisamos do soft delete)

    // Soft delete — mantém no histórico
    await prisma.pedido.update({
      where: { id: pedidoId },
      data:  { excluido: true },
    });

    res.json({ mensagem: "Pedido removido do histórico com sucesso." });
  } catch (err) { next(err); }
}

module.exports = { listar, listarExcluidos, buscarPorId, criar, atualizarStatus, excluir };
