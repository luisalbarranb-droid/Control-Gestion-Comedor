
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Printer, BookOpen, Download, HelpCircle, FileText,
    Smartphone, Scan, PieChart, Users, Settings,
    CheckCircle2, AlertCircle, ShoppingCart, History,
    Calendar, TrendingUp, Package, ClipboardList,
    UserPlus, QrCode, BarChart3, FileSpreadsheet, Trash2, Building2, LayoutGrid, Upload
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function HelpPage() {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between no-print">
                <div className="flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-primary" />
                    <h1 className="font-headline text-2xl font-bold md:text-3xl text-gray-900">Manual Completo del Usuario</h1>
                </div>
                <Button onClick={handlePrint} className="gap-2 shadow-lg hover:shadow-xl transition-all">
                    <Printer className="h-4 w-4" />
                    Imprimir Manual
                </Button>
            </div>

            <div id="printable-manual" className="space-y-12 bg-white p-2">
                {/* PORTADA */}
                <header className="text-center space-y-4 border-b pb-12 pt-8">
                    <h1 className="text-5xl font-extrabold text-blue-900 tracking-tight">CONTROL COMEDOR</h1>
                    <p className="text-xl text-blue-600 font-semibold tracking-widest uppercase">Manual Completo de Operaciones v2.0</p>
                    <div className="flex justify-center gap-4 text-sm text-gray-500 font-medium">
                        <span>Manual de Usuario</span>
                        <span>•</span>
                        <span>Soporte: arvecladu@gmail.com</span>
                    </div>
                </header>

                {/* TABLA DE CONTENIDOS */}
                <nav className="no-print bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-xl border-2 border-blue-100 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <ClipboardList className="h-6 w-6 text-blue-600" />
                        Tabla de Contenidos
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <PieChart className="h-4 w-4 text-blue-600" /> Módulos Principales
                            </h3>
                            <ul className="text-sm text-blue-700 space-y-1.5 ml-6">
                                <li>• 0. Inicio de Sesión y Primer Acceso</li>
                                <li>• 1. Dashboard y Centro de Control</li>
                                <li>• 2. Gestión de Inventario Inteligente</li>
                                <li>• 3. Recursos Humanos y Asistencia</li>
                                <li>• 4. Planificación de Menús</li>
                                <li>• 5. Reportes y Análisis</li>
                            </ul>
                        </div>
                        <div className="space-y-3">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <Settings className="h-4 w-4 text-green-600" /> Recursos Adicionales
                            </h3>
                            <ul className="text-sm text-green-700 space-y-1.5 ml-6">
                                <li>• 6. Configuración del Sistema</li>
                                <li>• 7. Gestión de Usuarios del Sistema</li>
                                <li>• 8. Gestión Multi-Sede (Comedores)</li>
                                <li>• 9. Solución de Problemas</li>
                                <li>• 10. Mejores Prácticas</li>
                                <li>• 11. Preguntas Frecuentes</li>
                            </ul>
                        </div>
                    </div>
                </nav>

                {/* SECCIÓN 0: ENTRADA AL SISTEMA */}
                <section className="space-y-6 pt-8">
                    <h2 className="text-3xl font-bold flex items-center gap-3 border-b-2 border-indigo-600 pb-2 text-gray-900">
                        <UserPlus className="h-7 w-7 text-indigo-600" />
                        0. Inicio de Sesión y Acceso Directo
                    </h2>

                    <div className="pl-6 space-y-6">
                        <p className="text-gray-700 leading-relaxed text-lg">
                            Para facilitar el ingreso y evitar problemas con correos institucionales, el sistema permite que el responsable (Superadmin o Admin) asigne una <strong>Contraseña Inicial</strong> al momento de crear cualquier cuenta.
                        </p>

                        <div className="bg-indigo-50 p-6 rounded-xl border-l-4 border-indigo-600 font-medium">
                            <h3 className="text-xl font-bold text-indigo-900 mb-3">¿Cómo ingresar por primera vez?</h3>
                            <div className="space-y-4">
                                <div className="flex gap-4 items-start">
                                    <div className="bg-indigo-600 text-white p-2 rounded-lg font-bold">1</div>
                                    <div>
                                        <p className="font-bold text-gray-900">Asignación de Credenciales</p>
                                        <p className="text-sm text-gray-600">El Administrador crea tu perfil y te asigna una clave de acceso (ej: <code className="bg-slate-200 px-1 rounded">V12345678</code> o similar).</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="bg-indigo-600 text-white p-2 rounded-lg font-bold">2</div>
                                    <div>
                                        <p className="font-bold text-gray-900">Primer Inicio de Sesión</p>
                                        <p className="text-sm text-gray-600">Ingresa a la aplicación con tu correo electrónico y la contraseña que te fue entregada.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="bg-indigo-600 text-white p-2 rounded-lg font-bold">3</div>
                                    <div>
                                        <p className="font-bold text-gray-900">Cambio Obligatorio (Recomendado)</p>
                                        <p className="text-sm text-gray-600">Una vez dentro, dirígete al módulo de <strong>Configuración</strong> para cambiar tu clave por una que solo tú conozcas.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-sm text-amber-800">
                            <strong>Nota para administradores:</strong> Si un usuario olvida su clave o no se le asignó una al inicio, aún puede usar el botón <strong>"Olvidé mi contraseña"</strong> en la pantalla de login para recibir un enlace de recuperación en su correo.
                        </div>
                    </div>
                </section>

                {/* SECCIÓN 1: DASHBOARD */}
                <section className="space-y-6 pt-8">
                    <h2 className="text-3xl font-bold flex items-center gap-3 border-b-2 border-blue-600 pb-2 text-gray-900">
                        <PieChart className="h-7 w-7 text-blue-600" />
                        1. Dashboard - Centro de Control
                    </h2>

                    <div className="pl-6 space-y-6">
                        <p className="text-gray-700 leading-relaxed text-lg">
                            El Dashboard es el corazón del sistema. Aquí visualizas en tiempo real el estado completo de tu operación de comedor.
                        </p>

                        <div className="bg-amber-50 p-6 rounded-xl border-l-4 border-amber-600 mb-6">
                            <h3 className="text-xl font-bold text-amber-900 mb-3 flex items-center gap-2">
                                <Building2 className="h-5 w-5" /> Vista por Sedes (Multitenancy)
                            </h3>
                            <p className="text-sm text-amber-800 mb-2">
                                El sistema ahora soporta múltiples comedores. Los datos del Dashboard se filtran según la sede seleccionada.
                            </p>
                            <ul className="text-sm text-amber-900 space-y-1 ml-4">
                                <li>• <strong>Selector de Sede:</strong> Ubicado en la parte superior central. Los SuperAdmins pueden cambiar entre sedes o ver una "Vista Global" de la red.</li>
                                <li>• <strong>Contexto de Datos:</strong> Si eres administrador de una sede específica, solo verás las métricas pertinentes a tu ubicación designada.</li>
                            </ul>
                        </div>

                        <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-600">
                            <h3 className="text-xl font-bold text-blue-900 mb-3">¿Qué puedes ver en el Dashboard?</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4" /> Métricas Financieras
                                    </h4>
                                    <ul className="text-sm text-gray-700 space-y-1 ml-4">
                                        <li>• <strong>Valor Total en Almacén:</strong> Suma del inventario actual × costo promedio</li>
                                        <li>• <strong>Gastos del Mes:</strong> Total de compras realizadas</li>
                                        <li>• <strong>Tendencias:</strong> Comparación con meses anteriores</li>
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" /> Alertas Inteligentes
                                    </h4>
                                    <ul className="text-sm text-gray-700 space-y-1 ml-4">
                                        <li>• <strong>Stock Crítico:</strong> Productos por debajo del mínimo</li>
                                        <li>• <strong>Próximos a Vencer:</strong> Alimentos con fecha cercana</li>
                                        <li>• <strong>Asistencia:</strong> Empleados con faltas recurrentes</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-indigo-900 to-blue-900 text-white p-6 rounded-xl shadow-lg">
                            <h4 className="flex items-center gap-2 font-bold mb-3 text-lg">
                                <Scan className="h-5 w-5" /> Función Destacada: Sugerencia de Compras con IA
                            </h4>
                            <p className="text-sm opacity-95 leading-relaxed mb-4">
                                El sistema analiza tu inventario actual, el menú planificado para la semana y el historial de consumo para generar automáticamente una lista de compras optimizada.
                            </p>
                            <div className="bg-white/10 p-4 rounded-lg">
                                <p className="text-xs font-semibold mb-2">PASO A PASO:</p>
                                <ol className="text-sm space-y-1 list-decimal ml-4">
                                    <li>Haz clic en el botón <strong>"Sugerir Compras con IA"</strong> en la parte superior del Dashboard</li>
                                    <li>El sistema procesará los datos (toma 5-10 segundos)</li>
                                    <li>Recibirás una lista priorizada: productos críticos primero, luego complementarios</li>
                                    <li>Descarga la lista en Excel o PDF para llevarla al mercado</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECCIÓN 2: INVENTARIO */}
                <section className="space-y-6 pt-8">
                    <h2 className="text-3xl font-bold flex items-center gap-3 border-b-2 border-green-600 pb-2 text-gray-900">
                        <ShoppingCart className="h-7 w-7 text-green-600" />
                        2. Gestión de Inventario Inteligente
                    </h2>

                    <div className="pl-6 space-y-8">
                        {/* 2.1 Registro de Entradas */}
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Package className="h-6 w-6 text-green-600" />
                                2.1 Registro de Entradas (Compras)
                            </h3>

                            <div className="bg-green-50 p-6 rounded-xl border border-green-200 mb-4">
                                <h4 className="font-bold text-green-900 mb-3">Método 1: Escaneo Automático de Facturas (Recomendado)</h4>
                                <p className="text-sm text-gray-700 mb-4">Ahorra hasta 80% del tiempo usando la IA para extraer datos de tus facturas.</p>

                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <p className="font-semibold text-gray-800 mb-2">PASOS DETALLADOS:</p>
                                    <ol className="space-y-3 text-sm text-gray-700">
                                        <li className="flex gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                                            <div>
                                                <strong>Navega al Módulo:</strong> Desde el menú lateral, selecciona <strong>"Inventario"</strong>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                                            <div>
                                                <strong>Inicia el Registro:</strong> Haz clic en el botón verde <strong>"Registrar Entrada"</strong> (esquina superior derecha)
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                                            <div>
                                                <strong>Sube la Factura:</strong> Haz clic en el icono de cámara 📷 o arrastra el archivo (JPG, PNG, PDF)
                                                <p className="text-xs text-gray-500 mt-1">💡 Tip: Asegúrate de que la imagen esté bien iluminada y enfocada</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                                            <div>
                                                <strong>Espera el Análisis:</strong> La IA procesará la factura (5-15 segundos). Verás una barra de progreso.
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">5</span>
                                            <div>
                                                <strong>Revisa y Corrige:</strong> El sistema mostrará los datos extraídos:
                                                <ul className="ml-4 mt-1 text-xs space-y-0.5">
                                                    <li>- Proveedor</li>
                                                    <li>- Fecha de compra</li>
                                                    <li>- Lista de productos con cantidades y precios</li>
                                                </ul>
                                                <p className="text-xs text-gray-500 mt-1">⚠️ Revisa siempre los datos. Si algo está mal, edítalo manualmente.</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">6</span>
                                            <div>
                                                <strong>Confirma y Guarda:</strong> Presiona <strong>"Guardar Entrada"</strong>. El inventario se actualizará instantáneamente.
                                            </div>
                                        </li>
                                    </ol>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                <h4 className="font-bold text-gray-900 mb-3">Método 2: Entrada Manual</h4>
                                <p className="text-sm text-gray-700 mb-3">Para facturas pequeñas o cuando no tienes el documento digital.</p>
                                <ol className="space-y-2 text-sm text-gray-700 list-decimal ml-6">
                                    <li>En el diálogo de "Registrar Entrada", selecciona <strong>"Entrada Manual"</strong></li>
                                    <li>Completa los campos: Proveedor, Fecha, Número de Factura</li>
                                    <li>Agrega productos uno por uno usando el botón <strong>"+ Agregar Producto"</strong></li>
                                    <li>Para cada producto: nombre, cantidad, unidad, precio unitario</li>
                                    <li>Guarda la entrada</li>
                                </ol>
                            </div>
                        </div>

                        {/* 2.2 Registro de Salidas */}
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <TrendingUp className="h-6 w-6 text-orange-600" />
                                2.2 Registro de Salidas (Consumo)
                            </h3>

                            <p className="text-gray-700 mb-4">Registra el uso diario de ingredientes para mantener el inventario preciso.</p>

                            <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
                                <ol className="space-y-3 text-sm text-gray-700">
                                    <li className="flex gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                                        <div>Ve a <strong>"Inventario"</strong> &gt; <strong>"Registrar Salida"</strong></div>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                                        <div>Selecciona el <strong>Motivo de Salida</strong>: Consumo Diario, Merma, Donación, etc.</div>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                                        <div>Busca el producto en el inventario (puedes usar el buscador)</div>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                                        <div>Ingresa la <strong>cantidad utilizada</strong> (el sistema validará que no exceda el stock)</div>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">5</span>
                                        <div>Opcionalmente, agrega una <strong>nota</strong> (ej: "Preparación de almuerzo para 150 personas")</div>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">6</span>
                                        <div>Confirma la salida. El stock se reducirá automáticamente.</div>
                                    </li>
                                </ol>
                            </div>
                        </div>

                        {/* 2.3 Trazabilidad */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <History className="h-5 w-5 text-gray-600" />
                                2.3 Historial y Trazabilidad Completa
                            </h3>
                            <p className="text-sm text-gray-700 mb-4">
                                Cada movimiento de inventario queda registrado permanentemente. Esto es crucial para auditorías y control de costos.
                            </p>
                            <div className="bg-white p-4 rounded-lg">
                                <p className="font-semibold text-gray-800 mb-2">Cómo usar el Historial:</p>
                                <ul className="text-sm text-gray-700 space-y-2 ml-4">
                                    <li>• Ve a <strong>"Inventario"</strong> &gt; <strong>"Historial"</strong></li>
                                    <li>• Filtra por: Fecha, Tipo de Movimiento (Entrada/Salida), Usuario, Producto</li>
                                    <li>• Cada registro muestra: Fecha/Hora exacta, Usuario responsable, Cantidad, Costo, Documento asociado</li>
                                    <li>• Exporta el historial a Excel para análisis externos</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECCIÓN 3: RRHH */}
                <section className="space-y-6 pt-8">
                    <h2 className="text-3xl font-bold flex items-center gap-3 border-b-2 border-purple-600 pb-2 text-gray-900">
                        <Users className="h-7 w-7 text-purple-600" />
                        3. Recursos Humanos y Control de Asistencia
                    </h2>

                    <div className="pl-6 space-y-8">
                        {/* 3.1 Gestión de Personal */}
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <UserPlus className="h-6 w-6 text-purple-600" />
                                3.1 Gestión de Personal
                            </h3>

                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                                    <h4 className="font-bold text-purple-900 mb-3">Agregar Empleado Individual</h4>
                                    <ol className="text-sm text-gray-700 space-y-2 list-decimal ml-4">
                                        <li>Ve a <strong>"Asistencia y RRHH"</strong> &gt; <strong>"Gestión de Personal"</strong></li>
                                        <li>Haz clic en <strong>"Agregar Empleado"</strong></li>
                                        <li>Completa el formulario y asegúrate de asignar una <strong>"Contraseña Inicial"</strong> para su acceso.</li>
                                        <li>Completa los datos en las 3 pestañas:
                                            <ul className="ml-4 mt-1 space-y-1 text-xs">
                                                <li>- <strong>Información General:</strong> Nombre, Cédula, RIF, Email, Cargo y <strong>Clave</strong>.</li>
                                                <li>- <strong>Detalles y Dotación:</strong> Tallas, Fecha de Nacimiento, Género.</li>
                                                <li>- <strong>Financiero y Médico:</strong> Datos bancarios, Contacto de emergencia.</li>
                                            </ul>
                                        </li>
                                        <li>Guarda. El sistema creará tanto el expediente como la cuenta de usuario simultáneamente.</li>
                                    </ol>
                                </div>

                                <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200">
                                    <h4 className="font-bold text-indigo-900 mb-3">Importación Masiva (Excel)</h4>
                                    <ol className="text-sm text-gray-700 space-y-2 list-decimal ml-4">
                                        <li>En "Gestión de Personal", haz clic en <strong>"Importar Empleados"</strong></li>
                                        <li>Descarga la plantilla Excel haciendo clic en <strong>"Descargar Plantilla"</strong></li>
                                        <li>Completa la plantilla con los datos de todos tus empleados (hasta 28 columnas disponibles)</li>
                                        <li>Guarda el archivo y súbelo al sistema</li>
                                        <li>El sistema validará los datos y mostrará una vista previa</li>
                                        <li>Confirma la importación. Todos los empleados se crearán simultáneamente.</li>
                                    </ol>
                                    <p className="text-xs text-indigo-700 mt-3 italic">💡 Ideal para migraciones o contrataciones masivas</p>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-6 rounded-xl">
                                <h4 className="font-bold mb-3 flex items-center gap-2">
                                    <QrCode className="h-5 w-5" />
                                    Generación de Carnet Digital
                                </h4>
                                <p className="text-sm mb-3">Cada empleado puede tener su credencial imprimible con código QR.</p>
                                <div className="bg-white/10 p-4 rounded-lg">
                                    <p className="text-xs font-semibold mb-2">CÓMO GENERAR:</p>
                                    <ol className="text-sm space-y-1 list-decimal ml-4">
                                        <li>En la lista de empleados, busca al empleado</li>
                                        <li>Haz clic en el icono de tarjeta 💳 (botón "Ver Carnet")</li>
                                        <li>Se abrirá una vista previa del carnet con: Logo, Foto, Nombre, Cargo, Cédula, RIF y QR</li>
                                        <li>Haz clic en <strong>"Imprimir"</strong> para generar el carnet en tamaño estándar</li>
                                        <li>Imprime, recorta y enmíca para entregar al empleado</li>
                                    </ol>
                                </div>
                            </div>
                        </div>

                        {/* 3.2 Control de Asistencia */}
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <QrCode className="h-6 w-6 text-green-600" />
                                3.2 Control de Asistencia con QR
                            </h3>

                            <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                                <p className="text-gray-700 mb-4">El sistema de asistencia funciona mediante escaneo de códigos QR únicos o registro manual para contingencias.</p>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h5 className="font-bold text-green-900 mb-2">Para el Empleado:</h5>
                                        <ol className="text-sm text-gray-700 space-y-1 list-decimal ml-4">
                                            <li>Al llegar al comedor, presenta tu carnet ante el escáner.</li>
                                            <li>Espera la validación visual: <strong>Verde</strong> para entrada, <strong>Azul</strong> para salida.</li>
                                            <li>El sistema registra automáticamente: Hora exacta, Fecha y Estado.</li>
                                        </ol>
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-green-900 mb-2">Para el Supervisor:</h5>
                                        <ol className="text-sm text-gray-700 space-y-1 list-decimal ml-4">
                                            <li>Abre el módulo <strong>"Escanear QR"</strong>.</li>
                                            <li>Si el QR falla (carnet dañado), presiona <strong>"Registro Manual"</strong>.</li>
                                            <li>Busca al empleado por nombre o cédula y selecciona su acción (Entrada/Salida).</li>
                                            <li>Confirma el registro para que se refleje en el dashboard.</li>
                                        </ol>
                                    </div>
                                </div>

                                <div className="mt-4 bg-white p-4 rounded-lg border border-green-100 italic text-xs text-green-700">
                                    💡 <strong>Nota sobre Seguridad:</strong> Si accedes desde un navegador móvil sin HTTPS, revisa la sección 9 (Solución de Problemas) para habilitar la cámara.
                                </div>
                            </div>
                        </div>

                        {/* 3.3 Gestión de Contratos */}
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <FileText className="h-6 w-6 text-blue-600" />
                                3.3 Gestión de Contratos Automatizada
                            </h3>

                            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                                <p className="text-gray-700 mb-4">Centraliza la creación y administración de documentos legales de tu personal.</p>

                                <div className="space-y-4">
                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                        <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                            <Upload className="h-4 w-4" /> Plantillas y Edición
                                        </h4>
                                        <p className="text-sm text-gray-600 mb-2">Sube tus modelos en HTML para que el sistema detecte automáticamente marcadores como <code className="bg-gray-100 px-1">{"{{nombre}}"}</code> o <code className="bg-gray-100 px-1">{"{{cedula}}"}</code>.</p>
                                        <ul className="text-xs text-gray-500 space-y-1 ml-4">
                                            <li>• <strong>Editar:</strong> Usa el botón de lápiz azul para corregir textos sin subir un archivo nuevo.</li>
                                            <li>• <strong>Tipos:</strong> Clasifica por Determinado, Indeterminado o Prueba.</li>
                                        </ul>
                                    </div>

                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                        <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                            <FileSpreadsheet className="h-4 w-4" /> Generación Masiva
                                        </h4>
                                        <p className="text-sm text-gray-600 mb-2">Selecciona la plantilla, elige al empleado y el sistema creará el contrato personalizado en segundos.</p>
                                        <ul className="text-xs text-gray-500 space-y-1 ml-4">
                                            <li>• <strong>Descarga:</strong> Obtén el archivo HTML listo para imprimir.</li>
                                            <li>• <strong>Control:</strong> Visualiza el historial de contratos generados por sede.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECCIÓN 4: MENÚS */}
                <section className="space-y-6 pt-8">
                    <h2 className="text-3xl font-bold flex items-center gap-3 border-b-2 border-orange-600 pb-2 text-gray-900">
                        <Calendar className="h-7 w-7 text-orange-600" />
                        4. Planificación de Menús
                    </h2>

                    <div className="pl-6 space-y-6">
                        <p className="text-gray-700 leading-relaxed">
                            Planifica los menús semanales y calcula automáticamente los costos e ingredientes necesarios.
                        </p>

                        <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
                            <h4 className="font-bold text-orange-900 mb-4">Crear un Menú Semanal:</h4>
                            <ol className="space-y-3 text-sm text-gray-700">
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                                    <div>Ve a <strong>"Planificación de Menús"</strong> en el menú lateral</div>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                                    <div>Haz clic en <strong>"Nuevo Menú"</strong> y selecciona la semana</div>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                                    <div>Para cada día, define:
                                        <ul className="ml-4 mt-1 space-y-0.5 text-xs">
                                            <li>- Desayuno (opcional)</li>
                                            <li>- Almuerzo (plato principal, acompañamiento, bebida)</li>
                                            <li>- Cena (opcional)</li>
                                        </ul>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                                    <div>El sistema calculará automáticamente:
                                        <ul className="ml-4 mt-1 space-y-0.5 text-xs">
                                            <li>- Ingredientes necesarios</li>
                                            <li>- Costo estimado por porción</li>
                                            <li>- Costo total de la semana</li>
                                            <li>- Alertas si falta algún ingrediente en inventario</li>
                                        </ul>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">5</span>
                                    <div>Guarda y publica el menú para que todo el equipo lo vea</div>
                                </li>
                            </ol>
                        </div>
                    </div>
                </section>

                {/* SECCIÓN 5: REPORTES */}
                <section className="space-y-6 pt-8">
                    <h2 className="text-3xl font-bold flex items-center gap-3 border-b-2 border-red-600 pb-2 text-gray-900">
                        <BarChart3 className="h-7 w-7 text-red-600" />
                        5. Reportes y Análisis
                    </h2>

                    <div className="pl-6 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="border-red-100 border-2">
                                <CardHeader className="bg-red-50">
                                    <CardTitle className="text-md flex items-center gap-2">
                                        <FileSpreadsheet className="h-5 w-5" /> Reportes Disponibles
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 text-sm text-gray-700">
                                    <ul className="space-y-2">
                                        <li>• <strong>Inventario Valorizado:</strong> Stock actual con valores</li>
                                        <li>• <strong>Movimientos:</strong> Entradas y salidas por período</li>
                                        <li>• <strong>Costos por Categoría:</strong> Análisis de gastos</li>
                                        <li>• <strong>Asistencia:</strong> Reportes de RRHH</li>
                                        <li>• <strong>Consumo por Menú:</strong> Ingredientes usados</li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="border-red-100 border-2">
                                <CardHeader className="bg-red-50">
                                    <CardTitle className="text-md flex items-center gap-2">
                                        <Settings className="h-5 w-5" /> Automatización
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 text-sm text-gray-700">
                                    <p className="mb-3">Configura envíos automáticos de reportes:</p>
                                    <ol className="space-y-2 list-decimal ml-4">
                                        <li>Ve a <strong>"Reportes"</strong> &gt; <strong>"Automatización"</strong></li>
                                        <li>Activa el envío semanal</li>
                                        <li>Ingresa tu email</li>
                                        <li>Selecciona qué reportes quieres recibir</li>
                                        <li>Cada viernes a las 5:00 PM recibirás un PDF completo</li>
                                    </ol>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* SECCIÓN 6: CONFIGURACIÓN */}
                <section className="space-y-6 pt-8">
                    <h2 className="text-3xl font-bold flex items-center gap-3 border-b-2 border-gray-600 pb-2 text-gray-900">
                        <Settings className="h-7 w-7 text-gray-600" />
                        6. Configuración del Sistema
                    </h2>

                    <div className="pl-6 space-y-4">
                        <div className="bg-gray-50 p-6 rounded-xl">
                            <h4 className="font-bold text-gray-900 mb-3">Configuraciones Importantes:</h4>
                            <ul className="space-y-3 text-sm text-gray-700">
                                <li>• <strong>Áreas de Trabajo:</strong> Define las áreas de tu comedor (Cocina, Servicio, Limpieza, etc.)</li>
                                <li>• <strong>Proveedores:</strong> Registra tus proveedores habituales para agilizar las compras</li>
                                <li>• <strong>Categorías de Productos:</strong> Organiza tu inventario (Carnes, Víveres, Lácteos, etc.)</li>
                                <li>• <strong>Unidades de Medida:</strong> Kg, Lt, Unidades, Cajas, etc.</li>
                                <li>• <strong>Límites de Stock:</strong> Define mínimos y máximos para alertas automáticas</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* SECCIÓN 7: GESTIÓN DE USUARIOS DEL SISTEMA */}
                <section className="space-y-6 pt-8">
                    <h2 className="text-3xl font-bold flex items-center gap-3 border-b-2 border-slate-700 pb-2 text-gray-900">
                        <Users className="h-7 w-7 text-slate-700" />
                        7. Gestión de Usuarios del Sistema
                    </h2>

                    <div className="pl-6 space-y-6">
                        <p className="text-gray-700 leading-relaxed text-lg">
                            Este módulo es exclusivo para <strong>Superadmins</strong> y permite administrar quiénes pueden entrar al sistema y qué acciones pueden realizar.
                        </p>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                <h4 className="font-bold text-slate-900 mb-3">Roles y Permisos</h4>
                                <ul className="text-sm text-gray-700 space-y-3">
                                    <li>
                                        <Badge className="bg-amber-100 text-amber-700 mr-2">Superadmin</Badge>
                                        Tiene control total. Puede crear, modificar y eliminar cualquier usuario (excepto a sí mismo).
                                    </li>
                                    <li>
                                        <Badge className="bg-purple-100 text-purple-700 mr-2">Admin</Badge>
                                        Tiene acceso solo a los módulos y áreas que el Superadmin le asigne específicamente.
                                    </li>
                                    <li>
                                        <Badge className="bg-gray-100 text-gray-700 mr-2">Común</Badge>
                                        Vista limitada. Solo puede ver su Dashboard, sus Tareas y su área de trabajo asignada.
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                                <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                                    <Trash2 className="h-4 w-4" /> Eliminación de Usuarios
                                </h4>
                                <p className="text-sm text-red-800 mb-3">
                                    Por motivos de seguridad y control, <strong>solo el Superadmin</strong> tiene la facultad de eliminar perfiles del sistema.
                                </p>
                                <div className="bg-white/50 p-3 rounded-md text-xs text-red-700 italic">
                                    ⚠️ Nota: Al eliminar un usuario, este pierde acceso inmediato. Esta acción no se puede deshacer desde la aplicación.
                                </div>
                            </div>
                        </div>

                        <div className="bg-indigo-50 p-6 rounded-xl border-l-4 border-indigo-600">
                            <h4 className="font-bold text-indigo-900 mb-3">Cómo Crear un Nuevo Usuario:</h4>
                            <ol className="text-sm text-gray-700 space-y-2 list-decimal ml-4">
                                <li>Ve al menú lateral &gt; <strong>"Gestión de Usuario"</strong>.</li>
                                <li>Pulsa <strong>"+ Agregar Usuario"</strong>.</li>
                                <li>Ingresa el correo y asigna una <strong>"Contraseña Inicial"</strong> (mínimo 6 caracteres).</li>
                                <li>Define el <strong>Rol</strong> y los <strong>Módulos</strong> a los que tendrá acceso.</li>
                                <li>Guarda los cambios. El acceso es inmediato con esa clave.</li>
                            </ol>
                        </div>
                    </div>
                </section>

                {/* SECCIÓN 8: GESTIÓN DE COMEDORES */}
                <section id="section-8" className="space-y-6 pt-8">
                    <h2 className="text-3xl font-bold flex items-center gap-3 border-b-2 border-cyan-600 pb-2 text-gray-900">
                        <Building2 className="h-7 w-7 text-cyan-600" />
                        8. Gestión de Comedores (Multi-Sede)
                    </h2>

                    <div className="pl-6 space-y-6">
                        <p className="text-gray-700 leading-relaxed text-lg">
                            El módulo de <strong>Gestión de Comedores</strong> permite administrar las diferentes sedes de <strong>Inversora Velcar, C.A.</strong> de forma centralizada. Cada sede funciona como un entorno independiente (Multi-tenant), lo que garantiza la privacidad y el orden operativo.
                        </p>

                        <div className="bg-cyan-50 p-6 rounded-xl border-l-4 border-cyan-600">
                            <h3 className="text-xl font-bold text-cyan-900 mb-3 flex items-center gap-2">
                                <LayoutGrid className="h-5 w-5" /> Selector de Sede y Vista Global
                            </h3>
                            <p className="text-sm text-gray-700 mb-4">
                                Los <strong>SuperAdmins</strong> cuentan con una herramienta de navegación única en la parte superior del sistema:
                            </p>
                            <ul className="text-sm text-gray-800 space-y-2 ml-4">
                                <li className="flex gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-cyan-600 flex-shrink-0" />
                                    <span><strong>Selector de Sede:</strong> Permite filtrar instantáneamente todo el sistema (Inventario, Tareas, Asistencia) para una sede específica.</span>
                                </li>
                                <li className="flex gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-cyan-600 flex-shrink-0" />
                                    <span><strong>Vista Global:</strong> Al seleccionar "Vista Global", el Dashboard principal muestra un resumen de todas las sedes activas, permitiendo comparar el estado general de la empresa.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="font-bold text-gray-900 mb-3">Administración de Sedes</h4>
                                <ol className="text-sm text-gray-700 space-y-2 list-decimal ml-4">
                                    <li>Acceda a <strong>"SuperAdmin"</strong> &gt; <strong>"Comedores"</strong>.</li>
                                    <li>Para crear: Use el botón <strong>"+ Nueva Sede"</strong>.</li>
                                    <li>Campos Clave:
                                        <ul className="ml-4 mt-1 space-y-1 text-xs text-gray-500">
                                            <li>- <strong>Nombre:</strong> Nombre comercial de la sede.</li>
                                            <li>- <strong>Slug:</strong> Identificador único para el sistema (ej: sede-puerto).</li>
                                            <li>- <strong>Ubicación:</strong> Dirección física necesaria para reportes logísticos.</li>
                                        </ul>
                                    </li>
                                    <li>Estado: Puede desactivar una sede temporalmente sin borrar sus datos históricos.</li>
                                </ol>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="font-bold text-gray-900 mb-3">Privacidad Operativa (Aislamiento)</h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    El sistema garantiza que los datos no se mezclen:
                                </p>
                                <div className="space-y-3">
                                    <div className="flex gap-2 text-sm text-gray-700">
                                        <Package className="h-4 w-4 text-blue-500" />
                                        <span><strong>Almacenes:</strong> El stock de carne en la Sede A nunca afectará las alertas de la Sede B.</span>
                                    </div>
                                    <div className="flex gap-2 text-sm text-gray-700">
                                        <Users className="h-4 w-4 text-purple-500" />
                                        <span><strong>Personal:</strong> Los administradores locales solo gestionan el personal de su propio comedor.</span>
                                    </div>
                                    <div className="flex gap-2 text-sm text-gray-700">
                                        <History className="h-4 w-4 text-green-500" />
                                        <span><strong>Auditoría:</strong> Cada entrada y salida de inventario queda marcada con el ID del comedor correspondiente.</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-100 p-6 rounded-xl border border-dashed border-gray-400">
                            <h4 className="font-bold text-gray-800 mb-2">Consejo para el SuperAdmin:</h4>
                            <p className="text-sm text-gray-700 italic">
                                "Utilice la Vista Global cada mañana para detectar qué sedes tienen inventario bajo o tareas retrasadas sin necesidad de entrar a gestionar cada una individualmente."
                            </p>
                        </div>
                    </div>
                </section>

                {/* SECCIÓN 9: SOLUCIÓN DE PROBLEMAS */}
                <section className="space-y-6 pt-8">
                    <h2 className="text-3xl font-bold flex items-center gap-3 border-b-2 border-yellow-600 pb-2 text-gray-900">
                        <AlertCircle className="h-7 w-7 text-yellow-600" />
                        9. Solución de Problemas Comunes
                    </h2>

                    <div className="pl-6 space-y-4">
                        <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                            <h4 className="font-bold text-yellow-900 mb-4">Problemas Frecuentes y Soluciones:</h4>

                            <div className="space-y-4">
                                <div className="bg-white p-4 rounded-lg">
                                    <p className="font-semibold text-gray-800 mb-2">❌ "No puedo escanear la factura"</p>
                                    <ul className="text-sm text-gray-700 space-y-1 ml-4">
                                        <li>✓ Asegúrate de que la imagen esté bien iluminada y enfocada</li>
                                        <li>✓ Usa formatos JPG o PNG (evita PDF si es posible)</li>
                                        <li>✓ Si persiste, usa el método de entrada manual</li>
                                    </ul>
                                </div>

                                <div className="bg-white p-4 rounded-lg">
                                    <p className="font-semibold text-gray-800 mb-2">❌ "El código QR no se escanea o cámara no activa"</p>
                                    <ul className="text-sm text-gray-700 space-y-1 ml-4">
                                        <li>✓ Verifica que el navegador tenga permiso para usar la cámara.</li>
                                        <li>✓ <strong>Si usas Android/Chrome sin HTTPS:</strong> Ingresa a <code className="bg-gray-100 px-1">chrome://flags</code> y busca "Insecure origins treated as secure". Agrega la dirección del servidor (ej: <code className="bg-gray-100 px-1">http://192.168.1.50:3000</code>).</li>
                                        <li>✓ Asegúrate de que el carnet esté limpio y sin reflejos.</li>
                                        <li>✓ Mantén el código QR a 15-20 cm de la cámara.</li>
                                    </ul>
                                </div>

                                <div className="bg-white p-4 rounded-lg">
                                    <p className="font-semibold text-gray-800 mb-2">❌ "Los reportes no se generan"</p>
                                    <ul className="text-sm text-gray-700 space-y-1 ml-4">
                                        <li>✓ Verifica tu conexión a internet</li>
                                        <li>✓ Recarga la página (F5)</li>
                                        <li>✓ Si el problema persiste, contacta al administrador</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECCIÓN 9: MEJORES PRÁCTICAS */}
                <section className="space-y-6 pt-8">
                    <h2 className="text-3xl font-bold flex items-center gap-3 border-b-2 border-green-600 pb-2 text-gray-900">
                        <CheckCircle2 className="h-7 w-7 text-green-600" />
                        9. Mejores Prácticas
                    </h2>

                    <div className="pl-6 space-y-4">
                        <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                            <h4 className="font-bold text-green-900 mb-4">Recomendaciones para Optimizar el Uso:</h4>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h5 className="font-semibold text-green-800 mb-2">📦 Inventario</h5>
                                    <ul className="text-sm text-gray-700 space-y-1 ml-4">
                                        <li>• Registra las compras el mismo día que llegan</li>
                                        <li>• Actualiza las salidas diariamente al final del turno</li>
                                        <li>• Realiza inventarios físicos semanales para validar</li>
                                        <li>• Configura alertas de stock crítico</li>
                                    </ul>
                                </div>

                                <div>
                                    <h5 className="font-semibold text-green-800 mb-2">👥 RRHH</h5>
                                    <ul className="text-sm text-gray-700 space-y-1 ml-4">
                                        <li>• Mantén las fotos de empleados actualizadas</li>
                                        <li>• Revisa la asistencia semanalmente</li>
                                        <li>• Actualiza datos de contacto de emergencia</li>
                                        <li>• Genera carnets para nuevos empleados inmediatamente</li>
                                    </ul>
                                </div>

                                <div>
                                    <h5 className="font-semibold text-green-800 mb-2">📊 Reportes</h5>
                                    <ul className="text-sm text-gray-700 space-y-1 ml-4">
                                        <li>• Activa el envío automático de reportes semanales</li>
                                        <li>• Revisa los costos mensualmente</li>
                                        <li>• Compara períodos para identificar tendencias</li>
                                        <li>• Exporta datos importantes para respaldo</li>
                                    </ul>
                                </div>

                                <div>
                                    <h5 className="font-semibold text-green-800 mb-2">🍽️ Menús</h5>
                                    <ul className="text-sm text-gray-700 space-y-1 ml-4">
                                        <li>• Planifica con 2 semanas de anticipación</li>
                                        <li>• Verifica disponibilidad de ingredientes antes de publicar</li>
                                        <li>• Considera la estacionalidad de productos</li>
                                        <li>• Balancea costos entre días de la semana</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECCIÓN 12: IMPORTACIÓN MASIVA */}
                <section id="section-12" className="space-y-6 pt-8">
                    <h2 className="text-3xl font-bold flex items-center gap-3 border-b-2 border-emerald-600 pb-2 text-gray-900">
                        <FileSpreadsheet className="h-7 w-7 text-emerald-600" />
                        12. Importación Masiva de Datos (Excel)
                    </h2>

                    <div className="pl-6 space-y-8">
                        <p className="text-gray-700 leading-relaxed text-lg">
                            Para facilitar la carga de grandes volúmenes de información, el sistema permite la importación mediante archivos de Excel (.xlsx). Es <strong>crítico</strong> seguir el formato exacto para asegurar el éxito del proceso.
                        </p>

                        <div className="grid md:grid-cols-1 gap-6">
                            <Card className="border-emerald-100 border-2">
                                <CardHeader className="bg-emerald-50">
                                    <CardTitle className="text-lg flex items-center gap-2 text-emerald-900">
                                        <Calendar className="h-5 w-5" /> 12.1 Formato de Menús (Planificación Semanal)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    <p className="text-sm text-gray-700">
                                        Este es el formato más detallado. La regla principal es: <strong>Una fila por cada ingrediente</strong>. Si un plato tiene 5 ingredientes, aparecerá en 5 filas, repitiendo la fecha y nombre del plato.
                                    </p>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-100">
                                                    <th className="p-2 border">Columna</th>
                                                    <th className="p-2 border">Descripción</th>
                                                    <th className="p-2 border">Ejemplo / Valores</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr><td className="p-2 border font-mono font-bold text-blue-700">date</td><td className="p-2 border text-gray-600">Fecha del menú</td><td className="p-2 border italic text-gray-500">2024-08-01</td></tr>
                                                <tr><td className="p-2 border font-mono font-bold text-blue-700">pax</td><td className="p-2 border text-gray-600">N° de comensales</td><td className="p-2 border italic text-gray-500">150</td></tr>
                                                <tr><td className="p-2 border font-mono font-bold text-blue-700">time</td><td className="p-2 border text-gray-600">Tipo de servicio</td><td className="p-2 border italic text-gray-500 text-emerald-600">almuerzo, cena, desayuno...</td></tr>
                                                <tr><td className="p-2 border font-mono font-bold text-blue-700">itemName</td><td className="p-2 border text-gray-600">Nombre del plato</td><td className="p-2 border italic text-gray-500">Pollo al Horno</td></tr>
                                                <tr><td className="p-2 border font-mono font-bold text-blue-700">itemCategory</td><td className="p-2 border text-gray-600">Tipo de plato</td><td className="p-2 border italic text-gray-500 text-emerald-600">proteico, acompanante1, entrada...</td></tr>
                                                <tr><td className="p-2 border font-mono font-bold text-blue-700">ingredientName</td><td className="p-2 border text-gray-600">Ingrediente</td><td className="p-2 border italic text-gray-500">Pechuga de Pollo</td></tr>
                                                <tr><td className="p-2 border font-mono font-bold text-blue-700">ingredientQuantity</td><td className="p-2 border text-gray-600">Cant. neta por PAX</td><td className="p-2 border italic text-gray-500">0.25 (para 250g)</td></tr>
                                                <tr><td className="p-2 border font-mono font-bold text-blue-700">ingredientWasteFactor</td><td className="p-2 border text-gray-600">Factor desperdicio</td><td className="p-2 border italic text-gray-500">0.05 (para 5%)</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid md:grid-cols-2 gap-6">
                                <Card className="border-blue-100 border-2">
                                    <CardHeader className="bg-blue-50">
                                        <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
                                            <Package className="h-5 w-5" /> 12.2 Formato de Inventario
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-4 text-xs space-y-2">
                                        <p className="text-gray-700">Columnas obligatorias estrictas:</p>
                                        <ul className="space-y-1 ml-4 list-disc text-gray-600">
                                            <li><strong>codigo:</strong> ID único (ej: INV-001)</li>
                                            <li><strong>nombre:</strong> Descripción del producto</li>
                                            <li><strong>categoriaId:</strong> carnes, viveres, verduras, etc.</li>
                                            <li><strong>cantidad:</strong> Stock inicial numérico</li>
                                            <li><strong>unidadReceta:</strong> kg, lt, unidad, etc.</li>
                                            <li><strong>stockMinimo:</strong> Para alertas de reposición</li>
                                        </ul>
                                    </CardContent>
                                </Card>

                                <Card className="border-purple-100 border-2">
                                    <CardHeader className="bg-purple-50">
                                        <CardTitle className="text-lg flex items-center gap-2 text-purple-900">
                                            <Users className="h-5 w-5" /> 12.3 Formato de Empleados
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-4 text-xs space-y-2">
                                        <p className="text-gray-700">Datos esenciales para el expediente:</p>
                                        <ul className="space-y-1 ml-4 list-disc text-gray-600">
                                            <li><strong>name, cedula, email:</strong> Datos de identidad</li>
                                            <li><strong>role:</strong> comun, admin o superadmin</li>
                                            <li><strong>area:</strong> cocina, servicio, limpieza, etc.</li>
                                            <li><strong>workerType:</strong> obrero o empleado</li>
                                            <li><strong>Datos bancarios:</strong> Para nómina y pagos</li>
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        <div className="bg-amber-50 p-6 rounded-xl border-l-4 border-amber-500">
                            <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                                <AlertCircle className="h-5 w-5" /> Consejos para el Éxito en la Importación
                            </h4>
                            <ul className="text-sm text-amber-800 space-y-2 ml-4">
                                <li>• <strong>Usa las Plantillas:</strong> Descarga siempre el archivo de ejemplo desde el botón "Descargar Plantilla" en la ventana de importación.</li>
                                <li>• <strong>Formatos de Celda:</strong> Asegúrate de que las columnas de números sean de tipo "Número" y las fechas sean "Fecha" en Excel.</li>
                                <li>• <strong>Encabezados:</strong> No cambies los nombres de los encabezados (la primera fila), el sistema no los reconocerá si cambian.</li>
                                <li>• <strong>Una Hoja:</strong> El sistema procesará siempre la primera pestaña del archivo de Excel.</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* SECCIÓN 12: FAQ */}

                <section className="space-y-6 pt-8">
                    <h2 className="text-3xl font-bold flex items-center gap-3 border-b-2 border-blue-600 pb-2 text-gray-900">
                        <HelpCircle className="h-7 w-7 text-blue-600" />
                        11. Preguntas Frecuentes
                    </h2>

                    <div className="pl-6 space-y-4">
                        <div className="space-y-4">
                            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
                                <p className="font-semibold text-blue-900 mb-2">❓ ¿Puedo usar el sistema desde mi teléfono?</p>
                                <p className="text-sm text-gray-700">Sí, el sistema es completamente responsive. Puedes acceder desde cualquier dispositivo con navegador web.</p>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
                                <p className="font-semibold text-blue-900 mb-2">❓ ¿Los datos están seguros?</p>
                                <p className="text-sm text-gray-700">Sí, toda la información se almacena en Firebase con encriptación y respaldos automáticos diarios.</p>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
                                <p className="font-semibold text-blue-900 mb-2">❓ ¿Puedo personalizar el logo del carnet?</p>
                                <p className="text-sm text-gray-700">Sí, solo necesitas reemplazar el archivo <code className="bg-white px-2 py-0.5 rounded text-xs">/public/logo-carnet.png</code> con el logo de tu empresa.</p>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
                                <p className="font-semibold text-blue-900 mb-2">❓ ¿Cuántos usuarios pueden usar el sistema simultáneamente?</p>
                                <p className="text-sm text-gray-700">El sistema soporta usuarios ilimitados. Todos los cambios se sincronizan en tiempo real.</p>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
                                <p className="font-semibold text-blue-900 mb-2">❓ ¿Qué hago si olvido mi contraseña?</p>
                                <p className="text-sm text-gray-700">Contacta al administrador del sistema. Solo los superadmins pueden restablecer contraseñas por seguridad.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="mt-20 pt-10 border-t-4 border-double border-gray-200 text-center">
                    <div className="flex justify-center mb-4">
                        <HelpCircle className="h-10 w-10 text-gray-300" />
                    </div>
                    <p className="text-gray-500 max-w-2xl mx-auto italic leading-relaxed">
                        "Este sistema ha sido diseñado para optimizar cada aspecto de la gestión de tu comedor.
                        Desde el control de inventario hasta la administración de personal, cada módulo trabaja en conjunto
                        para ahorrarte tiempo y reducir costos. Si tienes dudas adicionales o sugerencias de mejora,
                        no dudes en contactar al equipo de soporte."
                    </p>
                    <div className="mt-8 space-y-2">
                        <p className="text-sm text-gray-600 font-semibold">Soporte Técnico</p>
                        <p className="text-sm text-gray-500">Email: arvecladu@gmail.com</p>
                        <div className="mt-8 space-y-1">
                            <p className="text-sm text-gray-600 font-bold tracking-tight">© 2026 Luis E. Albarrán B.</p>
                            <p className="text-xs text-gray-500">Todos los derechos reservados.</p>
                            <p className="text-xs text-gray-400 font-medium italic mt-2">
                                Desarrollado para <span className="text-blue-600 not-italic font-bold">Inversora Velcar, C.A.</span>
                            </p>
                        </div>
                    </div>
                </footer>
            </div>

            <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          #printable-manual {
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
          }
          section {
            page-break-inside: avoid;
          }
          h2 {
            margin-top: 2rem !important;
            page-break-after: avoid;
          }
          h3, h4 {
            page-break-after: avoid;
          }
        }
      `}</style>
        </div>
    );
}
