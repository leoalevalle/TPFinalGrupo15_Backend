const express = require('express');
const router = express.Router();
const ctrl = require("../controllers/transacciones.controller");

//Endpoints de Pasajeras
router.post('/solicitudes', ctrl.crearSolicitudViaje);
router.put('/solicitudes/:id/cancelar', ctrl.cancelarSolicitud);

//Endpoints de Operadoras
router.get('/operadora/solicitudes', ctrl.listarSolicitudesPendientes);
router.get('/operadora/conductoras-zona', ctrl.consultarConductorasDisponibles);
router.put('/operadora/asignar-propuesta', ctrl.seleccionarConductora);

//Endpoints de Conductora
router.put('/conductoras/solicitudes/:id/responder', ctrl.responderPropuesta);

//Endpoints de Viajes
router.post('/viajes', ctrl.registrarViaje);
router.put('/viajes/:id/finalizar', ctrl.informarFinViaje);

module.exports = router;

