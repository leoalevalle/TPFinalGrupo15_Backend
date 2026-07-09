const SolicitudViaje = require("../models/solicitud.model");
const Viaje = require("../models/viaje.model");
const Usuario = require("../models/usuario.model");
const sequelize = require("../../config/database");

const transaccionesController = {
  // POST /api/solicitudes
  crearSolicitudViaje: async (req, res) => {
    try {
      console.log("usuario:", req.userId);
      const usuarioAutenticado = await Usuario.findByPk(req.userId);
      if (!usuarioAutenticado || usuarioAutenticado.rol !== 1) {
        return res.status(403).json({
          error: "Acceso denegado. Solo las pasajeras pueden solicitar viajes.",
        });
      }

      const { idPasajera, origen, destino, zona, cantPasajeros } = req.body;

      const pasajera = await Usuario.findByPk(idPasajera);
      if (!pasajera) {
        return res.status(404).json({
          error: "La pasajera no existe o el usuario no tiene rol de Pasajera",
        });
      }

      if (!pasajera.aprobadaPorAdmin) {
        return res.status(403).json({
          error:
            "No autorizado. La pasajera no está aprobada por la Administradora.",
        });
      }

      const nuevaSolicitud = await SolicitudViaje.create({
        idPasajera,
        origen,
        destino,
        zona,
        cantPasajeros,
        estado: "Pendiente",
      });

      return res.status(201).json(nuevaSolicitud);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // PUT /api/solicitudes/:id/cancelar
  cancelarSolicitud: async (req, res) => {
    try {
      const usuarioAutenticado = await Usuario.findByPk(req.params.id);
      if (
        !usuarioAutenticado ||
        (usuarioAutenticado.rol !== 1 && usuarioAutenticado.rol !== 3)
      ) {
        return res.status(403).json({
          error: "Acceso denegado. No autorizado para cancelar solicitudes.",
        });
      }

      const { idSolicitud } = req.body;
      const solicitud = await SolicitudViaje.findByPk(idSolicitud);

      if (!solicitud)
        return res.status(404).json({ error: "Solicitud no encontrada" });

      if (solicitud.estado === "Propuesta" && solicitud.idConductoraAsignada) {
        await Usuario.update(
          { disponible: true },
          { where: { idUsuario: solicitud.idConductoraAsignada } },
        );
      }

      solicitud.estado = "Cancelada";
      await solicitud.save();

      return res.json({
        message: "Solicitud cancelada correctamente",
        solicitud,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // GET /api/operadora/solicitudes
  listarSolicitudesPendientes: async (req, res) => {
    try {
      const usuarioAutenticado = await Usuario.findByPk(req.userId);
      if (!usuarioAutenticado || usuarioAutenticado.rol !== 3) {
        return res.status(403).json({
          error: "Acceso denegado. Endpoint exclusivo para Operadoras.",
        });
      }

      const pendientes = await SolicitudViaje.findAll({
        where: { estado: "Pendiente" },
      });
      return res.json(pendientes);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // GET /api/operadora/solicitudes-aceptadas
  listarSolicitudesAceptadas: async (req, res) => {
    try {
      const usuarioAutenticado = await Usuario.findByPk(req.userId);
      if (!usuarioAutenticado || usuarioAutenticado.rol !== 3) {
        return res.status(403).json({
          error: "Acceso denegado. Endpoint exclusivo para Operadoras.",
        });
      }

      const pendientes = await SolicitudViaje.findAll({
        where: { estado: "Aceptada" },
      });
      return res.json(pendientes);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // GET /api/operadora/conductoras-zona
  consultarConductorasDisponibles: async (req, res) => {
    try {
      const usuarioAutenticado = await Usuario.findByPk(req.userId);
      if (!usuarioAutenticado || usuarioAutenticado.rol !== 3) {
        return res.status(403).json({
          error: "Acceso denegado. Endpoint exclusivo para Operadoras.",
        });
      }

      const { zona } = req.query;

      const conductoras = await Usuario.findAll({
        where: {
          enJornada: true,
          disponible: true,
          zonaActual: zona,
        },
      });
      return res.json(conductoras);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // PUT /api/operadora/asignar-propuesta
  seleccionarConductora: async (req, res) => {
    const t = await sequelize.transaction();
    
    try {
      const usuarioAutenticado = await Usuario.findByPk(req.userId);
      if (!usuarioAutenticado || usuarioAutenticado.rol !== 3) {
        await t.rollback();
        return res.status(403).json({
          error: "Acceso denegado. Endpoint exclusivo para Operadoras.",
        });
      }

      const { idSolicitud, idConductora } = req.body;

      const solicitud = await SolicitudViaje.findByPk(idSolicitud, { transaction: t });
      if (!solicitud) {
        await t.rollback();
        return res.status(404).json({ error: "Solicitud no encontrada" });
      }

      const conductora = await Usuario.findByPk(idConductora);
      if (!conductora) {
        await t.rollback();
        return res.status(404).json({
          error: "La conductora seleccionada no es válida o no existe.",
        });
      }

      solicitud.idConductoraAsignada = idConductora;
      solicitud.estado = "Propuesta";
      await solicitud.save();

      await Usuario.update(
        { disponible: false },
        { 
          where: { idUsuario: idConductora }
        }
      );

      await t.commit();

      return res.json({
        message: "Propuesta enviada a la conductora con éxito. Conductora reservada temporalmente.",
        solicitud,
      });
    } catch (error) {
      await t.rollback();
      return res.status(500).json({ error: error.message });
    }
  },

  // POST /api/viajes
  registrarViaje: async (req, res) => {
    const usuarioAutenticado = await Usuario.findByPk(req.userId);
    if (!usuarioAutenticado || usuarioAutenticado.rol !== 3) {
      return res.status(403).json({
        error:
          "Acceso denegado. Solo las operadoras pueden registrar e iniciar viajes.",
      });
    }

    const t = await sequelize.transaction();

    try {
      const { idSolicitud, idOperadora, patenteVehiculo } = req.body;

      const solicitud = await SolicitudViaje.findByPk(idSolicitud, {
        transaction: t,
      });
      if (!solicitud || solicitud.estado !== "Aceptada") {
        await t.rollback();
        return res.status(400).json({
          error:
            "La solicitud debe ser previamente Aceptada por la conductora.",
        });
      }

      await Usuario.update(
        { disponible: false },
        {
          where: { idUsuario: solicitud.idConductoraAsignada },
          transaction: t,
        },
      );

      const nuevoViaje = await Viaje.create(
        {
          idSolicitudOrigen: solicitud.idSolicitud,
          idPasajera: solicitud.idPasajera,
          idConductora: solicitud.idConductoraAsignada,
          idOperadoraAsignadora: idOperadora,
          patenteVehiculoUtilizado: patenteVehiculo,
          horarioCaminoOrigen: new Date(),
          estadoViaje: "En Camino",
        },
        { transaction: t },
      );

      await t.commit();
      return res
        .status(201)
        .json({ message: "Viaje registrado e iniciado en ruta", nuevoViaje });
    } catch (error) {
      await t.rollback();
      return res.status(500).json({ error: error.message });
    }
  },

  //PUT /api/transaccion/viajes/:id/llegue-origen
  llegaOrigen: async (req, res) => {
    try {
      const { id } = req.params;
      const viaje = await Viaje.findByPk(id);
      
      if (!viaje) return res.status(404).json({ error: "Viaje no encontrado." });
      if (viaje.estadoViaje !== "En Camino") {
        return res.status(400).json({ error: "El viaje debe estar en estado 'En Camino' para marcar llegada a Origen." });
      }

      viaje.estadoViaje = "En Origen";
      await viaje.save();

      return res.json({ message: "Conductora llego al origen.", viaje });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  //PUT /api/transaccion/viajes/:id/inicio-viaje
  informarInicioViaje: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const viaje = await Viaje.findByPk(id, { transaction: t });
      
      if (!viaje) {
        await t.rollback();
        return res.status(404).json({ error: "Viaje no encontrado." });
      }
      if (viaje.estadoViaje !== "En Origen") {
        await t.rollback();
        return res.status(400).json({ error: "Debe marcar que arribó al origen antes de iniciar el viaje físico." });
      }

      await viaje.update({
        estadoViaje: "En Viaje",
        horarioInicio: new Date() 
      
      }, { transaction: t });

      await t.commit();
      return res.json({ message: "Viaje inciado", viaje });
    } catch (error) {
      await t.rollback();
      return res.status(500).json({ error: error.message });
    }
  },

  // PUT /api/viajes/:id/finalizar
  informarFinViaje: async (req, res) => {
    try {
      const usuarioAutenticado = await Usuario.findByPk(req.userId);
      if (
        !usuarioAutenticado ||
        (usuarioAutenticado.rol !== 2 && usuarioAutenticado.rol !== 3)
      ) {
        return res.status(403).json({
          error: "Acceso denegado. No autorizado para finalizar viajes.",
        });
      }

      const { id } = req.params;

      const viaje = await Viaje.findByPk(id);
      if (!viaje) return res.status(404).json({ error: "Viaje no encontrado" });

      const ahora = new Date();
      viaje.horarioFin = ahora;
      viaje.estadoViaje = "Finalizado";

      const fechaInicioReal = viaje.horarioInicio;

      const segundos = Math.abs(ahora - new Date(fechaInicioReal)) / 1000;
      viaje.monto = parseFloat((400 + segundos * 1.5).toFixed(2));

      await viaje.save();

      await Usuario.update(
        { disponible: true },
        { where: { idUsuario: viaje.idConductora } },
      );

      return res.json({ message: "Viaje finalizado con éxito", viaje });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  //GET /api/conductoras/solicitudes/propuesta
  obtenerPropuestaActiva: async (req, res) => {
    try {
      const usuarioAutenticado = await Usuario.findByPk(req.userId);
      if (!usuarioAutenticado || usuarioAutenticado.rol !== 2) {
        return res.status(403).json({ error: "Acceso denegado. Solo las conductoras pueden ver propuestas." });
      }

      const propuesta = await SolicitudViaje.findOne({
        where: {
          idConductoraAsignada: req.userId,
          estado: "Propuesta"
        }
      });

      if (!propuesta) {
        return res.json(null);
      }

      return res.json(propuesta);

    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // GET /api/conductoras/viajes/activo
  obtenerViajeActivoConductora: async (req, res) => {
    try {
      const { Op } = require('sequelize');
      const idConductora = req.userId;

      const viajeActivo = await Viaje.findOne({
        where: {
          idConductora: idConductora,
          estadoViaje: { [Op.notIn]: ['Finalizado', 'Cancelado en Ruta'] }
        }
      });

      if (!viajeActivo) return res.json(null);

      return res.json(viajeActivo);
    } catch (error) {
      console.error("Error en obtenerViajeActivoConductora:", error);
      return res.status(500).json({ error: error.message });
    }
  },

  // PUT /api/conductoras/solicitudes/:id/responder
  responderPropuesta: async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const usuarioAutenticado = await Usuario.findByPk(req.userId, { transaction: t });
    if (!usuarioAutenticado || usuarioAutenticado.rol !== 2) {
      await t.rollback();
      return res.status(403).json({
        error: "Acceso denegado. Solo las conductoras pueden responder propuestas.",
      });
    }
    
    const { id } = req.params;
    const { aceptar } = req.body;
    
    const solicitud = await SolicitudViaje.findByPk(id, { transaction: t });
    if (!solicitud) {
      await t.rollback();
      return res.status(404).json({ error: "Solicitud no encontrada" });
    }

    if (aceptar) {
      solicitud.estado = "Aceptada";
      await solicitud.save({ transaction: t });

      usuarioAutenticado.disponible = false; 
      await usuarioAutenticado.save({ transaction: t });

      await t.commit();
      return res.json({ 
        message: "Propuesta aceptada con éxito y conductora asignada al servicio.", 
        solicitud 
      });

    } else {
      solicitud.idConductoraAsignada = null;
      solicitud.estado = "Pendiente";
      await solicitud.save({ transaction: t });

      usuarioAutenticado.disponible = true; 
      await usuarioAutenticado.save({ transaction: t });

      await t.commit();
      return res.json({
        message: "Propuesta rechazada. Reabierta en el panel de control y conductora liberada.",
        solicitud,
      });
    }
  } catch (error) {
    await t.rollback();
    console.error("Error exacto en responderPropuesta:", error);
    return res.status(500).json({ error: error.message });
  }
},

  obtenerResumenDiarioConductora: async (req, res) => {
    try {
      const idConductora = req.user ? req.user.id : req.userId;

      if (!idConductora) {
        return res.status(401).json({ error: "No se pudo autenticar a la conductora. Falta el ID." });
      }

      const hoy = new Date().toISOString().slice(0, 10);

      const viajesHoy = await Viaje.findAll({
        where: {
          idConductora: idConductora, 
          estadoViaje: 'Finalizado'
        }
      });

      const totalGanado = viajesHoy.reduce((sum, v) => sum + parseFloat(v.monto || 0), 0);

      return res.json({
        fecha: hoy,
        viajesRealizados: viajesHoy.length,
        totalGanado: parseFloat(totalGanado.toFixed(2)),
        listaViajes: viajesHoy
      });

    } catch (error) {
      console.error("Error en obtenerResumenDiarioConductora:", error);
      return res.status(500).json({ error: error.message });
    }
  }
};

module.exports = transaccionesController;
