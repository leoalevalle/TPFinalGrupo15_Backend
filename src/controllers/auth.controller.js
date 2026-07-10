const Usuario = require('../models/usuario.model');
const Vehiculo = require('../models/vehiculo.model'); 
const jwt = require('jsonwebtoken');

const authCtrl = {};

// =========================================================================
// INICIO DE SESIÓN 
// =========================================================================
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

        // 6. Generar respuesta exitosa con el Token Real firmado
        const tokenReal = jwt.sign(
            { idUsuario: usuario.idUsuario, rol: usuario.rol }, 
            'PALABRA_SECRETA_TAXFEM_2026',
            { expiresIn: '24h' }
        );

        res.status(200).json({
            status: '1',
            msg: 'Inicio de sesión exitoso',
            token: tokenReal,
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

// =========================================================================
// MÉTODOS DE REGISTRO 
// =========================================================================

// POST /api/auth/register (Para Pasajeras)
authCtrl.registrarPasajera = async (req, res) => {
    try {
        const { nombre, telefono, email, nomUsuario, contrasenia, sexo } = req.body;

        // Validar Filtro de Género exclusivo de TaxFem
        if (sexo !== 'F') {
            return res.status(400).json({
                status: '0',
                msg: 'Registro rechazado. TaxFem es una plataforma exclusiva para el transporte seguro de mujeres.'
            });
        }

        const nuevaPasajera = await Usuario.create({
            nombre,
            telefono,
            email,
            nomUsuario,
            contrasenia,
            sexo,
            rol: 1,
            activo: true 
        });

        res.status(201).json({
            status: '1',
            msg: 'Pasajera registrada con éxito',
            data: nuevaPasajera
        });
    } catch (error) {
        res.status(400).json({ status: '0', msg: 'Error al registrar pasajera', error: error.message });
    }
};

// POST /api/auth/register-conductora (Para Conductoras + Vehículo)
authCtrl.registrarConductora = async (req, res) => {
    try {
        const { nombre, telefono, email, nomUsuario, contrasenia, sexo, marca, modelo, color, patente } = req.body;

        // Validar Filtro de Género exclusivo de TaxFem
        if (sexo !== 'F') {
            return res.status(400).json({
                status: '0',
                msg: 'Registro rechazado. Solo se admiten conductoras mujeres.'
            });
        }

        // Crear la Conductora (Inactiva: requiere que la admin la habilite)
        const nuevaConductora = await Usuario.create({
            nombre,
            telefono,
            email,
            nomUsuario,
            contrasenia,
            sexo,
            rol: 2,
            activo: false 
        });

        // Crear el Vehículo asociado usando la FK
        const nuevoVehiculo = await Vehiculo.create({
            marca,
            modelo,
            color,
            patente,
            activo: true,
            idConductoraAsociada: nuevaConductora.idUsuario 
        });

        res.status(201).json({
            status: '1',
            msg: 'Solicitud de conductora enviada con éxito. Pendiente de aprobación.',
            usuario: nuevaConductora,
            vehiculo: nuevoVehiculo
        });
    } catch (error) {
        res.status(400).json({ status: '0', msg: 'Error al registrar conductora', error: error.message });
    }
};

//LOGIN CON GOOGLE 
authCtrl.loginGoogle = async (req, res) => {

    console.log("Entró a login Google");
    try {
        console.log("Entró a login Google");
        console.log("Body recibido:", req.body);
        const { email } = req.body;
        const usuario = await Usuario.findOne({
            where: { email }
        });
        console.log("Usuario encontrado:", usuario);

        if (!usuario) {
            console.log("NO EXISTE EL USUARIO");
            return res.status(404).json({
                status: "0",
                msg: "No existe un usuario registrado con ese correo."
            });
        }

        if (!usuario.activo) {
            return res.status(403).json({
                status: "0",
                msg: "Usuario deshabilitado."
            });
        }

        const tokenReal = jwt.sign(
            {
                idUsuario: usuario.idUsuario,
                rol: usuario.rol
            },
            'PALABRA_SECRETA_TAXFEM_2026',
            {
                expiresIn: '24h'
            }
        );

        res.json({
            status: "1",
            msg: "Login Google exitoso",
            token: tokenReal,
            user: {
                idUsuario: usuario.idUsuario,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol,
                nomUsuario: usuario.nomUsuario,
                sexo: usuario.sexo
            }
        });
    }
    catch(error){
        res.status(500).json({
            status:"0",
            msg:error.message
        });
    }
}


// REGISTRO AUTOMÁTICO DE PASAJERA CON GOOGLE
authCtrl.registrarGooglePasajera = async (req, res) => {

    try {
        const { nombre, email } = req.body;
        // Verificar si ya existe
        const existe = await Usuario.findOne({
            where: { email }
        });
        if (existe) {
            return res.status(400).json({
                status: "0",
                msg: "Ya existe un usuario con ese correo."
            });
        }

        // Generar nombre de usuario automático
        // Generar nombre de usuario automático
        const nomUsuario = email.split("@")[0];

        // Crear pasajera
        const nuevaPasajera = await Usuario.create({
            nombre,
            email,
            telefono: "Sin registrar",
            nomUsuario,
            contrasenia: "GOOGLE_LOGIN",
            sexo: "F",
            rol: 1,
            activo: true,
            aprobadaPorAdmin: true,
            loginGoogle: true
        });

        // Generar JWT
        const token = jwt.sign(
            {
                idUsuario: nuevaPasajera.idUsuario,
                rol: nuevaPasajera.rol
            },
            'PALABRA_SECRETA_TAXFEM_2026',
            {
                expiresIn: '24h'
            }
        );

        res.status(201).json({
            status: "1",
            msg: "Registro con Google exitoso.",
            token,
            user: {
                idUsuario: nuevaPasajera.idUsuario,
                nombre: nuevaPasajera.nombre,
                email: nuevaPasajera.email,
                rol: nuevaPasajera.rol,
                nomUsuario: nuevaPasajera.nomUsuario,
                sexo: nuevaPasajera.sexo
            }

        });

    }

    catch (error) {
        res.status(500).json({
            status: "0",
            msg: error.message
        });
    }
};

module.exports = authCtrl;