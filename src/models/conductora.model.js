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
  zonaActual: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'zona_actual'
  }
}, {
  sequelize: require('../../config/database'),
  tableName: 'usuarios',
  modelName: 'Conductora'
});

module.exports = Conductora;