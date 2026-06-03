# Organizador de Leituras

O **Organizador de Leituras** é uma aplicação web full-stack projetada para ajudar leitores a catalogar, acompanhar e organizar sua vida literária. Conta com autenticação de usuários, uma API RESTful própria, gerenciamento completo de livros com status de leitura e avaliações, além de um sistema de trilhas de leitura para organizar sequências de livros por tema ou objetivo.

---

## Desenvolvedor

> Erick Pereira Camargo

---

## O Problema que Resolve

Leitores frequentemente perdem o controle sobre quais livros já leram, estão lendo ou querem ler, e não têm um lugar centralizado para registrar notas, avaliações e progresso. O Organizador de Leituras resolve isso oferecendo uma interface limpa e intuitiva para gerenciar toda a jornada de leitura em um único lugar.

---

## Público-Alvo

Leitores em geral, estudantes e qualquer pessoa que queira organizar sua biblioteca pessoal, acompanhar seu progresso de leitura e montar trilhas de estudo ou leitura temática.

---

## Funcionalidades (MVP)

* Autenticação de usuários (Login e Cadastro) com controle de sessão via JWT.
* Dashboard com estatísticas de leitura: total de livros, livros em andamento, concluídos, pausados e média de avaliação.
* Gerenciamento de Livros (CRUD completo): adicionar, listar, editar e remover livros da biblioteca pessoal.
* Controle de status de leitura por livro: `Quero Ler`, `Lendo`, `Concluído` e `Pausado`.
* Registro de página atual, total de páginas, avaliação (0–5 estrelas), notas pessoais, datas de início e fim, e tags.
* Busca e filtragem de livros por título, autor e status.
* Paginação na listagem de livros.
* Trilhas de Leitura (CRUD completo): criar sequências ordenadas de livros por assunto ou objetivo, com status individual por livro na trilha (`Pendente`, `Em Andamento`, `Concluído`).
* Vinculação de livros da biblioteca pessoal a entradas de uma trilha.

---

## Telas e Páginas

* `frontend/index.html`: Página de autenticação com abas de **Login** e **Cadastro** em um único formulário.
* `frontend/pages/dashboard.html`: Dashboard principal com cards de estatísticas de leitura do usuário e acesso rápido às demais seções.
* `frontend/pages/books.html`: Gerenciamento completo da biblioteca pessoal — listagem, busca, filtragem por status, adição e edição de livros.
* `frontend/pages/trails.html`: Gerenciamento de trilhas de leitura — criação, edição, remoção de trilhas e atualização do status de cada livro dentro delas.

---

## Tecnologias

### Backend
* Node.js com Express
* MongoDB com Mongoose (ODM)
* JSON Web Token (JWT) para autenticação
* bcryptjs para hash de senhas
* dotenv para variáveis de ambiente
* nodemon (desenvolvimento)

### Frontend
* HTML Semântico
* CSS Responsivo (Mobile First)
* JavaScript Vanilla com manipulação de DOM
* Consumo da API via `fetch`

---

## Como Rodar

### Pré-requisitos

* Node.js instalado
* Uma instância do MongoDB (local ou [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### Backend

1. Clone o repositório:
   ```bash
   git clone <url-do-repositorio>
   cd organizador_livros/backend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente — copie o arquivo de exemplo e preencha com seus dados:
   ```bash
   cp .env.example .env
   ```
   Edite o `.env` com sua `MONGODB_URI`, `JWT_SECRET` e `JWT_EXPIRES_IN`.

4. Inicie o servidor:
   ```bash
   # Produção
   npm start

   # Desenvolvimento (com hot-reload)
   npm run dev
   ```
   O servidor estará disponível em `http://localhost:5000`.

### Frontend

1. Acesse a pasta do frontend:
   ```bash
   cd organizador_livros/frontend
   ```

2. Sirva os arquivos localmente usando a extensão **Live Server** no VS Code ou um servidor HTTP simples:
   ```bash
   npx http-server . -p 5500
   ```

3. Abra `http://localhost:5500` no navegador (aponta para `index.html`).

4. Certifique-se de que a URL base da API no arquivo `frontend/js/api.js` aponta para o backend em execução (por padrão `http://localhost:5000`).

---

## Integração com a API (Endpoints)

### Autenticação — `/api/auth`
* `POST /api/auth/register` — Cadastro de novo usuário.
* `POST /api/auth/login` — Login e geração de token JWT.
* `GET /api/auth/me` — Retorna os dados do usuário autenticado *(requer token)*.

### Livros — `/api/books` *(todos requerem token)*
* `GET /api/books` — Lista os livros do usuário com suporte a filtros (`?status=`, `?search=`) e paginação (`?page=`, `?limit=`).
* `GET /api/books/stats` — Retorna estatísticas de leitura do usuário (totais por status e média de avaliação).
* `GET /api/books/:id` — Busca um livro específico pelo ID.
* `POST /api/books` — Adiciona um novo livro à biblioteca.
* `PUT /api/books/:id` — Atualiza os dados de um livro.
* `DELETE /api/books/:id` — Remove um livro da biblioteca.

### Trilhas — `/api/trails` *(todos requerem token)*
* `GET /api/trails` — Lista todas as trilhas do usuário.
* `GET /api/trails/:id` — Busca uma trilha específica pelo ID.
* `POST /api/trails` — Cria uma nova trilha de leitura.
* `PUT /api/trails/:id` — Atualiza os dados de uma trilha.
* `DELETE /api/trails/:id` — Remove uma trilha.
* `PATCH /api/trails/:id/books/:bookId/status` — Atualiza o status de um livro dentro de uma trilha.

## Deploy
Link: (https://organizador-de-leituras-frontend.vercel.app)
