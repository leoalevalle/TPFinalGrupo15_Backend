const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth.controller'); 

// POST /api/auth/login
router.post('/login', authCtrl.iniciarSesion);

module.exports = router;