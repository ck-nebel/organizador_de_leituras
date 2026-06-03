// Middleware de tratamento de erros global
// Express chama esta função automaticamente quando next(error) é chamado em qualquer rota
const errorHandler = (err, req, res, next) => {
  console.error('Erro:', err.message);

  // Erros de validação do Mongoose (ex: campo obrigatório faltando)
  if (err.name === 'ValidationError') {
    const mensagens = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ success: false, message: mensagens[0] });
  }

  // Email ou campo único já cadastrado no banco
  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: 'E-mail já cadastrado.' });
  }

  // ID inválido (ex: passaram "abc" onde esperava um ObjectId do MongoDB)
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'ID inválido.' });
  }

  // Erro genérico — retorna 500 (erro interno do servidor)
  res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
};

module.exports = errorHandler;
