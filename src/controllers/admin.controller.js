const Usuario = require('../models/usuario.model');

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

module.exports = adminCtrl;