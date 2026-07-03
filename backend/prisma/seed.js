// prisma/seed.js — popula o banco com dados iniciais realistas
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // ── Guarda contra duplicação ────────────────────────────────────
  // Se já existem produtos cadastrados, o banco já foi populado
  // (isso evita duplicar o catálogo a cada `docker-compose up`)
  const totalProdutos = await prisma.produto.count();
  if (totalProdutos > 0) {
    console.log(`ℹ️  Banco já populado (${totalProdutos} produtos encontrados). Seed ignorado.`);
    return;
  }

  // ── Usuários ──────────────────────────────────────────────────
  const senhaHash = await bcrypt.hash("senha123", 10);

  const admin = await prisma.usuario.upsert({
    where: { email: "admin@abadeus.com" },
    update: {},
    create: { nome: "Administrador ABADEUS", email: "admin@abadeus.com", senha: senhaHash, role: "ADMINISTRADOR" },
  });

  const uLojista = await prisma.usuario.upsert({
    where: { email: "mercado@abadeus.com" },
    update: {},
    create: { nome: "Mercado Bom Preço", email: "mercado@abadeus.com", senha: senhaHash, role: "LOJISTA" },
  });

  const uFornecedor = await prisma.usuario.upsert({
    where: { email: "fornecedor@abadeus.com" },
    update: {},
    create: { nome: "Distribuidora Central", email: "fornecedor@abadeus.com", senha: senhaHash, role: "FORNECEDOR" },
  });

  const uEmp1 = await prisma.usuario.upsert({
    where: { email: "salao@abadeus.com" },
    update: {},
    create: { nome: "Salão Beleza & Cia", email: "salao@abadeus.com", senha: senhaHash, role: "EMPREENDEDOR" },
  });

  const uEmp2 = await prisma.usuario.upsert({
    where: { email: "pizzaria@abadeus.com" },
    update: {},
    create: { nome: "Pizzaria do Bairro", email: "pizzaria@abadeus.com", senha: senhaHash, role: "EMPREENDEDOR" },
  });

  const uCliente = await prisma.usuario.upsert({
    where: { email: "cliente@abadeus.com" },
    update: {},
    create: { nome: "Maria Silva", email: "cliente@abadeus.com", senha: senhaHash, role: "CLIENTE" },
  });

  // ── Loja ──────────────────────────────────────────────────────
  const loja = await prisma.loja.upsert({
    where: { usuarioId: uLojista.id },
    update: {},
    create: {
      nome: "Mercado Bom Preço",
      descricao: "Produtos frescos e de qualidade para sua família",
      endereco: "Rua Cristo Redentor, 150 — Criciúma/SC",
      logo: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=200&h=200&fit=crop",
      usuarioId: uLojista.id,
    },
  });

  // ── Fornecedor ────────────────────────────────────────────────
  const fornecedor = await prisma.fornecedor.upsert({
    where: { usuarioId: uFornecedor.id },
    update: {},
    create: {
      nome: "Distribuidora Central",
      descricao: "Atacado para lojistas e empreendedores da região",
      cnpj: "12.345.678/0001-99",
      contato: "(48) 3322-1100",
      usuarioId: uFornecedor.id,
    },
  });

  // ── Empreendedores ────────────────────────────────────────────
  const emp1 = await prisma.empreendedor.upsert({
    where: { usuarioId: uEmp1.id },
    update: {},
    create: {
      nomeNegocio: "Salão Beleza & Cia",
      descricao: "Cortes, coloração e tratamentos capilares",
      categoria: "Saúde e Beleza",
      usuarioId: uEmp1.id,
    },
  });

  const emp2 = await prisma.empreendedor.upsert({
    where: { usuarioId: uEmp2.id },
    update: {},
    create: {
      nomeNegocio: "Pizzaria do Bairro",
      descricao: "Pizzas artesanais assadas no forno a lenha",
      categoria: "Alimentos",
      usuarioId: uEmp2.id,
    },
  });

  // ── Produtos — Alimentos (Loja) ───────────────────────────────
  const produtosAlimentos = [
    { nome: "Arroz Branco 5kg", descricao: "Arroz tipo 1, grãos selecionados", preco: 22.90, estoque: 80, imagem: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop", categoria: "Alimentos" },
    { nome: "Feijão Preto 1kg", descricao: "Feijão preto selecionado, safra nova", preco: 8.90, estoque: 60, imagem: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1XDYwbQzhoWhmaQZNqRB9ZqGDSqpqmUQ2IBW5jHBPNw&s=10", categoria: "Alimentos" },
    { nome: "Óleo de Soja 900ml", descricao: "Óleo vegetal de soja refinado", preco: 6.50, estoque: 50, imagem: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=300&fit=crop", categoria: "Alimentos" },
    { nome: "Macarrão Espaguete 500g", descricao: "Massa de sêmola de trigo durum", preco: 4.20, estoque: 70, imagem: "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=400&h=300&fit=crop", categoria: "Alimentos" },
    { nome: "Leite Integral 1L", descricao: "Leite UHT integral longa vida", preco: 5.90, estoque: 90, imagem: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop", categoria: "Alimentos" },
    { nome: "Pão de Forma Integral", descricao: "Pão integral sem adição de açúcar, 500g", preco: 7.80, estoque: 30, imagem: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop", categoria: "Alimentos" },
  ];

  for (const p of produtosAlimentos) {
    await prisma.produto.create({ data: { ...p, tipo: "PRODUTO", lojaId: loja.id } }).catch(() => {});
  }

  // ── Produtos — Saúde e Beleza (Empreendedor) ─────────────────
  const produtosBeauty = [
    { nome: "Shampoo Hidratante 400ml", descricao: "Shampoo com queratina para cabelos danificados", preco: 28.90, estoque: 25, imagem: "https://images.unsplash.com/photo-1556228578-dd539282b964?w=400&h=300&fit=crop", categoria: "Saúde e Beleza" },
    { nome: "Condicionador Nutritivo 400ml", descricao: "Condicionador com óleo de argan", preco: 28.90, estoque: 25, imagem: "https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=400&h=300&fit=crop", categoria: "Saúde e Beleza" },
    { nome: "Creme Hidratante Corporal", descricao: "Creme com manteiga de karité, 250g", preco: 32.00, estoque: 20, imagem: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=300&fit=crop", categoria: "Saúde e Beleza" },
    { nome: "Protetor Solar FPS 50", descricao: "Protetor solar facial e corporal, 200ml", preco: 45.90, estoque: 18, imagem: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=300&fit=crop", categoria: "Saúde e Beleza" },
  ];

  for (const p of produtosBeauty) {
    await prisma.produto.create({ data: { ...p, tipo: "PRODUTO", lojaId: loja.id } }).catch(() => {});
  }

  // ── Serviços — Saúde e Beleza ─────────────────────────────────
  const servicosBeauty = [
    { nome: "Corte de Cabelo Feminino", descricao: "Corte com lavagem e finalização", preco: 65.00, estoque: 999, imagem: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZTdog0uXMWHgbUrXBU2TGKDuWub_Z3KYhB6g-_hIWkQ&s=10", categoria: "Saúde e Beleza" },
    { nome: "Coloração Completa", descricao: "Coloração com produtos profissionais", preco: 150.00, estoque: 999, imagem: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop", categoria: "Saúde e Beleza" },
    { nome: "Manicure e Pedicure", descricao: "Tratamento completo das unhas", preco: 55.00, estoque: 999, imagem: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop", categoria: "Saúde e Beleza" },
    { nome: "Massagem Relaxante 1h", descricao: "Massagem terapêutica com óleos essenciais", preco: 120.00, estoque: 999, imagem: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop", categoria: "Saúde e Beleza" },
  ];

  for (const p of servicosBeauty) {
    await prisma.produto.create({ data: { ...p, tipo: "SERVICO", empreendedorId: emp1.id } }).catch(() => {});
  }

  // ── Serviços — Alimentos (Pizzaria) ───────────────────────────
  const servicosPizzaria = [
    { nome: "Pizza Margherita (Grande)", descricao: "Molho de tomate, mussarela e manjericão fresco", preco: 55.00, estoque: 50, imagem: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop", categoria: "Alimentos" },
    { nome: "Pizza Calabresa (Grande)", descricao: "Molho, mussarela e calabresa artesanal", preco: 60.00, estoque: 50, imagem: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop", categoria: "Alimentos" },
    { nome: "Pizza Frango com Catupiry", descricao: "Frango desfiado com catupiry original", preco: 65.00, estoque: 50, imagem: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop", categoria: "Alimentos" },
    { nome: "Esfirra de Carne (unidade)", descricao: "Massa artesanal com recheio de carne temperada", preco: 8.00, estoque: 100, imagem: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop", categoria: "Alimentos" },
  ];

  for (const p of servicosPizzaria) {
    await prisma.produto.create({ data: { ...p, tipo: "PRODUTO", lojaId: loja.id } }).catch(() => {});
  }

  // ── Produtos — Vestuário (Fornecedor) ─────────────────────────
  const produtosVestuario = [
    { nome: "Camiseta Básica Algodão", descricao: "Camiseta 100% algodão, disponível em várias cores", preco: 39.90, estoque: 40, imagem: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop", categoria: "Vestuário" },
    { nome: "Calça Jeans Slim", descricao: "Calça jeans feminina slim fit, elastano 2%", preco: 129.90, estoque: 20, imagem: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=300&fit=crop", categoria: "Vestuário" },
    { nome: "Vestido Floral Leve", descricao: "Vestido de verão em tecido leve estampa floral", preco: 89.90, estoque: 15, imagem: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=300&fit=crop", categoria: "Vestuário" },
    { nome: "Tênis Esportivo", descricao: "Tênis para corrida e treino, solado anatômico", preco: 189.90, estoque: 12, imagem: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop", categoria: "Vestuário" },
  ];

  for (const p of produtosVestuario) {
    await prisma.produto.create({ data: { ...p, tipo: "PRODUTO", lojaId: loja.id } }).catch(() => {});
  }

  // ── Produtos — Construção Civil (Fornecedor) ──────────────────
  const produtosConstrucao = [
    { nome: "Cimento CP II 50kg", descricao: "Cimento Portland composto, saco 50kg", preco: 38.00, estoque: 100, imagem: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop", categoria: "Construção Civil" },
    { nome: "Tinta Látex Branca 18L", descricao: "Tinta látex PVA para paredes internas", preco: 149.90, estoque: 25, imagem: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=300&fit=crop", categoria: "Construção Civil" },
    { nome: "Tijolo Cerâmico (unidade)", descricao: "Tijolo 8 furos padrão 19x19x9cm", preco: 1.20, estoque: 500, imagem: "https://images.unsplash.com/photo-1590859808308-3d2d9c515b1a?w=400&h=300&fit=crop", categoria: "Construção Civil" },
  ];

  for (const p of produtosConstrucao) {
    await prisma.produto.create({ data: { ...p, tipo: "PRODUTO", lojaId: loja.id } }).catch(() => {});
  }

  // ── Serviços — Construção ─────────────────────────────────────
  const servicosConstrucao = [
    { nome: "Pintura Residencial (por cômodo)", descricao: "Pintura completa de cômodo até 20m², inclui material", preco: 350.00, estoque: 999, imagem: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=300&fit=crop", categoria: "Construção Civil" },
    { nome: "Assentamento de Piso (m²)", descricao: "Assentamento de porcelanato ou cerâmica por m²", preco: 85.00, estoque: 999, imagem: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop", categoria: "Construção Civil" },
  ];

  for (const p of servicosConstrucao) {
    await prisma.produto.create({ data: { ...p, tipo: "SERVICO", fornecedorId: fornecedor.id } }).catch(() => {});
  }

  // ── Produtos — Eletrônica ─────────────────────────────────────
  const produtosEletronica = [
    { nome: "Carregador USB-C 65W", descricao: "Carregador rápido compatível com notebooks e celulares", preco: 79.90, estoque: 30, imagem: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbhk1x9yxzaxBLou2rlPSrVy3z8frtghAt6OIGEURP0w&s=10", categoria: "Eletrônica" },
    { nome: "Fone de Ouvido Bluetooth", descricao: "Fone sem fio com cancelamento de ruído, 20h bateria", preco: 159.90, estoque: 18, imagem: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop", categoria: "Eletrônica" },
    { nome: "Cabo HDMI 2m", descricao: "Cabo HDMI 2.0 4K, 2 metros", preco: 24.90, estoque: 45, imagem: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPWRowXgso4mMe9VNE5S8hpjMQCHy_U9bYc2glAw_Svg&s=10", categoria: "Eletrônica" },
  ];

  for (const p of produtosEletronica) {
    await prisma.produto.create({ data: { ...p, tipo: "PRODUTO", lojaId: loja.id } }).catch(() => {});
  }

  // ── Serviços — Eletrônica ─────────────────────────────────────
  const servicosEletronica = [
    { nome: "Assistência Técnica de Celular", descricao: "Diagnóstico e reparo de smartphones", preco: 80.00, estoque: 999, imagem: "https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=400&h=300&fit=crop", categoria: "Eletrônica" },
    { nome: "Conserto de Eletrodoméstico", descricao: "Reparo de geladeiras, máquinas de lavar e fogões", preco: 120.00, estoque: 999, imagem: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop", categoria: "Eletrônica" },
  ];

  for (const p of servicosEletronica) {
    await prisma.produto.create({ data: { ...p, tipo: "SERVICO", fornecedorId: fornecedor.id } }).catch(() => {});
  }

  // ── Serviços — Cultura ────────────────────────────────────────
  const servicosCultura = [
    { nome: "Aula de Violão (mensal)", descricao: "4 aulas por mês, 1h cada, iniciante ao intermediário", preco: 180.00, estoque: 999, imagem: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=300&fit=crop", categoria: "Cultura" },
    { nome: "Sonorização para Eventos", descricao: "Equipamento de som para eventos até 200 pessoas", preco: 800.00, estoque: 5, imagem: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=300&fit=crop", categoria: "Cultura" },
    { nome: "Aula de Canto (mensal)", descricao: "Aulas de técnica vocal, 4 encontros mensais", preco: 200.00, estoque: 999, imagem: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=300&fit=crop", categoria: "Cultura" },
  ];

  for (const p of servicosCultura) {
    await prisma.produto.create({ data: { ...p, tipo: "SERVICO", empreendedorId: emp1.id } }).catch(() => {});
  }

  // ── Serviços — Serviços Gerais ────────────────────────────────
  const servicosGerais = [
    { nome: "Consulta de Contabilidade", descricao: "Consultoria contábil para MEIs e pequenas empresas", preco: 250.00, estoque: 999, imagem: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop", categoria: "Serviços" },
    { nome: "Aulas Particulares (hora)", descricao: "Reforço escolar em Matemática, Português ou Ciências", preco: 60.00, estoque: 999, imagem: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop", categoria: "Serviços" },
    { nome: "Consultoria de Negócios", descricao: "Plano de negócios e estratégia para empreendedores", preco: 300.00, estoque: 999, imagem: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop", categoria: "Serviços" },
    { nome: "Manutenção de Veículos", descricao: "Revisão geral e reparos mecânicos", preco: 200.00, estoque: 20, imagem: "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=400&h=300&fit=crop", categoria: "Serviços" },
  ];

  for (const p of servicosGerais) {
    await prisma.produto.create({ data: { ...p, tipo: "SERVICO", empreendedorId: emp2.id } }).catch(() => {});
  }

  // ── Agropecuária ──────────────────────────────────────────────
  const produtosAgro = [
    { nome: "Ração para Cães 15kg", descricao: "Ração premium para cães adultos de porte médio", preco: 119.90, estoque: 30, imagem: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&h=300&fit=crop", categoria: "Agropecuária" },
    { nome: "Adubo Orgânico 5kg", descricao: "Composto orgânico para hortas e jardins", preco: 28.00, estoque: 40, imagem: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop", categoria: "Agropecuária" },
    { nome: "Sementes de Alface (envelope)", descricao: "Sementes selecionadas, alta germinação", preco: 5.50, estoque: 60, imagem: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400&h=300&fit=crop", categoria: "Agropecuária" },
  ];

  for (const p of produtosAgro) {
    await prisma.produto.create({ data: { ...p, tipo: "PRODUTO", lojaId: loja.id } }).catch(() => {});
  }

  // ── Campanhas promocionais de exemplo ────────────────────────────

  // 1) DESCONTO — alguns produtos em destaque
  const produtosDestaque = await prisma.produto.findMany({ take: 5 });
  await prisma.campanha.create({
    data: {
      nome: "Promoção de Lançamento ConectaMarket",
      descricao: "10% de desconto em produtos selecionados do marketplace",
      tipo: "DESCONTO",
      valor: 10,
      inicio: new Date(),
      fim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      produtos: { create: produtosDestaque.map((p) => ({ produtoId: p.id })) },
    },
  }).catch(() => {});

  // 2) CASHBACK — produtos da categoria Agropecuária
  const produtosAgroCampanha = await prisma.produto.findMany({ where: { categoria: "Agropecuária" } });
  if (produtosAgroCampanha.length > 0) {
    await prisma.campanha.create({
      data: {
        nome: "Cashback Agro",
        descricao: "Compre produtos agropecuários e receba 10% de volta na sua carteira",
        tipo: "CASHBACK",
        valor: 10,
        inicio: new Date(),
        fim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        produtos: { create: produtosAgroCampanha.map((p) => ({ produtoId: p.id })) },
      },
    }).catch(() => {});
  }

  // 3) BRINDE — serviços de Cultura ganham um brinde (ex: palheta junto com aula de música)
  const aulaViolao = await prisma.produto.findFirst({ where: { nome: "Fone de Ouvido Bluetooth" } });
  const servicosCulturaCampanha = await prisma.produto.findMany({ where: { categoria: "Cultura", tipo: "SERVICO" } });
  if (aulaViolao && servicosCulturaCampanha.length > 0) {
    await prisma.campanha.create({
      data: {
        nome: "Brinde Cultura",
        descricao: "Contrate serviços de Cultura e ganhe um fone de ouvido Bluetooth de brinde",
        tipo: "BRINDE",
        valor: 0,
        inicio: new Date(),
        fim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        brindeProdutoId: aulaViolao.id,
        produtos: { create: servicosCulturaCampanha.map((p) => ({ produtoId: p.id })) },
      },
    }).catch(() => {});
  }

  console.log("✅ Seed concluído!");
  console.log("📧 Usuários criados:");
  console.log("   admin@abadeus.com       → ADMINISTRADOR");
  console.log("   mercado@abadeus.com     → LOJISTA");
  console.log("   fornecedor@abadeus.com  → FORNECEDOR");
  console.log("   salao@abadeus.com       → EMPREENDEDOR");
  console.log("   pizzaria@abadeus.com    → EMPREENDEDOR");
  console.log("   cliente@abadeus.com     → CLIENTE");
  console.log("   Senha de todos: senha123");
}

main().catch(console.error).finally(() => prisma.$disconnect());
