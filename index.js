const express = require('express'); 
const cors = require('cors'); 
const sequelize = require('./config/database');

const helloRoutes = require('./src/routes/hello.routes');

// === Configuración de Swagger ===
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./docs/swagger.yaml');

var app = express(); 
 
// Middlewares 
app.use(cors());
app.use(express.json());
 
// Interfaz de Swagger expuesta en la raíz /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rutas de la API
app.use('/api', helloRoutes);
 
// Settings 
app.set('port', process.env.PORT || 3000); 

// Sincronizar Base de Datos y arrancar el servidor 
sequelize.sync({ force: false, alter: true })
    .then(async () => {
        console.log('Tablas de PostgreSQL sincronizadas');

        // Obtenemos el puerto asignado en settings de express
        const serverPort = app.get('port');

        app.listen(serverPort, () => {
            console.log(`Servidor corriendo en http://localhost:${serverPort}`);
            console.log(`Documentación Swagger disponible en http://localhost:${serverPort}/api-docs`);
        });
    })
    .catch(err => {
        console.error('Error al sincronizar: ', err);
    });
    
    
    