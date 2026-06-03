const mongoose = require('mongoose');

// Schema dos livros dentro de uma trilha (sub-documento)
const trailBookSchema = new mongoose.Schema({
  title:  { type: String, required: true, trim: true },
  author: { type: String, default: '' },
  order:  { type: Number, required: true },  // Posição do livro na trilha
  status: {
    type: String,
    enum: ['pendente', 'em_andamento', 'concluido'],
    default: 'pendente'
  },
  notes:       { type: String, default: '' },
  linkedBook:  { type: mongoose.Schema.Types.ObjectId, ref: 'Book', default: null }
});

// Schema principal da trilha
const trailSchema = new mongoose.Schema({
  // Usuário dono da trilha
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title:       { type: String, required: [true, 'Título da trilha é obrigatório'], trim: true },
  subject:     { type: String, required: [true, 'Assunto é obrigatório'], trim: true },
  description: { type: String, default: '' },
  coverColor:  { type: String, default: '#7C3AED' },  // Cor do card da trilha
  isPublic:    { type: Boolean, default: false },
  books:       [trailBookSchema]  // Lista de livros da trilha
}, {
  timestamps: true
});

module.exports = mongoose.model('Trail', trailSchema);
