const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Crée un compte utilisateur
exports.signup = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)    //Crypte le mot de passe
    .then(hash => {    //créer l'utilisateur en model user
      const user = new User({
        email: req.body.email,
        password: hash
      });
      user.save()    //Créer le nouvel utilisateur
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};


//Connection au compte de l'utilisateur
exports.login = (req, res, next) => {    //Cherche si l'utilisateur est déjà existant
  User.findOne({ email: req.body.email })
      .then(user => {
          if (!user) {    //Utilisateur non trouvé
              return res.status(401).json({ error: 'Utilisateur non trouvé !' });
          }
          bcrypt.compare(req.body.password, user.password)
              .then(valid => {
                  if (!valid) {    //En cas de mauvais mot de passe
                      return res.status(401).json({ error: 'Mot de passe incorrect !' });
                  }
                  res.status(200).json({    //L'utilisateur a été trouvé
                      userId: user._id,
                      token: jwt.sign(
                          { userId: user._id },
                          process.env.JWT_KEY,    //Asigne un token qui donne accés aux autres routes
                          { expiresIn: '24h' }
                      )
                  });
              })
              .catch(error => res.status(500).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
};