const Vehiculo = require('../models/vehiculo.model');
const Conductora = require('../models/conductora.model');
const Usuario = require('../models/usuario.model');

// POST /api/admin/vehiculos
const altaVehiculo = async (req, res) => {
  try {
    const { marca, modelo, color, patente } = req.body;

    const existe = await Vehiculo.findOne({ where: { patente } });
    if (existe) {
      return res.status(400).json({ error: 'Un vehículo con esta patente ya se encuentra registrado.' });
    }

    const nuevoVehiculo = await Vehiculo.create({ marca, modelo, color, patente });
    res.status(201).json({ message: 'Vehículo dado de alta en la flota con éxito.', nuevoVehiculo });
  } catch (error) {
    res.status(500).json({ error: 'Error al dar de alta el vehículo.', details: error.message });
  }
};

// PUT /api/admin/vehiculos/:id/estado
const cambiarEstadoLogicoVehiculo = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    const vehiculo = await Vehiculo.findByPk(id);
    if (!vehiculo) {
      return res.status(404).json({ error: 'Vehículo no encontrado.' });
    }

    vehiculo.activo = activo;
    await vehiculo.save();

    if (!activo && vehiculo.idConductoraAsociada) {
      const conductora = await Conductora.findByPk(vehiculo.idConductoraAsociada);
      if (conductora && conductora.enJornada) {
        conductora.enJornada = false;
        conductora.disponible = false;
        await conductora.save();
        console.log(`[SISTEMA] Conductora ${conductora.idUsuario} deslogueada forzosamente por vehículo inactivo.`);
      }
    }

    res.status(200).json({ message: `Estado del vehículo actualizado a: ${activo ? 'ACTIVO' : 'INACTIVO'}.`, vehiculo });
  } catch (error) {
    res.status(500).json({ error: 'Error al cambiar estado lógico del vehículo.', details: error.message });
  }
};

// PUT /api/admin/conductoras/aprobar-vehiculo
const gestionarCambioVehiculo = async (req, res) => {
  try {
    const { idConductora, idVehiculo, autorizar } = req.body;

    if (!autorizar) {
      return res.status(200).json({ message: 'Cambio de vehículo rechazado por la Administradora.' });
    }

    const vehiculo = await Vehiculo.findByPk(idVehiculo);
    const conductora = await Conductora.findByPk(idConductora);

    if (!vehiculo || !conductora) {
      return res.status(404).json({ error: 'Conductora o Vehículo no encontrado.' });
    }

    await Vehiculo.update({ idConductoraAsociada: null }, { where: { idConductoraAsociada: idConductora } });

    vehiculo.idConductoraAsociada = idConductora;
    await vehiculo.save();

    res.status(200).json({ 
      message: 'Cambio aprobado. El nuevo vehículo ha sido vinculado exitosamente al perfil de la conductora.',
      vehiculo 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al gestionar el cambio de vehículo.', details: error.message });
  }
};

// GET /api/admin/vehiculos
const listarVehiculos = async (req, res) => {
  try {
    const vehiculos = await Vehiculo.findAll({
      include: { model: Usuario, as: 'conductora', attributes: ['idUsuario', 'nombre'] }
    });
    res.status(200).json(vehiculos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la flota.', details: error.message });
  }
};

// GET /api/admin/vehiculos/:id
const obtenerVehiculoPorId = async (req, res) => {
  try {
    const vehiculo = await Vehiculo.findByPk(req.params.id);
    if (!vehiculo) {
      return res.status(404).json({ error: 'Vehículo no encontrado.' });
    }
    res.status(200).json(vehiculo);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el vehículo.' });
  }
};

module.exports = {
  altaVehiculo,
  cambiarEstadoLogicoVehiculo,
  gestionarCambioVehiculo,
  listarVehiculos,
  obtenerVehiculoPorId
};