const express = require('express');
const router = express.Router();
const authController = require('../controllers/user');

// 註冊路徑
router.post('/register', authController.register);

// 登入路徑
router.post('/login', authController.login);

module.exports = router;
