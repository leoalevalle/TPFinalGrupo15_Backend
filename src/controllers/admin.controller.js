const Usuario = require('../models/usuario.model');
const Vehiculo = require('../models/vehiculo.model');
const Viaje = require('../models/viaje.model');
const {Op, fn, col}= require('sequelize');

const adminCtrl = {};

// PUT /api/admin/usuarios/:id/estado
adminCtrl.cambiarEstadoLogicoUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { activo } = req.body; // (true o false)

        // 1. Validar que el campo activo venga en el body y sea un booleano
        if (activo === undefined || typeof activo !== 'boolean') {
            return res.status(400).json({
                status: '0',
                msg: 'El campo "activo" es requerido y debe ser un valor booleano (true o false)'
            });
        }

        // 2. Buscar al usuario por su Clave Primaria (idUsuario)
        const usuario = await Usuario.findByPk(id);

        // 3. Si no existe el usuario, devolvemos 404 
        if (!usuario) {
            return res.status(404).json({
                status: '0',
                msg: 'Usuario no encontrado'
            });
        }

        // 4. Actualizar el atributo activo
        await usuario.update({ activo });

        // 5. Definir un mensaje personalizado según si se baneó o se reactivó
        const accion = activo ? 'reactivado' : 'baneado / desactivado';

        res.status(200).json({
            status: '1',
            msg: `Usuario ${accion} correctamente`,
            data: {
                idUsuario: usuario.idUsuario,
                nomUsuario: usuario.nomUsuario,
                rol: usuario.rol,
                activo: usuario.activo
            }
        });

    } catch (error) {
        res.status(400).json({
            status: '0',
            msg: 'Error al modificar el estado del usuario',
            error: error.message
        });
    }
};
//=================================================================================================

// PUT /api/admin/pasajeras/:id/evaluar
adminCtrl.evaluarRegistroPasajera = async (req, res) => {
    try {
        const { id } = req.params;
        const { aprobar } = req.body; // true (aprobar) o false (rechazar)

        // 1. Validar que el campo aprobar sea un booleano válido
        if (aprobar === undefined || typeof aprobar !== 'boolean') {
            return res.status(400).json({
                status: '0',
                msg: 'El campo "aprobar" es requerido y debe ser true o false'
            });
        }

        // 2. Buscar al usuario
        const usuario = await Usuario.findByPk(id);

        // 3. Validar si existe
        if (!usuario) {
            return res.status(404).json({
                status: '0',
                msg: 'Pasajera no encontrada'
            });
        }

        // 4. Asegurarnos de que sea una Pasajera (Rol 1)
        if (usuario.rol !== 1) {
            return res.status(400).json({
                status: '0',
                msg: 'El usuario seleccionado no corresponde al rol de Pasajera'
            });
        }

        // 5. FILTRO DE SEGURIDAD EXCLUSIVO: Validar identidad/género según tu especificación
        const sexoValido = usuario.sexo.toLowerCase();
        if (!sexoValido.includes('fem') && !sexoValido.includes('muj')) {
            return res.status(403).json({
                status: '0',
                msg: 'Filtro de seguridad rechazado: El sistema es exclusivo para mujeres y disidencias.'
            });
        }

        // 6. Modificar el atributo específico de la subclase Pasajera
        await usuario.update({ aprobadaPorAdmin: aprobar });

        const mensajeResultado = aprobar 
            ? 'Pasajera aprobada exitosamente. Ya puede solicitar viajes.' 
            : 'Admisión de la pasajera revocada/rechazada.';

        res.status(200).json({
            status: '1',
            msg: mensajeResultado,
            data: {
                idUsuario: usuario.idUsuario,
                nombre: usuario.nombre,
                rol: usuario.rol,
                sexo: usuario.sexo,
                aprobadaPorAdmin: usuario.aprobadaPorAdmin
            }
        });

    } catch (error) {
        res.status(400).json({
            status: '0',
            msg: 'Error al evaluar el registro de la pasajera',
            error: error.message
        });
    }
};
//====================================================================================0

// PUT /api/admin/conductoras/:id/evaluar
adminCtrl.evaluarRegistroConductora = async (req, res) => {
    try {
        const { id } = req.params;
        const { aprobar } = req.body; // true para habilitarla a trabajar, false para suspenderla

        if (aprobar === undefined || typeof aprobar !== 'boolean') {
            return res.status(400).json({
                status: '0',
                msg: 'El campo "aprobar" es requerido y debe ser un valor booleano'
            });
        }

        // 1. Buscar al usuario global
        const usuario = await Usuario.findByPk(id);

        if (!usuario) {
            return res.status(404).json({
                status: '0',
                msg: 'Conductora no encontrada'
            });
        }

        // 2. CONTROL CRÍTICO: Asegurarnos de que sea una Conductora (Rol 2)
        if (usuario.rol !== 2) {
            return res.status(400).json({
                status: '0',
                msg: 'El usuario seleccionado no corresponde al rol de Conductora'
            });
        }

        // 3. FILTRO DE SEGURIDAD: Validación estricta de género exclusivo
        const sexoValido = usuario.sexo.toLowerCase();
        if (!sexoValido.includes('fem') && !sexoValido.includes('muj')) {
            return res.status(403).json({
                status: '0',
                msg: 'Filtro de seguridad rechazado: El plantel operativo de transporte es exclusivo para mujeres y disidencias.'
            });
        }

        // 4. Actualizar estado administrativo e inicializar atributos de jornada
        // Si se aprueba, nos aseguramos de que empiece con la jornada y disponibilidad en false
        await usuario.update({
            activo: aprobar, // Si la rechaza o suspende, su cuenta pasa a estar inactiva
            enJornada: false,
            disponible: false
        });

        const mensajeResultado = aprobar
            ? 'Conductora aprobada y habilitada para iniciar jornadas laborales.'
            : 'Licencia/Admisión de la conductora suspendida o rechazada.';

        res.status(200).json({
            status: '1',
            msg: mensajeResultado,
            data: {
                idUsuario: usuario.idUsuario,
                nombre: usuario.nombre,
                rol: usuario.rol,
                sexo: usuario.sexo,
                enJornada: usuario.enJornada,
                disponible: usuario.disponible,
                activo: usuario.activo
            }
        });

    } catch (error) {
        res.status(400).json({
            status: '0',
            msg: 'Error al evaluar el registro de la conductora',
            error: error.message
        });
    }
};
// PUT /api/admin/vehiculos/:id/estado
adminCtrl.cambiarEstadoLogicoVehiculo = async (req, res) => {
    try {
        const { id } = req.params;
        const { activo } = req.body; // Se espera true o false

        if (activo === undefined || typeof activo !== 'boolean') {
            return res.status(400).json({
                status: '0',
                msg: 'El campo "activo" es requerido y debe ser booleano'
            });
        }

        const vehiculo = await Vehiculo.findByPk(id);

        if (!vehiculo) {
            return res.status(404).json({
                status: '0',
                msg: 'Vehículo no encontrado'
            });
        }

        await vehiculo.update({ activo });
        const accion = activo ? 'activado' : 'dado de baja lógicamente';

        res.status(200).json({
            status: '1',
            msg: `Vehículo ${accion} correctamente`,
            data: vehiculo
        });
    } catch (error) {
        res.status(400).json({
            status: '0',
            msg: 'Error al cambiar el estado del vehículo',
            error: error.message
        });
    }
};

// PUT /api/admin/conductoras/:idConductora/cambiar-vehiculo
adminCtrl.gestionarCambioVehiculo = async (req, res) => {
    try {
        const { idConductora } = req.params;
        const { idVehiculo, autorizar } = req.body; // idVehiculo a asignar y autorizar (true/false)

        if (!idVehiculo || autorizar === undefined || typeof autorizar !== 'boolean') {
            return res.status(400).json({
                status: '0',
                msg: 'Los campos idVehiculo y autorizar (booleano) son requeridos'
            });
        }

        // 1. Validar que la conductora exista y tenga el rol correcto
        const conductora = await Usuario.findByPk(idConductora);
        if (!conductora || conductora.rol !== 2) {
            return res.status(400).json({
                status: '0',
                msg: 'La usuaria no existe o no corresponde al rol de Conductora'
            });
        }

        // 2. Validar que el vehículo exista y esté activo
        const vehiculo = await Vehiculo.findByPk(idVehiculo);
        if (!vehiculo) {
            return res.status(404).json({
                status: '0',
                msg: 'El vehículo que intenta asignar no existe'
            });
        }

        if (!vehiculo.activo) {
            return res.status(400).json({
                status: '0',
                msg: 'No se puede asignar este vehículo porque está dado de baja o inactivo'
            });
        }

        // 3. Procesar la autorización de la Administradora
        if (!autorizar) {
            return res.status(200).json({
                status: '1',
                msg: 'El cambio de vehículo fue rechazado por la Administradora. El auto sigue libre.'
            });
        }

        // 4. Lógica de negocio: Desvincular el vehículo anterior si esa conductora ya tenía uno
        await Vehiculo.update(
            { idConductoraAsociada: null },
            { where: { idConductoraAsociada: idConductora } }
        );

        // 5. Vincular el nuevo vehículo a la conductora
        await vehiculo.update({ idConductoraAsociada: idConductora });

        res.status(200).json({
            status: '1',
            msg: `Vehículo asignado exitosamente a la conductora ${conductora.nombre}`,
            data: {
                idConductora: conductora.idUsuario,
                nombreConductora: conductora.nombre,
                idVehiculo: vehiculo.idVehiculo,
                patente: vehiculo.patente
            }
        });
    } catch (error) {
        res.status(400).json({
            status: '0',
            msg: 'Error al gestionar el cambio de vehículo',
            error: error.message
        });
    }
};
//=================================================================================================
// GET /api/admin/informe-mensual?mes=07&anio=2026
adminCtrl.obtenerInformeMensual = async (req, res) => {
    try {
        // 1. Obtener mes y año por Query Params. Si no vienen, usamos el mes actual.
        const fechaActual = new Date();
        const mes = req.query.mes ? parseInt(req.query.mes) : fechaActual.getMonth() + 1;
        const anio = req.query.anio ? parseInt(req.query.anio) : fechaActual.getFullYear();

        // 2. Formatear mes con dos dígitos (ej: 7 -> "07")
        const mesFormateado = mes < 10 ? `0${mes}` : `${mes}`;

        // 3. Calcular el último día del mes de forma dinámica
        const ultimoDia = new Date(anio, mes, 0).getDate();
        const ultimoDiaFormateado = ultimoDia < 10 ? `0${ultimoDia}` : `${ultimoDia}`;

        // 4. formato YYYY-MM-DD para el DATEONLY 
        const fechaInicioStr = `${anio}-${mesFormateado}-01`;
        const fechaFinStr = `${anio}-${mesFormateado}-${ultimoDiaFormateado}`;

        // 5. Consulta analítica usando operadores de rango 
        const metricas = await Viaje.findAll({
            where: {
                fecha: {
                    [Op.gte]: fechaInicioStr, 
                    [Op.lte]: fechaFinStr     
                }
            },
            attributes: [
                // Contamos cuántos viajes tienen estado 'Finalizado'
                [fn('COUNT', fn('NULLIF', col('estadoViaje'), 'Cancelado en Ruta')), 'serviciosCompletados'],
                
                // Contamos cuántos viajes fueron cancelados
                [fn('COUNT', fn('NULLIF', col('estadoViaje'), 'Finalizado')), 'serviciosCancelados'],
                
                // Sumamos la recaudación total de la columna 'monto'
                [fn('SUM', col('monto')), 'recaudacionTotal']
            ],
            raw: true
        });

        const resultado = metricas[0] || {};
        
        // 6. respuesta final
        res.status(200).json({
            status: '1',
            msg: `Informe analítico generado con éxito para el período ${mesFormateado}/${anio}`,
            data: {
                mes: mesFormateado,
                anio,
                recaudacionTotal: parseFloat(resultado.recaudacionTotal || 0).toFixed(2),
                serviciosCompletados: parseInt(resultado.serviciosCompletados || 0),
                serviciosCancelados: parseInt(resultado.serviciosCancelados || 0),
                totalViajesPeriodo: parseInt(resultado.serviciosCompletados || 0) + parseInt(resultado.serviciosCancelados || 0)
            }
        });

    } catch (error) {
        res.status(400).json({
            status: '0',
            msg: 'Error al procesar el informe analítico de viajes',
            error: error.message
        });
    }
};

module.exports = adminCtrl;