import React, { useState, useEffect } from 'react';
// La importación de 'next/link' se ha eliminado para resolver el error de compilación.
// En su lugar, usamos etiquetas de ancla <a> simples para la navegación.

// --- Datos de Ejemplo Simulados para el Reporte ---
const reportSummary = {
  totalAttendance: 120, // Suma de asistencias en el periodo
  totalLate: 15,        // Suma de retardos
  totalAbsences: 8,     // Suma de ausencias
  dateRange: 'Dic 01, 2025 - Dic 31, 2025',
};

// Historial detallado de asistencias (registros de entrada/salida)
const attendanceHistory = [
  { id: 'h1', employee: 'Ana Torres', date: 'Dic 05, 2025', timeIn: '08:00 AM', timeOut: '05:00 PM', status: 'Presente' },
  { id: 'h2', employee: 'Luis García', date: 'Dic 05, 2025', timeIn: '09:15 AM', timeOut: '06:00 PM', status: 'Tarde' },
  { id: 'h3', employee: 'Marta Pérez', date: 'Dic 05, 2025', timeIn: '08:45 AM', timeOut: '05:45 PM', status: 'Presente' },
  { id: 'h4', employee: 'Javier Ruiz', date: 'Dic 04, 2025', timeIn: null, timeOut: null, status: 'Ausente' },
  { id: 'h5', employee: 'Ana Torres', date: 'Dic 04, 2025', timeIn: '07:55 AM', timeOut: '05:05 PM', status: 'Presente' },
];

// --- Componente de Tarjeta de Métrica (KPI) ---
const MetricCard = ({ title, value, color, icon }) => (
  <div className="flex-1 bg-white p-6 rounded-xl shadow-md border-t-4" style={{ borderColor: color }}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className={`text-4xl font-bold mt-1 text-${color}-700`}>{value}</p>
      </div>
      <div className={`p-2 rounded-full bg-${color}-100 text-${color}-600`}>
        {icon}
      </div>
    </div>
  </div>
);

// --- Componente Principal ---
const EmployeeAttendanceList = () => {
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulación de carga de datos del reporte
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setSummary(reportSummary);
      setHistory(attendanceHistory);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center text-lg text-blue-600">
          Cargando datos del Reporte...
          <div className="mt-4 animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Encabezado del Reporte */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-gray-900 transition-colors">
              <span className="text-xl">←</span> Volver a Asistencia
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Reportes de Asistencia
              </h1>
              <p className="text-sm text-gray-500">
                Análisis de puntualidad y ausencias.
              </p>
            </div>
          </div>
          <span className="text-sm text-gray-500 p-2 border rounded-lg bg-white shadow-sm">
            {summary.dateRange}
          </span>
        </div>

        {/* Tarjetas de Métricas (KPIs) */}
        <div className="flex flex-col md:flex-row gap-6">
          <MetricCard
            title="Total Asistencias"
            value={summary.totalAttendance}
            color="green"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
          />
          <MetricCard
            title="Total Retardos"
            value={summary.totalLate}
            color="yellow"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
          />
          <MetricCard
            title="Total Ausencias"
            value={summary.totalAbsences}
            color="red"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>}
          />
        </div>

        {/* Historial Detallado */}
        <div className="bg-white shadow-xl rounded-xl p-6 md:p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Historial de Asistencia
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Detalle de todos los registros de asistencia.
          </p>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empleado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hora Entrada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hora Salida
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  {/* NUEVA COLUMNA para acceder al expediente personal */}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.employee}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.timeIn || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.timeOut || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.status === 'Presente'
                            ? 'bg-green-100 text-green-800'
                            : record.status === 'Tarde'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    {/* Botón de NAVEGACIÓN REAL (Ahora usando <a>) */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a 
                            href={`/attendance/employees/expedite/personal/${record.id}`} 
                            className="text-indigo-600 hover:text-indigo-900 font-semibold transition-colors bg-indigo-50 px-3 py-1 rounded-lg hover:bg-indigo-100"
                        >
                            Ver Expediente
                        </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EmployeeAttendanceList;