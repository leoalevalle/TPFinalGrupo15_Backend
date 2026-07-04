const Usuario = require('../models/usuario.model');

const authCtrl = {};

authCtrl.iniciarSesion = async (req, res) => {
    try {
        const { nomUsuario, contrasenia } = req.body;

        // 1. Validar que vengan los campos requeridos
        if (!nomUsuario || !contrasenia) {
            return res.status(400).json({
                status: '0',
                msg: 'El nombre de usuario y la contraseña son requeridos'
            });
        }

        // 2. Buscar al usuario en la base de datos
        const usuario = await Usuario.findOne({ where: { nomUsuario } });

        // 3. Si no existe, error de credenciales
        if (!usuario) {
            return res.status(401).json({
                status: '0',
                msg: 'Nombre de usuario o contraseña incorrectos'
            });
        }

        // 4. Validar Regla de Negocio: Estado Lógico (Baneo / Desactivación)
        if (!usuario.activo) {
            return res.status(403).json({
                status: '0',
                msg: 'Su usuario se encuentra desactivado o baneado. Contacte a la Administradora.'
            });
        }

        // 5. Validar contraseña (En texto plano como está guardada temporalmente)
        if (usuario.contrasenia !== contrasenia) {
            return res.status(401).json({
                status: '0',
                msg: 'Nombre de usuario o contraseña incorrectos'
            });
        }

        // 6. Generar respuesta exitosa (Simulamos un token por ahora para que el Front lo reciba)
       
        const tokenSimulado = 'JWT_TOKEN_SIMULADO_PROVISORIO';

        res.status(200).json({
            status: '1',
            msg: 'Inicio de sesión exitoso',
            token: tokenSimulado,
            user: {
                idUsuario: usuario.idUsuario,
                nombre: usuario.nombre,
                nomUsuario: usuario.nomUsuario,
                email: usuario.email,
                rol: usuario.rol, 
                sexo: usuario.sexo
            }
        });

    } catch (error) {
        res.status(400).json({
            status: '0',
            msg: 'Error al intentar iniciar sesión',
            error: error.message
        });
    }
};

module.exports = authCtrl;