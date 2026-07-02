const express = require('express');
const router = express.Router();

const conductoraCtrl = require('../controllers/conductora.controller');
const vehiculoCtrl = require('../controllers/vehiculo.controller');

router.put('/conductoras/jornada/inicio', conductoraCtrl.iniciarJornada);
router.put('/conductoras/jornada/fin', conductoraCtrl.finalizarJornada);
router.post('/conductoras/cambio-vehiculo', conductoraCtrl.solicitarCambioVehiculo);
router.get('/conductores', conductoraCtrl.listarConductoras);

router.post('/admin/vehiculos', vehiculoCtrl.altaVehiculo);
router.put('/admin/vehiculos/:id/estado', vehiculoCtrl.cambiarEstadoLogicoVehiculo);
router.put('/admin/conductoras/aprobar-vehiculo', vehiculoCtrl.gestionarCambioVehiculo);
router.get('/admin/vehiculos', vehiculoCtrl.listarVehiculos);
router.get('/admin/vehiculos/:id', vehiculoCtrl.obtenerVehiculoPorId);

module.exports = router;