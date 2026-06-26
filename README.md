# ConectaMarket

Plataforma de marketplace híbrido (B2B e B2C) desenvolvida para conectar consumidores, lojistas, fornecedores e empreendedores locais em um único ambiente digital.

O projeto foi desenvolvido como Projeto Interdisciplinar do curso de Ciência da Computação da UNESC, com foco na aplicação prática de conceitos de desenvolvimento web, banco de dados e integração de sistemas.

---

## Objetivo

O ConectaMarket tem como objetivo fornecer uma plataforma acessível para divulgação, comercialização e gerenciamento de produtos e serviços, contribuindo para a transformação digital de pequenos empreendedores e estabelecimentos comerciais.

---

## Tecnologias Utilizadas

### Frontend

* React
* Vite
* React Router
* Context API
* Axios
* CSS

### Backend

* Node.js
* Express
* Prisma ORM
* JWT (JSON Web Token)
* bcryptjs

### Banco de Dados

* PostgreSQL

### Infraestrutura

* Docker
* Docker Compose
* Nginx

#### Protótipo das Interfaces

As telas do sistema foram prototipadas utilizando Figma:

https://www.figma.com/proto/Pfo7ekOG6CAXZX4vrO0G1M/Sem-t%C3%ADtulo?node-id=1-9&p=f&t=1cfsJnvAwSeFt11H-1&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1

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
* Checkout com validação de campos
* Uso de saldo de cashback no pagamento
* Histórico de pedidos
* Campanhas de desconto, cashback e brinde
* Carteira digital (saldo e histórico de cashback)
* Estorno automático de cashback e brindes em cancelamentos
* Brindes recebidos

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

## Estrutura do Projeto

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

## Executando com Docker

### Pré-requisitos

* Docker Desktop instalado

Download:

https://www.docker.com/products/docker-desktop/

---

### Primeira execução

#### 1. Clonar o repositório

```bash
git clone https://github.com/ViniciuspcBR/ConectaMarket.git
cd conectmarket
```

#### 2. Construir e iniciar os containers

```bash
docker-compose up --build
```

#### 3. Criar as tabelas do banco

Em outro terminal:

```bash
docker exec -it marketplace_backend npx prisma migrate dev --name v9_devolvido_cashback_uso
```

#### 4. Popular o banco

```bash
docker exec marketplace_backend node prisma/seed.js
```

---

### Acessar o sistema

Frontend:
http://localhost:3000

Backend:
http://localhost:3001

---

### Execução diária

Após a primeira configuração:

```bash
docker-compose up
```

---

### Parar os containers

```bash
docker-compose down
```

---

### Reiniciar completamente o ambiente

> **Atenção:** este procedimento remove todos os dados do banco.

```bash
docker-compose down -v
docker-compose up --build
docker exec -it marketplace_backend npx prisma migrate dev --name v9_devolvido_cashback_uso
docker exec marketplace_backend node prisma/seed.js
```

---

## Banco de Dados

O sistema utiliza PostgreSQL como banco de dados relacional, acessado através do Prisma ORM, responsável pelo gerenciamento das entidades e migrações.

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
* Carteira (saldo de cashback)
* CarteiraTransacao (histórico de cashback)
* BrindeRecebido (brindes ganhos em campanhas)

---

## Segurança e Autenticação

O sistema utiliza duas camadas de segurança para proteger os dados dos usuários:

**Senhas**
As senhas são armazenadas com hash utilizando bcryptjs (10 salt rounds). Nenhuma senha é salva em texto puro no banco de dados.

**Autenticação por JWT**
Após o login, o servidor gera um JSON Web Token (JWT) assinado com uma chave secreta. Esse token é enviado pelo frontend em todas as requisições seguintes no cabeçalho `Authorization: Bearer <token>`, permitindo que o backend identifique o usuário sem precisar consultar o banco a cada requisição.

O token possui validade de 24 horas. Caso expire, o sistema detecta automaticamente o erro de autenticação (HTTP 401) e redireciona o usuário para a tela de login, onde um novo token é gerado ao entrar novamente.

**Controle de acesso por perfil**
Cada rota da API é protegida pelo middleware `autorizar(...roles)`, que verifica o perfil do usuário contido no token (ADMINISTRADOR, LOJISTA, FORNECEDOR, EMPREENDEDOR ou CLIENTE) e bloqueia o acesso caso o perfil não tenha permissão para aquela operação.

---

## Usuários de Demonstração

Todos os usuários possuem a senha:
senha123

| Perfil        | E-mail                 |
| ------------- | ---------------------- |
| Administrador | admin@abadeus.com      |
| Lojista       | mercado@abadeus.com    |
| Fornecedor    | fornecedor@abadeus.com |
| Empreendedor  | salao@abadeus.com      |
| Empreendedor  | pizzaria@abadeus.com   |
| Cliente       | cliente@abadeus.com    |

---

## Desenvolvido por

* Gabriel Borges Rocha
* João Vitor Mondardo dos Santos
* Matheus Kjillim Lenz
* Vilson Vinícius Anacleto Frassetto
* Vinicius Pereira Cardoso

Projeto desenvolvido para as disciplinas:

* Desenvolvimento de Aplicações II
* Gerenciamento de Dados II

Curso de Ciência da Computação — UNESC.