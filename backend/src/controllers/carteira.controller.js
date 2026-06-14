// src/controllers/carteira.controller.js
const prisma = require("../config/prisma");

// GET /api/carteira — saldo e histórico do usuário logado
async function minhaCarteira(req, res, next) {
  try {
    const usuarioId = req.usuario.id;

    let carteira = await prisma.carteira.findUnique({
      where: { usuarioId },
      include: {
        transacoes: { orderBy: { criadoEm: "desc" } },
      },
    });

    // Se o usuário nunca recebeu cashback, retorna saldo zero sem criar registro
    if (!carteira) {
      return res.json({ saldo: 0, transacoes: [] });
    }

    res.json(carteira);
  } catch (err) { next(err); }
}

module.exports = { minhaCarteira };
