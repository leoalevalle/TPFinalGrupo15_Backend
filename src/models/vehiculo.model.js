const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database'); 

const Vehiculo = sequelize.define('Vehiculo', {
    idVehiculo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    idConductoraAsociada: {
        type: DataTypes.INTEGER,
        allowNull: true, // Permite NULL al inicio si el auto está en stock y no asignado todavía
        references: {
            model: 'usuarios', 
            key: 'idUsuario'
        }
    },
    marca: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'La marca del vehículo es requerida' }
        }
    },
    modelo: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'El modelo del vehículo es requerido' }
        }
    },
    color: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'El color del vehículo es requerido' }
        }
    },
    patente: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { msg: 'Ya existe un vehículo registrado con esta patente' },
        validate: {
            notEmpty: { msg: 'La patente es requerida' }
        }
    },
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true // Flag de baja lógica controlado por la Administradora
    }
}, {
    tableName: 'vehiculos',
    timestamps: true,
    paranoid: true 
});

module.exports = Vehiculo;