const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'lib', 'placeholder-data.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Add comedorId: 'comedor-1' to areas
content = content.replace(/\{ id: 'servicio',/g, "{ id: 'servicio', comedorId: 'comedor-1',");
content = content.replace(/\{ id: 'cocina',/g, "{ id: 'cocina', comedorId: 'comedor-1',");
content = content.replace(/\{ id: 'limpieza',/g, "{ id: 'limpieza', comedorId: 'comedor-1',");
content = content.replace(/\{ id: 'almacen',/g, "{ id: 'almacen', comedorId: 'comedor-1',");
content = content.replace(/\{ id: 'equipos',/g, "{ id: 'equipos', comedorId: 'comedor-1',");
content = content.replace(/\{ id: 'administracion',/g, "{ id: 'administracion', comedorId: 'comedor-1',");
content = content.replace(/\{ id: 'operaciones',/g, "{ id: 'operaciones', comedorId: 'comedor-1',");
content = content.replace(/\{ id: 'rrhh',/g, "{ id: 'rrhh', comedorId: 'comedor-1',");

// Add comedorId to tasks
content = content.replace(/id: 'task-\d+',/g, "$& comedorId: 'comedor-1',");

// Add comedorId to inventoryItems
content = content.replace(/id: 'inv-[\w]+',/g, "$& comedorId: 'comedor-1',");

// Fix dates in inventoryItems
content = content.replace(/fechaCreacion: '([^']+)',/g, "fechaCreacion: new Date('$1'),");
content = content.replace(/ultimaActualizacion: '([^']+)',/g, "ultimaActualizacion: new Date('$1'),");

// Add comedorId to transactions
content = content.replace(/transactionId: 'txn-\d+',/g, "$& comedorId: 'comedor-1',");

// Add comedorId to orders
content = content.replace(/orderId: 'ord-\d+',/g, "$& comedorId: 'comedor-1',");

// Add comedorId to menus
content = content.replace(/id: 'menu-\d+',/g, "$& comedorId: 'comedor-1',");

// Add comedorId to attendanceRecords
content = content.replace(/id: 'att-\d+',/g, "$& comedorId: 'comedor-1',");

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Fixed placeholder-data.ts');
