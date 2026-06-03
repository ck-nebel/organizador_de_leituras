const Trail = require('../models/Trail');

// Função auxiliar: calcula o progresso de uma trilha em porcentagem
function calcularProgresso(books) {
  if (!books || books.length === 0) return 0;
  const concluidos = books.filter(b => b.status === 'concluido').length;
  return Math.round((concluidos / books.length) * 100);
}

// GET /api/trails — Lista todas as trilhas do usuário
const getTrails = async (req, res, next) => {
  try {
    const trails = await Trail.find({ user: req.user._id }).sort({ updatedAt: -1 });

    // Adiciona o campo "progress" em cada trilha antes de enviar
    const trailsComProgresso = trails.map(t => ({
      ...t.toObject(),
      progress: calcularProgresso(t.books)
    }));

    res.json({ success: true, data: trailsComProgresso });
  } catch (error) {
    next(error);
  }
};

// GET /api/trails/:id — Busca uma trilha pelo ID
const getTrailById = async (req, res, next) => {
  try {
    const trail = await Trail.findOne({ _id: req.params.id, user: req.user._id });

    if (!trail) {
      return res.status(404).json({ success: false, message: 'Trilha não encontrada.' });
    }

    res.json({
      success: true,
      data: { ...trail.toObject(), progress: calcularProgresso(trail.books) }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/trails — Cria uma nova trilha
const createTrail = async (req, res, next) => {
  try {
    const { title, subject } = req.body;

    if (!title || !subject) {
      return res.status(400).json({ success: false, message: 'Título e assunto são obrigatórios.' });
    }

    // Remove _id nulo dos livros para o MongoDB gerar automaticamente
    if (req.body.books) {
      req.body.books = req.body.books.map(b => {
        if (!b._id) { const { _id, ...resto } = b; return resto; }
        return b;
      });
    }

    const trail = await Trail.create({ ...req.body, user: req.user._id });

    res.status(201).json({ success: true, message: 'Trilha criada!', data: trail });
  } catch (error) {
    next(error);
  }
};

// PUT /api/trails/:id — Atualiza uma trilha
const updateTrail = async (req, res, next) => {
  try {
    // Remove _id nulo dos livros antes de salvar
    if (req.body.books) {
      req.body.books = req.body.books.map(b => {
        if (!b._id) { const { _id, ...resto } = b; return resto; }
        return b;
      });
    }

    const trail = await Trail.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!trail) {
      return res.status(404).json({ success: false, message: 'Trilha não encontrada.' });
    }

    res.json({ success: true, message: 'Trilha atualizada!', data: trail });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/trails/:id — Remove uma trilha
const deleteTrail = async (req, res, next) => {
  try {
    const trail = await Trail.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!trail) {
      return res.status(404).json({ success: false, message: 'Trilha não encontrada.' });
    }

    res.json({ success: true, message: 'Trilha removida.' });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/trails/:id/books/:bookId/status — Atualiza o status de um livro dentro de uma trilha
const updateTrailBookStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    // Usa o operador posicional $ do MongoDB para atualizar só o livro correto dentro do array
    // books._id filtra qual livro do array atualizar, books.$.status define o novo valor
    const trail = await Trail.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, 'books._id': req.params.bookId },
      { $set: { 'books.$.status': status } },
      { new: true } // retorna o documento já com o status novo
    );

    if (!trail) {
      return res.status(404).json({ success: false, message: 'Trilha ou livro não encontrado.' });
    }

    res.json({
      success: true,
      message: 'Status atualizado!',
      data: { ...trail.toObject(), progress: calcularProgresso(trail.books) }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTrails, getTrailById, createTrail, updateTrail, deleteTrail, updateTrailBookStatus };
