// src/controllers/usuario.controller.js
const prisma = require("../config/prisma");

// GET /api/usuarios — somente admin
async function listar(req, res, next) {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: { id: true, nome: true, email: true, role: true, ativo: true, criadoEm: true },
    });
    res.json(usuarios);
  } catch (err) { next(err); }
}

// GET /api/usuarios/perfil — usuário logado
async function perfil(req, res, next) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.id },
      select: { id: true, nome: true, email: true, telefone: true, role: true,
                loja: true, fornecedor: true, empreendedor: true },
    });
    res.json(usuario);
  } catch (err) { next(err); }
}

// PUT /api/usuarios/perfil — atualiza dados do usuário logado
async function atualizarPerfil(req, res, next) {
  try {
    const { nome, telefone } = req.body;
    const usuario = await prisma.usuario.update({
      where: { id: req.usuario.id },
      data: { nome, telefone },
      select: { id: true, nome: true, email: true, telefone: true, role: true },
    });
    res.json(usuario);
  } catch (err) { next(err); }
}

module.exports = { listar, perfil, atualizarPerfil };
