const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');

//Routes pour la création d'utilisateur ou connection
router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;