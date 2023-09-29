const express = require('express');
const router = express.Router();

const sauceCtrl = require('../controllers/sauce');

router.get('/', sauceCtrl.getAll);
//router.post('/login', userCtrl.login);

module.exports = router;