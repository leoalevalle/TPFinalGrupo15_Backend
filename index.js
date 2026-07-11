require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");
const { cargarDatosDePrueba } = require("./config/seed");
 
// Importación de rutas
const helloRoutes = require("./src/routes/hello.routes");
const authRoutes = require("./src/routes/auth.routes");
const adminRoutes = require("./src/routes/admin.routes");
const conductoraRoute = require("./src/routes/conductora.route");
const transaccionRoute = require("./src/routes/transacciones.route");
const mpRoutes = require('./src/routes/mp.routes.js'); 

// === IMPORTACIÓN DE MODELOS PARA LAS RELACIONES ===
const Usuario = require("./src/models/usuario.model");
const Vehiculo = require("./src/models/vehiculo.model");
const Conductora = require("./src/models/conductora.model");
const Viaje = require("./src/models/viaje.model");
const SolicitudViaje = require("./src/models/solicitud.model");

//const Vehiculo = require('./src/models/vehiculo.model');

// === DEFINICION DE RELACIONES ===
// conductora ------> vehiculo
Conductora.hasOne(Vehiculo, {
  foreignKey: "idConductoraAsociada",
  as: "vehiculoAsignado",
});
Vehiculo.belongsTo(Usuario, {
  foreignKey: "idConductoraAsociada",
  as: "datosConductora",
});

// Un viaje pertenece a una Pasajera (Usuario)
Viaje.belongsTo(Usuario, { foreignKey: "idPasajera", as: "pasajera" });
// Un viaje pertenece a una Conductora (Usuario)
Viaje.belongsTo(Usuario, { foreignKey: "idConductora", as: "conductora" });
// Un viaje se origina de una Solicitud
Viaje.belongsTo(SolicitudViaje, { foreignKey: "idSolicitudOrigen", as: "solicitud" });
// Un viaje utiliza un vehículo identificándolo por su patente
Viaje.belongsTo(Vehiculo, { foreignKey: "patenteVehiculoUtilizado", targetKey: "patente", as: "vehiculo" });

// === Configuración de Swagger ===
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const transaccionesController = require("./src/controllers/transacciones.controller");
const swaggerDocument = YAML.load("./docs/swagger.yaml");

var app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Interfaz de Swagger expuesta en la raíz /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rutas de la API
app.use("/api", helloRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/transaccion", transaccionRoute);
app.use("/api", conductoraRoute);
//rutas para mercado pago 
app.use("/api/mp", mpRoutes); 

// Settings
app.set("port", process.env.PORT || 3000);

// Sincronizar Base de Datos y arrancar el servidor
sequelize
  .sync({ force: true, alter: true })
  .then(async () => {
    console.log("Tablas de PostgreSQL sincronizadas");

    await cargarDatosDePrueba();
    const serverPort = app.get("port");

    app.listen(serverPort, () => {
      console.log(`Servidor corriendo en http://localhost:${serverPort}`);
      console.log(
        `Documentación Swagger disponible en http://localhost:${serverPort}/api-docs`,
      );
    });
  })
  .catch((err) => {
    console.error("Error al sincronizar: ", err);
  });
