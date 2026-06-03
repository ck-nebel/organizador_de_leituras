const Book = require('../models/Book');

// GET /api/books — Lista os livros do usuário logado
const getBooks = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    // Filtro base: apenas os livros do usuário logado
    const filtro = { user: req.user._id };

    // Se passou um status na query (?status=lendo), filtra por ele
    if (status) {
      filtro.status = status;
    }

    // Se passou uma busca (?search=harry), busca no título ou autor
    if (search) {
      filtro.$or = [
        { title:  { $regex: search, $options: 'i' } }, // 'i' = case insensitive
        { author: { $regex: search, $options: 'i' } }
      ];
    }

    // Paginação: calcula quantos registros pular
    const pular = (Number(page) - 1) * Number(limit);

    // Busca os livros com filtro, ordenados pelo mais recente
    const books = await Book.find(filtro)
      .sort({ updatedAt: -1 })
      .skip(pular)
      .limit(Number(limit));

    // Conta o total de livros (para o frontend saber quantas páginas existem)
    const total = await Book.countDocuments(filtro);

    res.json({
      success: true,
      data: books,
      pagination: {
        total,
        page:  Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/books/:id — Busca um livro pelo ID
const getBookById = async (req, res, next) => {
  try {
    // Garante que só retorna o livro se ele pertencer ao usuário logado
    const book = await Book.findOne({ _id: req.params.id, user: req.user._id });

    if (!book) {
      return res.status(404).json({ success: false, message: 'Livro não encontrado.' });
    }

    res.json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};

// POST /api/books — Cria um novo livro
const createBook = async (req, res, next) => {
  try {
    const { title, author } = req.body;

    // Validação básica dos campos obrigatórios
    if (!title || !author) {
      return res.status(400).json({ success: false, message: 'Título e autor são obrigatórios.' });
    }

    // Cria o livro associado ao usuário logado
    const book = await Book.create({ ...req.body, user: req.user._id });

    res.status(201).json({ success: true, message: 'Livro adicionado!', data: book });
  } catch (error) {
    next(error);
  }
};

// PUT /api/books/:id — Atualiza um livro
const updateBook = async (req, res, next) => {
  try {
    // findOneAndUpdate: busca, atualiza e retorna o documento atualizado
    const book = await Book.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id }, // filtro
      req.body,                                    // dados a atualizar
      { new: true, runValidators: true }           // retorna o novo, valida os campos
    );

    if (!book) {
      return res.status(404).json({ success: false, message: 'Livro não encontrado.' });
    }

    res.json({ success: true, message: 'Livro atualizado!', data: book });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/books/:id — Remove um livro
const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!book) {
      return res.status(404).json({ success: false, message: 'Livro não encontrado.' });
    }

    res.json({ success: true, message: 'Livro removido.' });
  } catch (error) {
    next(error);
  }
};

// GET /api/books/stats — Estatísticas dos livros do usuário
const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Conta os livros de cada status com queries simples
    const total     = await Book.countDocuments({ user: userId });
    const lendo     = await Book.countDocuments({ user: userId, status: 'lendo' });
    const concluido = await Book.countDocuments({ user: userId, status: 'concluido' });
    const quero_ler = await Book.countDocuments({ user: userId, status: 'quero_ler' });
    const pausado   = await Book.countDocuments({ user: userId, status: 'pausado' });

    // Calcula a média de avaliação manualmente
    const livrosAvaliados = await Book.find({ user: userId, rating: { $gt: 0 } }, 'rating');
    let avgRating = 0;
    if (livrosAvaliados.length > 0) {
      const soma = livrosAvaliados.reduce((acc, b) => acc + b.rating, 0);
      avgRating  = Math.round((soma / livrosAvaliados.length) * 10) / 10;
    }

    res.json({
      success: true,
      data: { total, lendo, concluido, quero_ler, pausado, avgRating }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBooks, getBookById, createBook, updateBook, deleteBook, getStats };
