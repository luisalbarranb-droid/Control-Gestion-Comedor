
import { Timestamp } from 'firebase/firestore';

export type Role = 'superadmin' | 'admin' | 'comun';
export type AreaId = 'servicio' | 'cocina' | 'limpieza' | 'almacen' | 'equipos' | 'administracion' | 'operaciones' | 'rrhh';
export type TaskStatus = 'pendiente' | 'en-progreso' | 'completada' | 'verificada' | 'rechazada';
export type TaskPriority = 'baja' | 'media' | 'alta' | 'urgente';
export type TaskPeriodicity = 'diaria' | 'semanal' | 'quincenal' | 'mensual' | 'unica';
export type WorkerType = 'obrero' | 'empleado';
export type ContractType = 'determinado' | 'indeterminado' | 'prueba';


export interface User {
  id: string; // Document ID from Firestore
  userId: string;
  email: string;
  name: string;
  cedula?: string;
  phone?: string;
  address?: string;
  role: Role;
  area: AreaId;
  isActive: boolean;
  creationDate: Date | Timestamp; // Fecha de Ingreso
  contractEndDate?: Date | Timestamp;
  createdBy: string; // userId or 'system'
  lastAccess: Date | Timestamp;
  avatarUrl?: string;
  workerType?: WorkerType;
  contractType?: ContractType;
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
  id: string; // Document ID from Firestore
  titulo: string;
  descripcion: string;
  area: AreaId;
  asignadoA: string; // userId
  creadoPor: string; // userId
  estado: TaskStatus;
  prioridad: TaskPriority;
  periodicidad: TaskPeriodicity;
  fechaCreacion: Date | Timestamp;
  fechaVencimiento: Date | Timestamp;
  fechaCompletado?: Date | Timestamp;
  proximaEjecucion?: Date | Timestamp;
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
  id: string;
  nombre: string;
  descripcion?: string;
  categoriaId: InventoryCategoryId;
  cantidad: number;
  unidad: UnitOfMeasure;
  stockMinimo: number;
  fechaCreacion: Date | Timestamp;
  ultimaActualizacion: Date | Timestamp;
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

export interface MenuReportData {
  'Fecha Menú': string;
  Plato: string;
  Categoría: string;
  PAX: number;
  Ingrediente: string;
  'Cant. Neta / Persona': number;
  'Cant. Bruta / Persona': number;
  'Total Requerido': number;
  Unidad: string;
}

export interface MenuImportRow {
  date: Date;
  pax: number;
  itemName: string;
  itemCategory: string;
  ingredientName: string;
  ingredientQuantity: number;
  ingredientWasteFactor: number;
}


// DAILY CLOSING TYPES
export interface DailyClosingItem {
  name: string;
  category: MenuItemCategory;
}

export interface DailyClosing {
  closingId: string;
  date: Date;
  plannedMenu: Menu | null;
  executedPax: number;
  executedItems: DailyClosingItem[];
  variations: string;
  closedBy: string; // userId
}

// ATTENDANCE TYPES
export type AttendanceStatus = 'presente' | 'ausente' | 'retardo' | 'fuera-de-horario' | 'justificado' | 'no-justificado' | 'vacaciones' | 'dia-libre';
export type LeaveType = 'justificado' | 'no-justificado' | 'vacaciones';

export interface AttendanceRecord {
    recordId: string;
    userId: string;
    checkIn: Date;
    checkOut?: Date;
    status: AttendanceStatus;
    leaveType?: LeaveType;
}

export interface ConsolidatedRecord {
  userId: string;
  userName: string;
  attendedDays: number;
  absentDays: number;
  freeDays: number;
  justifiedRestDays: number;
  totalHours: number;
}

export interface LeaveRecord {
    leaveId: string;
    userId: string;
    startDate: Date;
    endDate: Date;
    type: LeaveType;
    reason: string;
    approvedBy?: string; // admin or superadmin userId
}

// 0 for Monday, 1 for Tuesday, etc. up to 6 for Sunday
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface DayOff {
  id: string;
  userId: string;
  weekStartDate: string; // YYYY-MM-DD
  dayOff: DayOfWeek; // The one flexible day off
}
