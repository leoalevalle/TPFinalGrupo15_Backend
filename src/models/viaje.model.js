const {DataTypes} = require('sequelize');
const sequelize = require('../../config/database');

const Viaje = sequelize.define('Viaje', {
    idViaje: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    idSolicitudOrigen: { type: DataTypes.INTEGER, allowNull: false},
    idPasajera: { type: DataTypes.INTEGER, allowNull: false},
    idConductora: { type: DataTypes.INTEGER, allowNull: false},
    idOperadoraAsignadora: { type: DataTypes.INTEGER, allowNull: false},
    patenteVehiculoUtilizado: { type: DataTypes.STRING, allowNull: false},
    fecha: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW},
    horarioInicio: { type: DataTypes.DATE, allowNull: false},
    horarioFin: { type: DataTypes.DATE, allowNull: false},
    estadoViaje: { type: DataTypes.ENUM('En camino', 'Finalizado', 'Cancelado en Ruta'),
        defaultValue: 'En Camino'
    },
    monto: { type: DataTypes.FLOAT, allowNull: true}
    },{
        tableName: 'viajes',
        timestamps: false
    }
);

module.exports = Viaje;
