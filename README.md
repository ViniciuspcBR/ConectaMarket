# ConectMarket

Plataforma de marketplace híbrido (B2B e B2C) desenvolvida para conectar consumidores, lojistas, fornecedores e empreendedores locais em um único ambiente digital.

O projeto foi desenvolvido como Projeto Interdisciplinar do curso de Ciência da Computação da UNESC, com foco na aplicação prática de conceitos de desenvolvimento web, banco de dados e integração de sistemas.

---

## Objetivo

O ConectMarket tem como objetivo fornecer uma plataforma acessível para divulgação, comercialização e gerenciamento de produtos e serviços, contribuindo para a transformação digital de pequenos empreendedores e estabelecimentos comerciais.

---

## Tecnologias Utilizadas

### Frontend

* React
* Vite
* React Router
* Context API
* CSS

### Backend

* Node.js
* Express
* Prisma ORM
* JWT (JSON Web Token)

### Banco de Dados

* PostgreSQL

### Infraestrutura

* Docker
* Docker Compose
* Nginx

---

## Funcionalidades

### Usuários

* Cadastro
* Login
* Autenticação JWT
* Controle de acesso por perfil

### Produtos

* Cadastro de produtos
* Edição de produtos
* Exclusão de produtos
* Catálogo de produtos

### Marketplace

* Visualização de produtos
* Carrinho de compras
* Checkout
* Histórico de pedidos

### Gestão

* Dashboard administrativo
* Gestão de usuários
* Gestão de campanhas
* Gestão de pedidos
* Gestão de avaliações

### Perfis do Sistema

* Administrador
* Lojista
* Fornecedor
* Empreendedor
* Cliente

---

# Estrutura do Projeto

```text
conectmarket/
│
├── backend/
│   ├── prisma/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── config/
│   │   ├── app.js
│   │   └── server.js
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

# Executando com Docker

## Pré-requisitos

* Docker Desktop instalado

Download:

https://www.docker.com/products/docker-desktop/

---

## Primeira execução

### 1. Clonar o repositório

```bash
git clone https://github.com/SEU-USUARIO/conectmarket.git
cd conectmarket
```

### 2. Construir e iniciar os containers

```bash
docker-compose up --build
```

### 3. Criar as tabelas do banco

Em outro terminal:

```bash
docker exec -it marketplace_backend npx prisma migrate dev --name init
```

### 4. Popular o banco

```bash
docker exec marketplace_backend node prisma/seed.js
```

---

## Acessar o sistema

Frontend:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:3001
```

---

# Execução diária

Após a primeira configuração:

```bash
docker-compose up
```

---

# Parar os containers

```bash
docker-compose down
```

---

# Reiniciar completamente o ambiente

⚠️ Atenção: este procedimento remove todos os dados do banco.

```bash
docker-compose down -v
docker-compose up --build

docker exec -it marketplace_backend npx prisma migrate dev --name init

docker exec marketplace_backend node prisma/seed.js
```

---

# Banco de Dados

O sistema utiliza PostgreSQL como banco de dados relacional.

O acesso é realizado através do Prisma ORM, responsável pelo gerenciamento das entidades e migrações.

Principais entidades:

* Usuário
* Loja
* Fornecedor
* Empreendedor
* Produto
* Pedido
* ItemPedido
* Campanha
* Avaliação

---

# Autenticação

O sistema utiliza JWT (JSON Web Token) para autenticação e autorização dos usuários.

As permissões são controladas de acordo com o perfil associado à conta.

---

# Usuários de Demonstração

Todos os usuários possuem a senha:

```text
senha123
```

| Perfil        | E-mail                                                  |
| ------------- | ------------------------------------------------------- |
| Administrador | [admin@abadeus.com](mailto:admin@abadeus.com)           |
| Lojista       | [mercado@abadeus.com](mailto:mercado@abadeus.com)       |
| Fornecedor    | [fornecedor@abadeus.com](mailto:fornecedor@abadeus.com) |
| Empreendedor  | [salao@abadeus.com](mailto:salao@abadeus.com)           |
| Empreendedor  | [pizzaria@abadeus.com](mailto:pizzaria@abadeus.com)     |
| Cliente       | [cliente@abadeus.com](mailto:cliente@abadeus.com)       |

---

# Desenvolvido por

GABRIEL BORGES ROCHA
JOÃO VITOR MONDARDO DOS SANTOS
MATHEUS KJILLIM LENZ
VILSON VINíCIUS ANACLETO FRASSETTO
VINICIUS PEREIRA CARDOSO 

Projeto desenvolvido para as disciplinas:
* Desenvolvimento de Aplicações II
* Gerenciamento de Dados II

Curso de Ciência da Computação – UNESC.
