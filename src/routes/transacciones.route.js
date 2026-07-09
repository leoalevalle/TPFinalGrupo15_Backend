const autCtrl = require("./../controllers/auth.controller");
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/transacciones.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

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
router.get(
  "/operadora/solicitudes",
  verifyToken,
  ctrl.listarSolicitudesPendientes,
);
router.get(
  "/operadora/conductoras-zona",
  verifyToken,
  ctrl.consultarConductorasDisponibles,
);
router.put(
  "/operadora/asignar-propuesta",
  verifyToken,
  ctrl.seleccionarConductora,
);

// Endpoints de Conductora
router.get("/conductoras/solicitudes/propuesta", verifyToken, ctrl.obtenerPropuestaActiva); // 👈 AGREGA ESTA LÍNEA
router.put("/conductoras/solicitudes/:id/responder", verifyToken, ctrl.responderPropuesta);

// Endpoints de Viajes
router.post("/viajes", verifyToken, ctrl.registrarViaje);
router.put("/viajes/:id/finalizar", verifyToken, ctrl.informarFinViaje);

module.exports = router;
