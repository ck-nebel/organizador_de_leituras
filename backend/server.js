// Carrega as variáveis do arquivo .env (MONGODB_URI, JWT_SECRET, etc.)
require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const mongoose = require('mongoose');

// Importa os arquivos de rotas
const authRoutes  = require('./routes/auth');
const bookRoutes  = require('./routes/books');
const trailRoutes = require('./routes/trails');

// Importa o tratador de erros global
const errorHandler = require('./middleware/errorHandler');

// Cria a aplicação Express
const app = express();

// ─── Middlewares globais ──────────────────────────────────────────────────────

// Permite que o frontend (outro domínio/porta) acesse a API
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500']
}));

// Permite receber dados em JSON no corpo das requisições
app.use(express.json());

// ─── Conexão com o banco de dados ─────────────────────────────────────────────

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => {
    console.error('❌ Erro ao conectar no MongoDB:', err.message);
    process.exit(1); // Encerra o servidor se não conseguir conectar
  });

// ─── Rotas da API ─────────────────────────────────────────────────────────────

app.use('/api/auth',   authRoutes);   // /api/auth/login, /api/auth/register, etc.
app.use('/api/books',  bookRoutes);   // /api/books, /api/books/:id, etc.
app.use('/api/trails', trailRoutes);  // /api/trails, /api/trails/:id, etc.

// Rota de verificação — útil para testar se o servidor está no ar
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Rota não encontrada — retorna 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Rota não encontrada' });
});

// Tratador de erros global (deve vir por último)
app.use(errorHandler);

// ─── Inicia o servidor ────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
