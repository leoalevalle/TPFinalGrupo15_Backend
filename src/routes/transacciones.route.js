const autCtrl = require("./../controllers/auth.controller");
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/transacciones.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { verify } = require("jsonwebtoken");

console.log("¿Controlador cargado correctamente?:", !!ctrl);
if (ctrl) {
  console.log("¿Existe crearSolicitudViaje?:", typeof ctrl.crearSolicitudViaje);
}

console.log(typeof autCtrl.verifyToken);
console.log(typeof verifyToken);

// Endpoints de Pasajeras
router.post("/solicitudes", verifyToken, ctrl.crearSolicitudViaje);
router.put("/solicitudes/:id/cancelar", verifyToken, ctrl.cancelarSolicitud);

// Endpoints de Operadoras
router.get("/operadora/solicitudes", verifyToken, ctrl.listarSolicitudesPendientes);
router.get("/operadora/solicitudes-aceptadas", verifyToken, ctrl.listarSolicitudesPendientes);
router.get("/operadora/conductoras-zona", verifyToken, ctrl.consultarConductorasDisponibles);
router.put("/operadora/asignar-propuesta", verifyToken, ctrl.seleccionarConductora);

// Endpoints de Conductora 
router.get("/conductoras/solicitudes/propuesta", verifyToken, ctrl.obtenerPropuestaActiva); 
router.get("/conductoras/viajes/activo", verifyToken, ctrl.obtenerViajeActivoConductora); 
router.put("/conductoras/solicitudes/:id/responder", verifyToken, ctrl.responderPropuesta);
router.get("/conductoras/resumen", verifyToken, ctrl.obtenerResumenDiarioConductora);

// Endpoints de Viajes
router.post("/viajes", verifyToken, ctrl.registrarViaje);
router.put("/viajes/:id/llegue_origen", verifyToken, ctrl.llegaOrigen);
router.put("/viajes/:id/inicio-viaje", verifyToken, ctrl.informarInicioViaje);
router.put("/viajes/:id/finalizar", verifyToken, ctrl.informarFinViaje);
router.put("/viajes/:id/cancelar", verifyToken, ctrl.cancelarEnRuta);

// Endpoints Metodos de Pago
router.put('/viajes/confirmar-efectivo', verifyToken, ctrl.confirmarPagoEfectivo);
router.put('/viajes/confirmar-mercadopago', verifyToken, ctrl.confirmarPagoMercadoPago);
router.get("/viajes/:id/detalle-completo", verifyToken, ctrl.obtenerDetalleViajeCompleto);

module.exports = router;
