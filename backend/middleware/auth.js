const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// Middleware de autenticação
// Verifica se o usuário enviou um token JWT válido no cabeçalho Authorization
const protect = async (req, res, next) => {
  try {
    // O cabeçalho deve vir no formato: "Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token não fornecido.' });
    }

    // Extrai só o token (remove o "Bearer " do início)
    const token = authHeader.split(' ')[1];

    // Verifica se o token é válido e decodifica os dados
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Busca o usuário no banco com o ID que estava no token
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Usuário não encontrado.' });
    }

    // Salva o usuário no objeto req para usar nas rotas protegidas
    req.user = user;

    // Chama o próximo middleware ou a função da rota
    next();
  } catch (error) {
    // Token expirado ou inválido
    return res.status(401).json({ success: false, message: 'Token inválido ou expirado.' });
  }
};

module.exports = { protect };
