require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const mongoose = require('mongoose');

const authRoutes  = require('./routes/auth');
const bookRoutes  = require('./routes/books');
const trailRoutes = require('./routes/trails');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({
  origin: 'https://organizador-de-leituras-frontend.vercel.app' // Depois do deploy, troque pelo domínio exato do seu frontend
}));
app.options('*', cors());

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => {
    console.error('❌ Erro ao conectar no MongoDB:', err.message);
    process.exit(1);
  });

app.use('/api/auth',   authRoutes);
app.use('/api/books',  bookRoutes);
app.use('/api/trails', trailRoutes);

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Rota não encontrada' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
  });
}

module.exports = app;
