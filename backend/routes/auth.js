const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Rotas públicas (não precisam de token)
router.post('/register', register);  // Cadastro
router.post('/login',    login);     // Login

// Rota protegida (precisa de token)
router.get('/me', protect, getMe);   // Dados do usuário logado

module.exports = router;
