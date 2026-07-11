const Conductora = require('../models/conductora.model');
const Vehiculo = require('../models/vehiculo.model');
const { listarCambiosVehiculoPendientes } = require('./admin.controller');
const { Usuario } = require('../models/usuario.model');

// PUT /api/conductoras/jornada/inicio
const iniciarJornada = async (req, res) => {
  try {
    const { idConductora, zonaActual } = req.body;
    const conductora = await Conductora.findByPk(idConductora);
    if (!conductora) {
      return res.status(404).json({ error: 'Conductora no encontrada.' });
    }
    const vehiculo = await Vehiculo.findOne({ where: { idConductoraAsociada: idConductora } });
    if (!vehiculo || !vehiculo.activo) {
      return res.status(403).json({ 
        error: 'No se puede iniciar jornada. El vehículo asignado no existe o está INACTIVO (baja lógica por Admin).' 
      });
    }

    conductora.enJornada = true;
    conductora.disponible = true;
    conductora.zonaActual = zonaActual;
    await conductora.save();

    res.status(200).json({ 
      message: 'Jornada iniciada con éxito. Ya eres visible en el panel de control.',
      conductora 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar jornada.', details: error.message });
  }
};

// PUT /api/conductoras/jornada/fin
const finalizarJornada = async (req, res) => {
  try {
    const { idConductora } = req.body;

    const conductora = await Conductora.findByPk(idConductora);
    if (!conductora) {
      return res.status(404).json({ error: 'Conductora no encontrada.' });
    }

    conductora.enJornada = false;
    conductora.disponible = false;
    conductora.zonaActual = null; 
    await conductora.save();

    res.status(200).json({ message: 'Jornada finalizada. Retirada del tráfico operativo.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al finalizar jornada.', details: error.message });
  }
};

// POST /api/conductoras/cambio-vehiculo
const solicitarCambioVehiculo = async (req, res) => {
  try {
    const { idConductora, idNuevoVehiculo } = req.body;

    const conductora = await Conductora.findByPk(idConductora); 
    const vehiculo = await Vehiculo.findByPk(idNuevoVehiculo);

    if (!conductora || !vehiculo) {
      return res.status(404).json({ error: 'Conductora o Vehículo no encontrado.' });
    }
    await conductora.update({
      idVehiculoSolicitado: idNuevoVehiculo
    });

    return res.status(200).json({ 
      status: '1',
      message: 'Petición de cambio de vehículo registrada. Pendiente de aprobación por la Administradora.'
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error al procesar la solicitud.', details: error.message });
  }
};

// GET /api/conductores
const listarConductoras = async (req, res) => {
  try {
    const { enJornada } = req.query;
    const donde = {};
    if (enJornada !== undefined) donde.enJornada = enJornada === 'true';

    const conductoras = await Conductora.findAll({ where: donde, include: 'vehiculoAsignado' });
    res.status(200).json(conductoras);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar conductoras.' });
  }
};

// GET /api/conductoras/:id
const obtenerConductoraPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const conductora = await Conductora.findByPk(id, { 
      include: 'vehiculoAsignado' 
    });
    if (!conductora) {
      return res.status(404).json({ error: 'Conductora no encontrada.' });
    }
    res.status(200).json(conductora);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la conductora.' });
  }
};

module.exports = {
  iniciarJornada,
  finalizarJornada,
  solicitarCambioVehiculo,
  listarConductoras,
  obtenerConductoraPorId
};