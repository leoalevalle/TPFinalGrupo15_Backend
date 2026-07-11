const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/admin.controller');

// ======== SOLICITUDES DE ALTA ========
// traer las conductoras inactivas
router.get('/solicitudes-alta', adminCtrl.listarSolicitudesAlta);

// ======== EVALUACIONES Y ESTADOS ========
router.put('/usuarios/:id/estado', adminCtrl.cambiarEstadoLogicoUsuario);
// Ruta para aprobar / rechazar registro de pasajera
router.put('/pasajeras/:id/evaluar', adminCtrl.evaluarRegistroPasajera);

//habilitar o deshabilitar conductora
router.put('/conductoras/:id/evaluar', adminCtrl.evaluarRegistroConductora);

// Rutas para la gestión de vehículos
router.put('/vehiculos/:id/estado', adminCtrl.cambiarEstadoLogicoVehiculo);
router.put('/conductoras/:idConductora/cambiar-vehiculo', adminCtrl.gestionarCambioVehiculo);
router.put('/conductoras/aprobar-vehiculo', adminCtrl.gestionarCambioVehiculo);
// Ruta para obtener informe mensual
router.get('/informe-mensual', adminCtrl.obtenerInformeMensual);

router.get('/cambios-vehiculo-pendientes', adminCtrl.listarCambiosVehiculoPendientes);


module.exports = router;