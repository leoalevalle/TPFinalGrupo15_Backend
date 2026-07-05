const {DataTypes} = require('sequelize');
const sequelize = require('../../config/database');

const SolicitudViaje = sequelize.define('SolicitudViaje',{
    idSolicitud: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    idPasajera: { type: DataTypes.INTEGER, allowNull: false},
    idConductoraAsignada: {type: DataTypes.INTEGER, allowNull: true},
    fechaHora: {type: DataTypes.DATE, defaultValue: DataTypes.NOW},
    origen: { type: DataTypes.STRING, allowNull: false},
    destino: { type: DataTypes.STRING, allowNull: false},
    zona: { type: DataTypes.STRING, allowNull: false},
    estado: { 
        type: DataTypes.ENUM('Pendiente', 'Propuesta', 'Rechazada', 'Cancelada', 'Aceptada'),
        defaultValue: 'Pendiente'
    },
    cantPasajeros: { type: DataTypes.INTEGER, defaultValue: 1}
    }, {
        tableName: 'solicitudes_viaje',
        timestamps: true
    }
);

module.exports = SolicitudViaje;
