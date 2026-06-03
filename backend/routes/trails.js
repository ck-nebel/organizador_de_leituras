const express = require('express');
const { getTrails, getTrailById, createTrail, updateTrail, deleteTrail, updateTrailBookStatus } = require('../controllers/trailController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Todas as rotas de trilhas precisam de autenticação
router.use(protect);

router.get('/',    getTrails);      // Lista todas as trilhas
router.get('/:id', getTrailById);   // Busca uma trilha por ID
router.post('/',   createTrail);    // Cria uma trilha
router.put('/:id', updateTrail);    // Atualiza uma trilha
router.delete('/:id', deleteTrail); // Remove uma trilha

// Atualiza o status de um livro dentro de uma trilha
router.patch('/:id/books/:bookId/status', updateTrailBookStatus);

module.exports = router;
