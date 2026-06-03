const express = require('express');
const { getBooks, getBookById, createBook, updateBook, deleteBook, getStats } = require('../controllers/bookController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Aplica o middleware "protect" em TODAS as rotas abaixo
// Ou seja, o usuário precisa estar logado para acessar qualquer rota de livros
router.use(protect);

router.get('/stats', getStats);      // Deve vir ANTES de /:id para não conflitar
router.get('/',      getBooks);      // Lista todos os livros
router.get('/:id',   getBookById);   // Busca um livro por ID
router.post('/',     createBook);    // Cria um livro
router.put('/:id',   updateBook);    // Atualiza um livro
router.delete('/:id', deleteBook);   // Remove um livro

module.exports = router;
