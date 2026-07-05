const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Vehiculo = sequelize.define('Vehiculo', {
  idVehiculo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_vehiculo'
  },
  idConductoraAsociada: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'id_conductora_asociada',
    references: {
      model: 'usuarios',
      key: 'idUsuario'
    }
  },
  marca: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  modelo: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  color: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  patente: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    comment: 'Flag de baja lógica controlado por la Administradora'
  }
}, {
  tableName: 'vehiculos',
  timestamps: true
});

module.exports = Vehiculo;