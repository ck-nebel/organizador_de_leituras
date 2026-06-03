const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// Função auxiliar: gera um token JWT com o ID do usuário
function gerarToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/register — Cadastro de novo usuário
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validação simples dos campos obrigatórios
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Preencha todos os campos.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Senha deve ter pelo menos 6 caracteres.' });
    }

    // Verifica se o email já está cadastrado
    const jaExiste = await User.findOne({ email });
    if (jaExiste) {
      return res.status(409).json({ success: false, message: 'E-mail já cadastrado.' });
    }

    // Cria o usuário (a senha será hasheada automaticamente pelo model)
    const user  = await User.create({ name, email, password });
    const token = gerarToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Cadastro realizado!',
      token,
      user
    });
  } catch (error) {
    next(error); // Passa o erro para o errorHandler
  }
};

// POST /api/auth/login — Login do usuário
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Informe e-mail e senha.' });
    }

    // Busca o usuário pelo email — inclui a senha (que normalmente fica oculta)
    const user = await User.findOne({ email }).select('+password');

    // Verifica se o usuário existe e se a senha está correta
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'E-mail ou senha incorretos.' });
    }

    const token = gerarToken(user._id);

    // Remove a senha do objeto antes de enviar na resposta
    user.password = undefined;

    res.json({
      success: true,
      message: 'Login realizado!',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me — Retorna os dados do usuário logado
// (o middleware "protect" já colocou o usuário em req.user)
const getMe = (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = { register, login, getMe };
