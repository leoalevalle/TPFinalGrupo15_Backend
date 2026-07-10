const { DataTypes } = require('sequelize');
const Usuario = require('./usuario.model');

const Conductora = Usuario.scope('conductora');

Usuario.init({
  ...Usuario.rawAttributes,
  disponible: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: true
  },
  enJornada: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: true,
    field: 'en_jornada'
  },
  enViaje: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: true,
    field: 'en_viaje'
  },
  zonaActual: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'zona_actual'
  },
  saldoAcumulado: {
        type: DataTypes.FLOAT,
        allowNull: true, 
        defaultValue: 0.0
  }
}, {
  sequelize: require('../../config/database'),
  tableName: 'usuarios',
  paranoid: true,
  modelName: 'Conductora',
});

module.exports = Conductora;