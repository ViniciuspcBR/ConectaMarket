// src/controllers/brinde.controller.js
const prisma = require("../config/prisma");

// GET /api/brindes — brindes recebidos pelo usuário logado
async function meusBrindes(req, res, next) {
  try {
    const usuarioId = req.usuario.id;

    const brindes = await prisma.brindeRecebido.findMany({
      where: { usuarioId },
      include: {
        produto:  { select: { id: true, nome: true, imagem: true, categoria: true } },
        campanha: { select: { id: true, nome: true } },
      },
      orderBy: { criadoEm: "desc" },
    });

    res.json(brindes);
  } catch (err) { next(err); }
}

// PATCH /api/brindes/:id/entregar — marca um brinde como entregue (vendedor/admin)
async function marcarEntregue(req, res, next) {
  try {
    const id = Number(req.params.id);
    const brinde = await prisma.brindeRecebido.update({
      where: { id },
      data:  { status: "ENTREGUE" },
    });
    res.json(brinde);
  } catch (err) { next(err); }
}

module.exports = { meusBrindes, marcarEntregue };
