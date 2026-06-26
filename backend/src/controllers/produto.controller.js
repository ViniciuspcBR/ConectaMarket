// src/controllers/produto.controller.js
const prisma = require("../config/prisma");

// GET /api/produtos
async function listar(req, res, next) {
  try {
    const { categoria, tipo, busca, lojaId, fornecedorId, empreendedorId, meus } = req.query;

    const where = { ativo: true };
    if (categoria)      where.categoria      = categoria;
    if (tipo)           where.tipo           = tipo;
    if (lojaId)         where.lojaId         = Number(lojaId);
    if (fornecedorId)   where.fornecedorId   = Number(fornecedorId);
    if (empreendedorId) where.empreendedorId = Number(empreendedorId);
    if (busca) where.nome = { contains: busca, mode: "insensitive" };

    // Filtro "meus produtos" — retorna só os do usuário logado
    if (meus === "true" && req.usuario) {
      const u = req.usuario;
      if (u.role === "LOJISTA") {
        const loja = await prisma.loja.findFirst({ where: { usuarioId: u.id } });
        if (loja) where.lojaId = loja.id;
      } else if (u.role === "FORNECEDOR") {
        const forn = await prisma.fornecedor.findFirst({ where: { usuarioId: u.id } });
        if (forn) where.fornecedorId = forn.id;
      } else if (u.role === "EMPREENDEDOR") {
        const emp = await prisma.empreendedor.findFirst({ where: { usuarioId: u.id } });
        if (emp) where.empreendedorId = emp.id;
      }
    }

    const agora = new Date();
    const produtos = await prisma.produto.findMany({
      where,
      include: {
        loja:         { select: { id: true, nome: true } },
        fornecedor:   { select: { id: true, nome: true } },
        empreendedor: { select: { id: true, nomeNegocio: true } },
        avaliacoes:   { select: { nota: true } },
        campanhas: {
          where: {
            campanha: { ativa: true, inicio: { lte: agora }, fim: { gte: agora } },
          },
          include: { campanha: { include: { brindeProduto: true } } },
        },
      },
      orderBy: { criadoEm: "desc" },
    });

    const resultado = produtos.map((p) => {
      const campanhaAtiva = p.campanhas?.[0]?.campanha || null;
      let precoComDesconto = null;
      if (campanhaAtiva && campanhaAtiva.tipo === "DESCONTO") {
        precoComDesconto = p.preco * (1 - campanhaAtiva.valor / 100);
      }
      return {
        ...p,
        mediaAvaliacao:
          p.avaliacoes.length > 0
            ? p.avaliacoes.reduce((acc, a) => acc + a.nota, 0) / p.avaliacoes.length
            : null,
        campanhaAtiva: campanhaAtiva ? {
          id: campanhaAtiva.id,
          nome: campanhaAtiva.nome,
          tipo: campanhaAtiva.tipo,
          valor: campanhaAtiva.valor,
          brindeProduto: campanhaAtiva.brindeProduto
            ? { id: campanhaAtiva.brindeProduto.id, nome: campanhaAtiva.brindeProduto.nome, imagem: campanhaAtiva.brindeProduto.imagem }
            : null,
        } : null,
        precoComDesconto,
      };
    });

    res.json(resultado);
  } catch (err) { next(err); }
}

// GET /api/produtos/:id
async function buscarPorId(req, res, next) {
  try {
    const produto = await prisma.produto.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        loja: true, fornecedor: true, empreendedor: true,
        avaliacoes: { include: { usuario: { select: { nome: true } } } },
        campanhas:  { include: { campanha: { include: { brindeProduto: true } } } },
      },
    });
    if (!produto) return res.status(404).json({ erro: "Produto não encontrado." });

    const agora = new Date();
    const campanhaAtiva = produto.campanhas
      ?.map((c) => c.campanha)
      ?.find((c) => c.ativa && new Date(c.inicio) <= agora && new Date(c.fim) >= agora) || null;

    let precoComDesconto = null;
    if (campanhaAtiva && campanhaAtiva.tipo === "DESCONTO") {
      precoComDesconto = produto.preco * (1 - campanhaAtiva.valor / 100);
    }

    res.json({
      ...produto,
      campanhaAtiva: campanhaAtiva ? {
        id: campanhaAtiva.id, nome: campanhaAtiva.nome,
        tipo: campanhaAtiva.tipo, valor: campanhaAtiva.valor,
        brindeProduto: campanhaAtiva.brindeProduto
          ? { id: campanhaAtiva.brindeProduto.id, nome: campanhaAtiva.brindeProduto.nome, imagem: campanhaAtiva.brindeProduto.imagem }
          : null,
      } : null,
      precoComDesconto,
    });
  } catch (err) { next(err); }
}

// POST /api/produtos — cadastro individual
async function criar(req, res, next) {
  try {
    const { nome, descricao, preco, estoque, imagem, tipo, categoria } = req.body;
    let { lojaId, fornecedorId, empreendedorId } = req.body;

    // Se nenhum vínculo foi enviado, vincula automaticamente ao perfil do usuário logado
    if (!lojaId && !fornecedorId && !empreendedorId) {
      const u = req.usuario;
      if (u.role === "LOJISTA") {
        const loja = await prisma.loja.findFirst({ where: { usuarioId: u.id } });
        if (loja) lojaId = loja.id;
      } else if (u.role === "FORNECEDOR") {
        const forn = await prisma.fornecedor.findFirst({ where: { usuarioId: u.id } });
        if (forn) fornecedorId = forn.id;
      } else if (u.role === "EMPREENDEDOR") {
        const emp = await prisma.empreendedor.findFirst({ where: { usuarioId: u.id } });
        if (emp) empreendedorId = emp.id;
      }
    }

    const produto = await prisma.produto.create({
      data: { nome, descricao, preco: Number(preco), estoque: Number(estoque),
              imagem, tipo, categoria,
              lojaId:         lojaId         ? Number(lojaId)         : null,
              fornecedorId:   fornecedorId   ? Number(fornecedorId)   : null,
              empreendedorId: empreendedorId ? Number(empreendedorId) : null },
    });
    res.status(201).json(produto);
  } catch (err) { next(err); }
}

// POST /api/produtos/lote — cadastro em massa
async function criarLote(req, res, next) {
  try {
    const { produtos } = req.body; // array de produtos

    if (!Array.isArray(produtos) || produtos.length === 0) {
      return res.status(400).json({ erro: "Envie um array de produtos." });
    }
    if (produtos.length > 50) {
      return res.status(400).json({ erro: "Máximo de 50 produtos por lote." });
    }

    const criados = await prisma.$transaction(
      produtos.map((p) =>
        prisma.produto.create({
          data: {
            nome:           p.nome,
            descricao:      p.descricao || null,
            preco:          Number(p.preco),
            estoque:        Number(p.estoque || 0),
            imagem:         p.imagem || null,
            tipo:           p.tipo || "PRODUTO",
            categoria:      p.categoria || null,
            lojaId:         p.lojaId         ? Number(p.lojaId)         : null,
            fornecedorId:   p.fornecedorId   ? Number(p.fornecedorId)   : null,
            empreendedorId: p.empreendedorId ? Number(p.empreendedorId) : null,
          },
        })
      )
    );

    res.status(201).json({ mensagem: `${criados.length} produtos criados com sucesso.`, criados });
  } catch (err) { next(err); }
}

// PUT /api/produtos/:id — edição completa
async function atualizar(req, res, next) {
  try {
    const { nome, descricao, preco, estoque, imagem, tipo, categoria, ativo } = req.body;

    const produto = await prisma.produto.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(nome      !== undefined && { nome }),
        ...(descricao !== undefined && { descricao }),
        ...(preco     !== undefined && { preco: Number(preco) }),
        ...(estoque   !== undefined && { estoque: Number(estoque) }),
        ...(imagem    !== undefined && { imagem }),
        ...(tipo      !== undefined && { tipo }),
        ...(categoria !== undefined && { categoria }),
        ...(ativo     !== undefined && { ativo }),
      },
    });
    res.json(produto);
  } catch (err) { next(err); }
}

// DELETE /api/produtos/:id (soft delete)
async function remover(req, res, next) {
  try {
    await prisma.produto.update({
      where: { id: Number(req.params.id) },
      data:  { ativo: false },
    });
    res.json({ mensagem: "Produto desativado com sucesso." });
  } catch (err) { next(err); }
}

module.exports = { listar, buscarPorId, criar, criarLote, atualizar, remover };
