const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/admin.controller');

// Ruta para el baneo / reactivación
router.put('/usuarios/:id/estado', adminCtrl.cambiarEstadoLogicoUsuario);
// Ruta para aprobar / rechazar registro de pasajera
router.put('/pasajeras/:id/evaluar', adminCtrl.evaluarRegistroPasajera);
// Ruta para evaluar y habilitar a una conductora
router.put('/conductoras/:id/evaluar', adminCtrl.evaluarRegistroConductora);
// Rutas para la gestión de vehículos
router.put('/vehiculos/:id/estado', adminCtrl.cambiarEstadoLogicoVehiculo);
router.put('/conductoras/:idConductora/cambiar-vehiculo', adminCtrl.gestionarCambioVehiculo);
// Ruta para obtener informe mensual
router.get('/informe-mensual', adminCtrl.obtenerInformeMensual);

module.exports = router;