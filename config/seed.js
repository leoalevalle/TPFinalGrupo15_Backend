const Usuario = require('../src/models/usuario.model');
const Conductora = require('../src/models/conductora.model');
const Vehiculo = require('../src/models/vehiculo.model');

const cargarDatosDePrueba = async () => {
  try {
    // 1. Verificamos si ya hay datos de conductoras para no duplicar todo el bloque inicial
    const cantidadUsuarios = await Conductora.count();
    if (cantidadUsuarios > 0) {
      console.log('🌱 El sistema ya cuenta con datos de prueba cargados.');
      return;
    }

    console.log('🌱 Cargando datos de prueba iniciales...');

    // 2. Crear una Administradora (Rol 4)
    const admin = await Usuario.create({
      nombre: 'Sofía Administradora',
      telefono: '123456789',
      email: 'sofi@transporte.com',
      nomUsuario: 'sofi_admin',
      contrasenia: 'admin123', 
      rol: 4, // 4 = Admin
      sexo: 'Femenino'
    });

    // 3. Crear Conductoras (Rol 2)
    const chofer1 = await Conductora.create({
      nombre: 'Mariana López',
      telefono: '3884987654',
      email: 'mariana.chofer@gmail.com',
      nomUsuario: 'mari_lopez',
      contrasenia: 'driver123',
      activo: true,
      aprobadaPorAdmin: true,
      rol: 2,
      sexo: 'Femenino',
      enJornada: false,
      disponible: false
    });

    const chofer2 = await Conductora.create({
      nombre: 'Gabriela Silva',
      telefono: '3884555666',
      email: 'gabi.silva@gmail.com',
      nomUsuario: 'gabi_silva',
      contrasenia: 'driver456',
      activo: true,
      aprobadaPorAdmin: true,
      rol: 2,
      sexo: 'Femenino',
      enJornada: false,
      disponible: false
    });

    // 🌟 4. NUEVO: Crear Pasajera (Rol 1)
    const pasajera = await Usuario.create({
      nombre: "Ana López",
      telefono: "987654321",
      email: "ana@mail.com",
      nomUsuario: "ana_pasajera",
      contrasenia: "ana123",
      rol: 1, // 1 = Pasajera
      sexo: "Femenino",
      aprobadaPorAdmin: true // Ya lista para loguearse y probar
    });

    // 🌟 5. NUEVO: Crear Operadora (Rol 3)
    const operadora = await Usuario.create({
      nombre: "Paola Oper",
      telefono: "987654311",
      email: "pao@mail.com",
      nomUsuario: "pao_oper",
      contrasenia: "pao123",
      rol: 3, // 3 = Operadora
      sexo: "Femenino",
      aprobadaPorAdmin: true // Ya lista para loguearse y probar
    });

    // 6. Crear Vehículos de prueba
    // A Mariana (chofer1) ya le dejamos asignado un auto activo
    await Vehiculo.create({
      marca: 'Toyota',
      modelo: 'Etios',
      color: 'Gris Plata',
      patente: 'AE123MZ',
      activo: true,
      idConductoraAsociada: chofer1.idUsuario 
    });

    // Dejamos un auto libre en el taller mecánico, sin chofer asignado
    await Vehiculo.create({
      marca: 'Fiat',
      modelo: 'Cronos',
      color: 'Blanco',
      patente: 'AF987XX',
      activo: true,
      idConductoraAsociada: null
    });

    // Dejamos un auto inactivo asignado a Gabriela (chofer2) para probar tu regla de negocio
    await Vehiculo.create({
      marca: 'Chevrolet',
      modelo: 'Onix',
      color: 'Negro',
      patente: 'AD555BB',
      activo: false,
      idConductoraAsociada: chofer2.idUsuario
    });

    console.log('✅ ¡Datos de prueba cargados exitosamente!');
    console.log('   - 1 Administradora (ID: ' + admin.idUsuario + ')');
    console.log('   - 2 Conductoras (IDs: ' + chofer1.idUsuario + ', ' + chofer2.idUsuario + ')');
    console.log('   - 1 Pasajera (Ana - ID: ' + pasajera.idUsuario + ')');
    console.log('   - 1 Operadora (Paola - ID: ' + operadora.idUsuario + ')');
    console.log('   - 3 Vehículos (1 Activo asignado, 1 Libre, 1 Inactivo asignado)');

  } catch (error) {
    console.error('❌ Error al cargar los datos del semillero (seed):', error.message);
  }
};

module.exports = { cargarDatosDePrueba };