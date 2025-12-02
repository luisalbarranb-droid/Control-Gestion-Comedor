export type Role = 'superadmin' | 'admin' | 'comun';
export type AreaId = 'servicio' | 'cocina' | 'limpieza' | 'almacen' | 'equipos' | 'administracion';
export type TaskStatus = 'pendiente' | 'en-progreso' | 'completada' | 'verificada' | 'rechazada';
export type TaskPriority = 'baja' | 'media' | 'alta' | 'urgente';
export type TaskPeriodicity = 'diaria' | 'semanal' | 'quincenal' | 'mensual' | 'unica';

export interface User {
  userId: string;
  email: string;
  nombre: string;
  rol: Role;
  area: AreaId;
  activo: boolean;
  fechaCreacion: Date;
  creadoPor: string; // userId or 'system'
  ultimoAcceso: Date;
  telefono?: string;
  avatarUrl?: string;
}

export interface Area {
  id: AreaId;
  nombre: string;
  color: string;
  responsable: string; // userId
  descripcion: string;
  activa: boolean;
}

export interface ChecklistItem {
  item: string;
  completado: boolean;
  fechaCompletado?: Date;
}

export interface Evidence {
  url: string;
  nombreArchivo: string;
  fechaSubida: Date;
  usuario: string; // userId
  descripcion: string;
}

export interface Comment {
  usuario: string; // userId
  mensaje: string;
  fecha: Date;
  tipo: 'comentario' | 'advertencia' | 'elogio';
}

export interface Task {
  taskId: string;
  titulo: string;
  descripcion: string;
  area: AreaId;
  asignadoA: string; // userId
  creadoPor: string; // userId
  estado: TaskStatus;
  prioridad: TaskPriority;
  periodicidad: TaskPeriodicity;
  fechaCreacion: Date;
  fechaVencimiento: Date;
  fechaCompletado?: Date;
  proximaEjecucion?: Date;
  checklist: ChecklistItem[];
  evidencias: Evidence[];
  comentarios: Comment[];
  tiempoEstimado: number; // in minutes
  tags: string[];
  recurrente: boolean;
  padreId?: string;
}

export interface Stats {
  periodo: string; // YYYY-MM
  totalTareas: number;
  tareasCompletadas: number;
  tareasPendientes: number;
  tareasRetrasadas: number;
  eficienciaGeneral: number; // percentage
  porArea: Record<AreaId, { total: number; completadas: number; eficiencia: number }>;
  porUsuario: Record<string, { // userId
    totalAsignadas: number;
    completadas: number;
    eficiencia: number;
    tiempoPromedio: number;
  }>;
  tendenciaMensual: number;
  areasCriticas: AreaId[];
  usuariosDestacados: string[]; // userIds
}

// INVENTORY TYPES
export type InventoryCategoryId = 'carnes' | 'viveres' | 'verduras' | 'frutas' | 'descartables' | 'oficina';
export type UnitOfMeasure = 'kg' | 'g' | 'lt' | 'ml' | 'unidad' | 'paquete' | 'caja';

export interface InventoryCategory {
  id: InventoryCategoryId;
  nombre: string;
}

export interface InventoryItem {
  itemId: string;
  nombre: string;
  descripcion?: string;
  categoriaId: InventoryCategoryId;
  cantidad: number;
  unidad: UnitOfMeasure;
  stockMinimo: number;
  fechaCreacion: Date;
  ultimaActualizacion: Date;
  proveedor?: string;
  costoUnitario?: number;
}

export interface InventoryTransaction {
  transactionId: string;
  itemId: string;
  type: 'entrada' | 'salida';
  quantity: number;
  date: Date;
  documentNumber?: string;
  supplier?: string;
  reason?: string; // e.g., 'Uso en Producción', 'Vencimiento'
  destinationArea?: AreaId;
}

export interface InventoryReportData {
  'ID de Artículo': string;
  'Nombre': string;
  'Categoría': string;
  'Cantidad Actual': number;
  'Unidad': string;
  'Stock Mínimo': number;
  'Costo Unitario'?: number;
  'Valor Total': number;
  'Estado': 'OK' | 'Bajo Stock';
  'Última Actualización': string;
}

export type OrderStatus = 'pendiente' | 'completado' | 'cancelado';

export interface InventoryOrderItem {
  itemId: string;
  nombre: string;
  quantity: number;
  unit: UnitOfMeasure;
  costo: number;
}

export interface InventoryOrder {
  orderId: string;
  fechaPedido: Date;
  fechaEntregaEstimada: Date;
  proveedor: string;
  items: InventoryOrderItem[];
  estado: OrderStatus;
  costoTotal: number;
  creadoPor: string; // userId
}

// MENU TYPES
export type MenuItemCategory = 'entrada' | 'proteico' | 'acompanante1' | 'acompanante2' | 'acompanante3' | 'bebida' | 'postre';

export interface Ingredient {
  inventoryItemId: string; // link to InventoryItem
  quantity: number; // quantity per person
  wasteFactor: number; // percentage (0 to 1)
}

export interface MenuItem {
  menuItemId: string;
  name: string;
  category: MenuItemCategory;
  ingredients: Ingredient[];
}

export interface Menu {
  menuId: string;
  date: Date;
  pax: number; // number of people
  items: MenuItem[];
}