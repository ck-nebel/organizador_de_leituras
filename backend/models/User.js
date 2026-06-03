const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

// Schema = "molde" que define como um usuário é salvo no banco
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'E-mail é obrigatório'],
    unique: true,       // Não permite dois usuários com o mesmo email
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter pelo menos 6 caracteres'],
    select: false       // A senha NÃO é retornada nas buscas por padrão
  }
}, {
  timestamps: true      // Adiciona createdAt e updatedAt automaticamente
});

// Hook: antes de salvar, transforma a senha em hash (criptografa)
// Isso garante que a senha nunca seja salva como texto puro no banco
userSchema.pre('save', async function (next) {
  // Só refaz o hash se a senha foi alterada
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Método personalizado: compara a senha digitada com o hash salvo
userSchema.methods.comparePassword = async function (senhaDigitada) {
  return bcrypt.compare(senhaDigitada, this.password);
};

// Método personalizado: remove a senha antes de enviar o usuário como JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
