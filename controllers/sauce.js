const Sauce = require('../models/Sauce');
const fs = require('fs');

//Récuperer la liste de toutes les sauces
exports.getAll = (req, res, next) => {
  Sauce.find()
    .then(sauces => {
      res.status(200).json(sauces)
    })
    .catch(error => res.status(400).json({ error }));
};

// Récuperer une seule sauce en testant l'authentification de l'utilisateur
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id
  })
    .then(sauce => {
      res.status(200).json(sauce)
    })
    .catch(error => res.status(404).json({ error }));
};

// Créer une sauce avec l'UserID de l'utilisateur
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  delete sauceObject._userId;
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });

  sauce.save()
    .then(() => { res.status(201).json({ message: 'Sauce enregistré !' }) })
    .catch(error => { res.status(400).json({ error }) })
};

// Modifier une sauce, uniquement autorisé par l'utilisateur qui l'a créée
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ? {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };
  delete sauceObject._userId;
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(403).json({ message: 'Not authorized' });
      } else if (req.file) {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Objet modifié!' }))
            .catch(error => res.status(400).json({ error }));
        });
      } else {
        Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet modifié!' }))
          .catch(error => res.status(400).json({ error }));
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json({ error });
    });
};

// Supprimer une sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      if (sauce.userId != req.auth.userId) {
        res.status(403).json({ message: 'Not authorized' });
      } else {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
            .catch(error => res.status(403).json({ error }));
        });
      }
    })
    .catch(error => {
      res.status(500).json({ error });
    });
};

// Gère les Likes et Dislikes des sauces
exports.likeDislikeSauce = (req, res, next) => {
  const userId = req.body.userId;
  const like = req.body.like;
  const sauceId = req.params.id;
  //Test id utilisateur
  if (req.body.userId !== req.auth.userId) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  if (like != -1 && like != 1 && like != 0) {
    return res.status(400).json({ message: "unknown action bad 'like' value" });
  }
  Sauce.findOne({ _id: sauceId })
    .then((sauce) => {
      let newDislikesValue = sauce.dislikes;
      let newLikesValue = sauce.likes;
      let newUsersLikedValue = sauce.usersLiked;
      let newUsersDislikedValue = sauce.usersDisliked;
      if (like == -1) {    //Empèche l'utilisateur de dislike plusieurs fois
        const userIndex = sauce.usersDisliked.indexOf(userId)
        if (userIndex > -1) {
          return res.status(400).json({ message: "can't dislike twice" });
        }
        newUsersDislikedValue.push(userId);    //Met un dislike si pas déjà fait
        newDislikesValue++;
      } else if (like == 1) {    //Empèche l'utilisateur de like plusieurs fois
        const userIndex = sauce.usersLiked.indexOf(userId)
        if (userIndex > -1) {
          return res.status(400).json({ message: "can't like twice" });
        }
        newUsersLikedValue.push(userId);    //Met un like si pas déjà fait
        newLikesValue++;
      } else {
        const userDislikeIndex = sauce.usersDisliked.indexOf(userId);
        const userLikeIndex = sauce.usersLiked.indexOf(userId);
        if (userDislikeIndex > -1) {    // Permet de retirer un dislike
          newUsersDislikedValue.splice(userDislikeIndex, 1);
          newDislikesValue--;
        } else if (userLikeIndex > -1) {    //Permet de retirer un like
          newUsersLikedValue.splice(userLikeIndex, 1);
          newLikesValue--;
        } else {
          return res.status(400).json({ message: "can't remove dislike or like that don't exist" });
        }
      }

      Sauce.updateOne({ _id: sauceId }, {    //Met à jour les informations de la sauce like/dislike
        likes: newLikesValue,
        dislikes: newDislikesValue,
        usersDisliked: newUsersDislikedValue,
        usersLiked: newUsersLikedValue
      })
        .then(() => res.status(200).json({ message: 'Objet modifié!' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json({ error });
    });
};