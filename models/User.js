const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

//Schéma de l'utilisateur
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

//Rend le Compte de l'utilisateur unique
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);