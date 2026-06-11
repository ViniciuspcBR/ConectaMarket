# 🚀 Guia de Instalação Completo — Windows
## Marketplace Colaborativo ABADEUS × UNESC

Siga cada passo na ordem. Não pule nenhum!

---

## 📦 O QUE VAMOS INSTALAR

| Programa       | Para quê serve                          |
|----------------|-----------------------------------------|
| Node.js        | Rodar o backend e o frontend            |
| PostgreSQL      | Banco de dados                          |
| VS Code        | Editor de código                        |
| Git            | Controle de versão (recomendado)        |

---

## PASSO 1 — Instalar o Node.js

1. Acesse: https://nodejs.org
2. Clique no botão **"LTS"** (versão recomendada, ex: 20.x.x)
3. Baixe o instalador `.msi`
4. Execute o instalador e clique **Next** em tudo (deixe todas as opções padrão marcadas)
5. Na tela "Tools for Native Modules", **marque a caixinha** se aparecer

### ✅ Verificar se instalou corretamente
Abra o **Prompt de Comando** (Win + R → digite `cmd` → Enter) e rode:
```
node --version
npm --version
```
Deve aparecer algo como `v20.x.x` e `10.x.x`. Se apareceu, está OK!

---

## PASSO 2 — Instalar o PostgreSQL

1. Acesse: https://www.postgresql.org/download/windows/
2. Clique em **"Download the installer"**
3. Baixe a versão mais recente para Windows x86-64
4. Execute o instalador

### Durante a instalação:
- **Installation Directory**: deixe o padrão
- **Components**: deixe tudo marcado (PostgreSQL Server, pgAdmin 4, Stack Builder, Command Line Tools)
- **Data Directory**: deixe o padrão
- **Password**: crie uma senha e **ANOTE ELA!** (ex: `postgres123`)
  > ⚠️ Você vai precisar dessa senha para configurar o projeto!
- **Port**: deixe `5432` (padrão)
- **Locale**: deixe o padrão
- Clique Next até finalizar
- Na última tela, **desmarque** "Launch Stack Builder" e clique Finish

### ✅ Verificar se instalou corretamente
1. Abra o menu Iniciar e procure por **pgAdmin 4**
2. Abra o pgAdmin — ele vai abrir no navegador
3. Se pediu senha master, crie uma (pode ser a mesma que você definiu)
4. Se aparecer o painel do pgAdmin, está funcionando!

---

## PASSO 3 — Criar o Banco de Dados no pgAdmin

1. No pgAdmin, no painel esquerdo, expanda: **Servers → PostgreSQL → Databases**
2. Clique com o botão direito em **Databases**
3. Clique em **Create → Database...**
4. No campo **Database**, digite: `marketplace_abadeus`
5. Clique em **Save**

Pronto! O banco de dados foi criado.

---

## PASSO 4 — Instalar o VS Code

1. Acesse: https://code.visualstudio.com
2. Clique em **Download for Windows**
3. Execute o instalador
4. Durante a instalação, **marque estas opções**:
   - ✅ Adicionar ao PATH
   - ✅ Registrar Code como editor para tipos de arquivo suportados
   - ✅ Adicionar ação "Abrir com Code" ao menu de contexto de arquivos
   - ✅ Adicionar ação "Abrir com Code" ao menu de contexto de diretórios
5. Conclua a instalação

### Extensões recomendadas no VS Code
Abra o VS Code, clique no ícone de extensões (Ctrl+Shift+X) e instale:
- **Prisma** (para syntax highlight do schema.prisma)
- **ESLint**
- **Prettier**
- **ES7+ React/Redux/React-Native snippets**

---

## PASSO 5 — Instalar o Git (recomendado)

1. Acesse: https://git-scm.com/download/win
2. Baixe e instale deixando todas as opções no padrão
3. Verifique: abra o cmd e rode `git --version`

---

## PASSO 6 — Configurar o Projeto

### 6.1 — Descompactar o projeto
1. Baixe o arquivo `marketplace.zip` que foi gerado
2. Clique com botão direito → **Extrair Tudo...**
3. Escolha uma pasta fácil, como `C:\projetos\marketplace`

### 6.2 — Abrir no VS Code
1. Abra o VS Code
2. Vá em **File → Open Folder**
3. Selecione a pasta `marketplace`

---

## PASSO 7 — Configurar o Backend

### 7.1 — Abrir o terminal no VS Code
Pressione **Ctrl + ` ** (acento grave) para abrir o terminal integrado.

### 7.2 — Entrar na pasta do backend
```bash
cd backend
```

### 7.3 — Criar o arquivo .env
No VS Code, dentro da pasta `backend`, crie um arquivo chamado `.env` com o seguinte conteúdo:

```
DATABASE_URL="postgresql://postgres:SUA_SENHA_AQUI@localhost:5432/marketplace_abadeus"
JWT_SECRET="marketplace_abadeus_secret_2026"
PORT=3001
```

> ⚠️ Substitua `SUA_SENHA_AQUI` pela senha que você criou na instalação do PostgreSQL!
> Exemplo: se sua senha é `postgres123`, fica:
> `DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/marketplace_abadeus"`

### 7.4 — Instalar as dependências
No terminal (dentro da pasta backend):
```bash
npm install
```
Aguarde baixar todos os pacotes. Pode demorar alguns minutos.

### 7.5 — Rodar as migrations do banco de dados
```bash
npx prisma migrate dev --name inicio
```
Esse comando vai criar todas as tabelas no PostgreSQL automaticamente.
Quando perguntar um nome, pode digitar `inicio` e pressionar Enter.

### 7.6 — Iniciar o backend
```bash
npm run dev
```
Deve aparecer: `✅ Servidor rodando na porta 3001`

---

## PASSO 8 — Configurar o Frontend

### 8.1 — Abrir um NOVO terminal no VS Code
Clique no **+** no canto do terminal para abrir um segundo terminal.

### 8.2 — Entrar na pasta do frontend
```bash
cd frontend
```

### 8.3 — Instalar as dependências
```bash
npm install
```

### 8.4 — Iniciar o frontend
```bash
npm run dev
```
Deve aparecer algo como:
```
  VITE v5.x.x  ready in 500 ms
  ➜  Local:   http://localhost:3000/
```

---

## PASSO 9 — Acessar o sistema

Abra seu navegador e acesse:
```
http://localhost:3000
```

A tela de login do Marketplace ABADEUS vai aparecer! 🎉

---

## ❗ PROBLEMAS COMUNS

### "npm não é reconhecido como comando"
→ Reinicie o computador após instalar o Node.js e tente novamente.

### "Erro de conexão com o banco de dados"
→ Verifique se o PostgreSQL está rodando:
  - Abra o pgAdmin e veja se consegue conectar
  - Verifique se a senha no arquivo `.env` está correta

### "Port 3001 already in use"
→ Mude a porta no `.env` para `PORT=3002`

### "npx prisma migrate dev" deu erro
→ Verifique se o banco `marketplace_abadeus` foi criado no pgAdmin (Passo 3)
→ Verifique se a senha no `.env` está correta

---

## 📁 ESTRUTURA FINAL DO PROJETO

```
marketplace/
├── backend/
│   ├── .env                  ← Você criou este arquivo
│   ├── package.json
│   ├── prisma/
│   │   └── schema.prisma     ← Modelos do banco de dados
│   └── src/
│       ├── server.js
│       ├── app.js
│       ├── config/
│       ├── controllers/
│       ├── middlewares/
│       └── routes/
└── frontend/
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── pages/
        ├── components/
        ├── context/
        └── services/
```

---

## 🔁 COMO RODAR O PROJETO NO DIA A DIA

Sempre que for trabalhar no projeto, abra o VS Code e execute:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Depois acesse `http://localhost:3000` no navegador.
