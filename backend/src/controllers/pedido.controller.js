// src/controllers/pedido.controller.js
const prisma = require("../config/prisma");

// Helper — filtra pedidos por perfil de vendedor
async function filtroPorPerfil(usuarioId, role) {
  if (role === "ADMINISTRADOR") return { excluido: false };
  if (role === "LOJISTA") {
    const loja = await prisma.loja.findUnique({ where: { usuarioId } });
    return loja ? { lojaId: loja.id, excluido: false } : { id: -1 };
  }
  return { clienteId: usuarioId, excluido: false };
}

// GET /api/pedidos
async function listar(req, res, next) {
  try {
    const { role, id: usuarioId } = req.usuario;
    const where = await filtroPorPerfil(usuarioId, role);
    const pedidos = await prisma.pedido.findMany({
      where,
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

// GET /api/pedidos/excluidos
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
    const { lojaId, observacao, itens, formaPagamento, enderecoEntrega, usarCashback } = req.body;

    const ids = itens.map((i) => i.produtoId);
    const agora = new Date();
    const produtos = await prisma.produto.findMany({
      where: { id: { in: ids } },
      include: {
        campanhas: {
          where: { campanha: { ativa: true, inicio: { lte: agora }, fim: { gte: agora } } },
          include: { campanha: true },
        },
      },
    });

    const itensMontados = itens.map((item) => {
      const produto = produtos.find((p) => p.id === item.produtoId);
      if (!produto) throw { status: 400, message: `Produto ${item.produtoId} não encontrado.` };

      let precoFinal = produto.preco;
      const campanha = produto.campanhas?.[0]?.campanha;
      if (campanha && campanha.tipo === "DESCONTO") {
        precoFinal = produto.preco * (1 - campanha.valor / 100);
      }

      return {
        produtoId:  item.produtoId,
        quantidade: item.quantidade,
        precoUnit:  precoFinal,
        subtotal:   precoFinal * item.quantidade,
      };
    });

    const subtotalItens = itensMontados.reduce((acc, i) => acc + i.subtotal, 0);

    // ── Uso de cashback da carteira ──────────────────────────────
    let valorUsoCashback = 0;
    if (usarCashback && usarCashback > 0) {
      const carteira = await prisma.carteira.findUnique({ where: { usuarioId: clienteId } });
      if (carteira && carteira.saldo > 0) {
        // Usa no máximo o saldo disponível e no máximo o subtotal dos itens
        valorUsoCashback = Math.min(carteira.saldo, subtotalItens, usarCashback);
      }
    }

    const total = Math.max(0, subtotalItens - valorUsoCashback);

    const pedido = await prisma.pedido.create({
      data: {
        clienteId, lojaId, observacao, total,
        usoCashback:     valorUsoCashback,
        formaPagamento:  formaPagamento  || "PIX",
        enderecoEntrega: enderecoEntrega || null,
        itens: { create: itensMontados },
      },
      include: { itens: true },
    });

    // Debita o cashback usado da carteira
    if (valorUsoCashback > 0) {
      const carteira = await prisma.carteira.findUnique({ where: { usuarioId: clienteId } });
      await prisma.carteira.update({
        where: { id: carteira.id },
        data:  { saldo: carteira.saldo - valorUsoCashback },
      });
      await prisma.carteiraTransacao.create({
        data: {
          carteiraId: carteira.id,
          tipo:       "USO",
          valor:      valorUsoCashback,
          descricao:  `Cashback usado no Pedido #${pedido.id}`,
          pedidoId:   pedido.id,
        },
      });
    }

    res.status(201).json({ ...pedido, usoCashback: valorUsoCashback });
  } catch (err) { next(err); }
}

// Função auxiliar — estorna cashback e brindes de um pedido
async function estornarBeneficiosPedido(pedido) {
  // 1) Estornar cashback que foi CREDITADO ao entregar o pedido
  const transacoesCashback = await prisma.carteiraTransacao.findMany({
    where: { pedidoId: pedido.id, tipo: "CASHBACK" },
  });

  for (const t of transacoesCashback) {
    const carteira = await prisma.carteira.findUnique({ where: { id: t.carteiraId } });
    if (!carteira) continue;
    const novoSaldo = Math.max(0, carteira.saldo - t.valor);
    await prisma.carteira.update({
      where: { id: carteira.id },
      data:  { saldo: novoSaldo },
    });
    await prisma.carteiraTransacao.create({
      data: {
        carteiraId: carteira.id,
        tipo:       "ESTORNO",
        valor:      t.valor,
        descricao:  `Estorno de cashback ganho — Pedido #${pedido.id} cancelado/devolvido`,
        pedidoId:   pedido.id,
      },
    });
  }

  // 2) Devolver cashback que foi USADO como desconto na compra
  if (pedido.usoCashback && pedido.usoCashback > 0) {
    let carteira = await prisma.carteira.findUnique({ where: { usuarioId: pedido.clienteId } });
    if (!carteira) {
      carteira = await prisma.carteira.create({
        data: { usuarioId: pedido.clienteId, saldo: 0 },
      });
    }
    await prisma.carteira.update({
      where: { id: carteira.id },
      data:  { saldo: carteira.saldo + pedido.usoCashback },
    });
    await prisma.carteiraTransacao.create({
      data: {
        carteiraId: carteira.id,
        tipo:       "CASHBACK",
        valor:      pedido.usoCashback,
        descricao:  `Devolução de cashback usado — Pedido #${pedido.id} cancelado/devolvido`,
        pedidoId:   pedido.id,
      },
    });
  }

  // 3) Cancelar todos os brindes vinculados ao pedido
  await prisma.brindeRecebido.updateMany({
    where: { pedidoId: pedido.id },
    data:  { status: "CANCELADO" },
  });
}

// PATCH /api/pedidos/:id/status
async function atualizarStatus(req, res, next) {
  try {
    const { status } = req.body;
    const pedidoId   = Number(req.params.id);

    const statusValidos = ["PENDENTE","CONFIRMADO","EM_PREPARO","ENVIADO","ENTREGUE","CANCELADO","DEVOLVIDO"];
    if (!statusValidos.includes(status))
      return res.status(400).json({ erro: "Status inválido." });

    // CLIENTE só pode solicitar DEVOLVIDO nos próprios pedidos
    if (req.usuario.role === "CLIENTE") {
      if (status !== "DEVOLVIDO")
        return res.status(403).json({ erro: "Clientes só podem solicitar devolução." });
    }

    const pedido = await prisma.pedido.findUnique({
      where:   { id: pedidoId },
      include: { itens: true },
    });
    if (!pedido) return res.status(404).json({ erro: "Pedido não encontrado." });

    // ── Lógica de estoque ────────────────────────────────────────
    const statusDescontado = ["CONFIRMADO","EM_PREPARO","ENVIADO","ENTREGUE"];
    const eraDescontado    = statusDescontado.includes(pedido.status);
    const seraDescontado   = statusDescontado.includes(status);

    if (!eraDescontado && seraDescontado) {
      for (const item of pedido.itens) {
        const p = await prisma.produto.findUnique({ where: { id: item.produtoId } });
        if (!p) continue;
        await prisma.produto.update({
          where: { id: item.produtoId },
          data:  { estoque: Math.max(0, p.estoque - item.quantidade) },
        });
      }
    } else if (eraDescontado && !seraDescontado) {
      for (const item of pedido.itens) {
        const p = await prisma.produto.findUnique({ where: { id: item.produtoId } });
        if (!p) continue;
        await prisma.produto.update({
          where: { id: item.produtoId },
          data:  { estoque: p.estoque + item.quantidade },
        });
      }
    }

    // ── Cashback e Brindes — processados na entrega ──────────────
    if (status === "ENTREGUE" && pedido.status !== "ENTREGUE") {
      for (const item of pedido.itens) {
        const vinculos = await prisma.campanhaProduto.findMany({
          where: { produtoId: item.produtoId, campanha: { ativa: true } },
          include: { campanha: true },
        });

        for (const v of vinculos) {
          const campanha = v.campanha;

          if (campanha.tipo === "CASHBACK") {
            const valorCashback = item.subtotal * (campanha.valor / 100);
            const carteira = await prisma.carteira.upsert({
              where:  { usuarioId: pedido.clienteId },
              update: {},
              create: { usuarioId: pedido.clienteId, saldo: 0 },
            });
            await prisma.carteira.update({
              where: { id: carteira.id },
              data:  { saldo: carteira.saldo + valorCashback },
            });
            await prisma.carteiraTransacao.create({
              data: {
                carteiraId: carteira.id,
                tipo:       "CASHBACK",
                valor:      valorCashback,
                descricao:  `Cashback (${campanha.valor}%) — Pedido #${pedido.id} — ${campanha.nome}`,
                pedidoId:   pedido.id,
              },
            });
          }

          if (campanha.tipo === "BRINDE" && campanha.brindeProdutoId) {
            const jaExiste = await prisma.brindeRecebido.findFirst({
              where: { pedidoId: pedido.id, campanhaId: campanha.id, usuarioId: pedido.clienteId },
            });
            if (!jaExiste) {
              await prisma.brindeRecebido.create({
                data: {
                  usuarioId:  pedido.clienteId,
                  produtoId:  campanha.brindeProdutoId,
                  campanhaId: campanha.id,
                  pedidoId:   pedido.id,
                  status:     "ENTREGUE",
                },
              });
            } else if (jaExiste.status === "PENDENTE") {
              await prisma.brindeRecebido.update({
                where: { id: jaExiste.id },
                data:  { status: "ENTREGUE" },
              });
            }
          }
        }
      }
    }

    // ── Estorno — quando pedido é CANCELADO ou DEVOLVIDO após ter sido ENTREGUE ──
    if ((status === "CANCELADO" || status === "DEVOLVIDO") && pedido.status === "ENTREGUE") {
      await estornarBeneficiosPedido(pedido);
    }

    const atualizado = await prisma.pedido.update({
      where: { id: pedidoId },
      data:  { status },
    });

    res.json(atualizado);
  } catch (err) { next(err); }
}

// DELETE /api/pedidos/:id — soft delete
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

    if (!["PENDENTE","CANCELADO","DEVOLVIDO"].includes(pedido.status))
      return res.status(400).json({ erro: "Só é possível excluir pedidos pendentes, cancelados ou devolvidos." });

    await prisma.pedido.update({
      where: { id: pedidoId },
      data:  { excluido: true },
    });

    res.json({ mensagem: "Pedido removido do histórico com sucesso." });
  } catch (err) { next(err); }
}

module.exports = { listar, listarExcluidos, buscarPorId, criar, atualizarStatus, excluir };
