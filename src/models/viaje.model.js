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
    horarioCaminoOrigen: { type: DataTypes.DATE, allowNull: false},
    horarioInicio: { type: DataTypes.DATE, allowNull: true},
    horarioFin: { type: DataTypes.DATE, allowNull: true},
    estadoViaje: { type: DataTypes.ENUM('En Camino', 'En Origen','En Viaje','Finalizado', 'Cancelado en Ruta'),
        defaultValue: 'En Camino'
    },
    monto: { type: DataTypes.FLOAT, allowNull: true},
    metodoPago: { type: DataTypes.ENUM('Efectivo', 'MercadoPago'), allowNull: true},
    estadoPago: { type: DataTypes.ENUM('Pendiente', 'Aprobado', 'Fallido'), defaultValue: 'Pendiente'},
    mercadopagoPaymentId: { type: DataTypes.STRING, allowNull: true}
    },{
        tableName: 'viajes',
        timestamps: false
    }
);

module.exports = Viaje;
