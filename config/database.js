const { Sequelize } = require('sequelize');

require('dotenv').config();

let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,     // Toma el valor del .env local
    process.env.DB_USER,     // Toma el valor del .env local
    process.env.DB_PASSWORD, // Toma el valor del .env local 
    {
      host: process.env.DB_HOST || 'localhost',
      dialect: 'postgres',
      logging: console.log
    }
  );
}

module.exports = sequelize;