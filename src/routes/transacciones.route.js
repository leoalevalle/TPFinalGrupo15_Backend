const autCtrl = require('./../controllers/auth.controller');
const express = require('express');
const router = express.Router();
const ctrl = require("../controllers/transacciones.controller");

// Endpoints de Pasajeras
router.post('/solicitudes', autCtrl.verifyToken, ctrl.crearSolicitudViaje); 
router.put('/solicitudes/:id/cancelar', autCtrl.verifyToken, ctrl.cancelarSolicitud);

// Endpoints de Operadoras
router.get('/operadora/solicitudes', autCtrl.verifyToken, ctrl.listarSolicitudesPendientes);
router.get('/operadora/conductoras-zona', autCtrl.verifyToken, ctrl.consultarConductorasDisponibles);
router.put('/operadora/asignar-propuesta', autCtrl.verifyToken, ctrl.seleccionarConductora);

// Endpoints de Conductora
router.put('/conductoras/solicitudes/:id/responder', autCtrl.verifyToken, ctrl.responderPropuesta);

// Endpoints de Viajes
router.post('/viajes', autCtrl.verifyToken, ctrl.registrarViaje);
router.put('/viajes/:id/finalizar', autCtrl.verifyToken, ctrl.informarFinViaje); 

module.exports = router;
