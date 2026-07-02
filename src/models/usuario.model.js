const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Usuario = sequelize.define('Usuario', {
    idUsuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'El nombre es requerido' }
        }
    },
    telefono: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'El teléfono es requerido' }
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { msg: 'Ya existe un usuario registrado con ese email' },
        validate: {
            isEmail: { msg: 'El email debe tener un formato válido' },
            notEmpty: { msg: 'El email es requerido' }
        }
    },
    nomUsuario: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { msg: 'El nombre de usuario ya está en uso' },
        validate: {
            notEmpty: { msg: 'El nombre de usuario es requerido' }
        }
    },
    contrasenia: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'La contraseña es requerida' }
        }
    },
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true 
    },
    rol: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isIn: {
                args: [[1, 2, 3, 4]],
                msg: 'El rol debe ser 1 (Pasajera), 2 (Conductora), 3 (Operadora) o 4 (Admin)'
            }
        }
    },
    sexo: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'El campo sexo es obligatorio para el filtro de seguridad' }
        }
    },
    
    /* =========================================================================
       ATRIBUTOS ESPECÍFICOS DE SUBCLASES (HERENCIA DE TABLA ÚNICA)
       ========================================================================= */
    
    // Atributos de Pasajera (Rol 1)
    aprobadaPorAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: true, // Debe permitir NULL porque operadoras y choferes no lo usan
        defaultValue: false // Por defecto inicia sin aprobar hasta filtro de seguridad
    },

    // Atributos de Conductora (Rol 2)
    disponible: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
    },
    enJornada: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
    },
    zonaActual: {
        type: DataTypes.STRING,
        allowNull: true // Se define cuando inicia la jornada
    }
}, {
    tableName: 'usuarios',
    timestamps: true,
    paranoid: true, 
    
    // Scopes basados rigurosamente en especificación de roles
    scopes: {
        pasajera: {
            where: { rol: 1 }
        },
        conductora: {
            where: { rol: 2 }
        },
        operadora: {
            where: { rol: 3 }
        },
        administradora: {
            where: { rol: 4 }
        }
    }
});

module.exports = Usuario;