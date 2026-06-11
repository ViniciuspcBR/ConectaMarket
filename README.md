# Marketplace Colaborativo ABADEUS × UNESC

Primeira vez (ou após down -v):
# 1. Sobe tudo
docker-compose up --build

# 2. Em outro terminal — cria as tabelas
docker exec -it marketplace_backend npx prisma migrate dev --name init

# 3. Popula o banco com dados iniciais
docker exec marketplace_backend node prisma/seed.js

-----------------------------------------------------------------------

Do dia a dia (após a primeira vez):
Só isso — dados já estão salvos no volume
docker-compose up

Se der down -v (apaga tudo) — repete o processo completo:
bashdocker-compose down -v
docker-compose up --build
docker exec -it marketplace_backend npx prisma migrate dev --name init
docker exec marketplace_backend node prisma/seed.js

Acessa http://localhost:3000 e testa com admin@abadeus.com / senha123.

*! Nunca use down -v no dia a dia — ele apaga todos os dados do banco. Use só down para parar. !*

*O banco já tem 40+ produtos em 8 categorias prontos para demonstrar na banca.*

Plataforma híbrida (B2B + B2C) conectando fornecedores, lojistas e comunidade local.  
Projeto interdisciplinar — 4ª fase Ciência da Computação — UNESC 2026/01.

# Tecnologias

| Camada        | Tecnologia             |
|---------------|------------------------|
| Frontend      | React + Vite           |
| Backend       | Node.js + Express      |
| Banco de dados| PostgreSQL + Prisma    |
| Autenticação  | JWT                    |
| Infra         | Docker + Docker Compose|

-----------------------------------------------------------------------

# Rodar com Docker

Instalar o **Docker Desktop**: https://www.docker.com/products/docker-desktop/

# Passos
```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/marketplace.git
cd marketplace

# 2. Sobe tudo (banco + backend + frontend)
docker-compose up --build
```

Pronto! Acesse **http://localhost:3000** no navegador.

Para parar:
```bash
docker-compose down
```

Para parar e apagar os dados do banco:
```bash
docker-compose down -v
```

---

## 💻 Rodar localmente (sem Docker)

```bash
# Backend
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev

# Frontend (outro terminal)
cd frontend
npm install
npm run dev
```

---

## Perfis de Usuário

| Perfil        | Pode fazer                                   | Email                                        | Senha
|---------------|----------------------------------------------|----------------------------------------------|---------------------------
| ADMINISTRADOR | Tudo                                         | admin@abadeus.com                            | Todos senha123
| LOJISTA       | Loja, produtos, pedidos, campanhas           | mercado@abadeus.com                          |
| FORNECEDOR    | Produtos e pedidos B2B                       | fornecedor@abadeus.com                       |
| EMPREENDEDOR  | Produtos/serviços na comunidade              | salao@abadeus.com / pizzaria@abadeus.com     |
| CLIENTE       | Navegar, comprar, avaliar                    | cliente@abadeus.com                          |
