const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  // Referência ao usuário dono do livro
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Título é obrigatório'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Autor é obrigatório'],
    trim: true
  },
  genre: {
    type: String,
    default: ''
  },
  coverUrl: {
    type: String,
    default: ''
  },
  totalPages: {
    type: Number,
    default: null
  },
  currentPage: {
    type: Number,
    default: 0
  },
  // Status de leitura — só aceita esses 4 valores
  status: {
    type: String,
    enum: ['quero_ler', 'lendo', 'concluido', 'pausado'],
    default: 'quero_ler'
  },
  // Avaliação de 0 a 5
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  },
  startDate: {
    type: Date,
    default: null
  },
  endDate: {
    type: Date,
    default: null
  },
  tags: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('Book', bookSchema);
