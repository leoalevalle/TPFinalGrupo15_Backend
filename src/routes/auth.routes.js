const express = require("express");
const router = express.Router();
const authCtrl = require("../controllers/auth.controller");

// POST /api/auth/login
router.post("/login", authCtrl.iniciarSesion);
router.post('/login-google', authCtrl.loginGoogle);
router.post('/register-google-pasajera', authCtrl.registrarGooglePasajera);
router.post('/register', authCtrl.registrarPasajera);
router.post('/register-conductora', authCtrl.registrarConductora);

router.get("/prueba-google", (req,res)=>{
    res.json({
        mensaje:"Funciona"
    });
});

module.exports = router;
