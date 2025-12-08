'use client'; // CRÍTICO: Permite usar Hooks (useState, useEffect)

import React, { useState, useEffect } from 'react';
// La simulación de navegación es estable, ya que el router de Next.js no es accesible en este entorno.

// --- Datos de Expediente Simulados ---
const employeesData = {
  'h1': {
    id: 'h1',
    name: 'Ana Torres',
    photoUrl: 'https://placehold.co/100x100/1D4ED8/ffffff?text=AT',
    employeeId: 'EMP-001',
    position: 'Desarrolladora Senior',
    department: 'Tecnología',
    hireDate: '2022-08-15',
    salary: '$55,000 MXN',
    status: 'Activo',
    contractType: 'Tiempo Completo',
    personal: {
      email: 'ana.torres@empresa.com',
      phone: '+52 55 1234 5678',
      address: 'Calle Falsa 123, Colonia Roma, CDMX',
      birthDate: '1990-05-20',
      nationality: 'Mexicana',
    },
    historySummary: [
      { date: '2024-12-01', event: 'Evaluación de desempeño anual', details: 'Resultado: Sobresaliente' },
      { date: '2023-09-01', event: 'Aumento salarial', details: '+10% por mérito' },
    ],
  },
  'h2': {
    id: 'h2',
    name: 'Javier Ruiz',
    photoUrl: 'https://placehold.co/100x100/3B82F6/ffffff?text=JR',
    employeeId: 'EMP-002',
    position: 'Analista de Datos',
    department: 'Inteligencia de Negocio',
    hireDate: '2023-01-10',
    salary: '$40,000 MXN',
    status: 'Activo',
    contractType: 'Tiempo Completo',
    personal: {
      email: 'javier.ruiz@empresa.com',
      phone: '+52 55 9876 5432',
      address: 'Avenida Siempre Viva 742, CDMX',
      birthDate: '1995-11-03',
      nationality: 'Mexicana',
    },
    historySummary: [
      { date: '2024-03-15', event: 'Curso de Python Avanzado', details: 'Finalizado con 95%' },
    ],
  },
};

// Componente auxiliar para mostrar detalles en formato limpio
const DetailItem = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100">
    <span className="text-sm font-medium text-gray-500">{label}</span>
    <span className="text-sm text-gray-800 font-semibold">{value}</span>
  </div>
);

// --- Componente de Tarjeta de Empleado (para la vista de lista) ---
const EmployeeCard = ({ employee, onSelect }) => (
    <div className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition duration-200">
        <div className="flex items-center space-x-3">
            <img 
                className="w-12 h-12 rounded-full object-cover" 
                src={employee.photoUrl} 
                alt={`Foto de ${employee.name}`}
            />
            <div>
                <p className="text-base font-semibold text-gray-900">{employee.name}</p>
                <p className="text-sm text-gray-500">{employee.position}</p>
            </div>
        </div>
        <button 
            onClick={() => onSelect(employee.id)}
            className="px-3 py-1 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
        >
            Ver Expediente
        </button>
    </div>
);


// --- Componente Principal (Recibe el ID de la URL como prop) ---
// La corrección aquí asegura que el prop sea tratado como opcional.
const EmployeeDetailsPage = ({ employeeId: propEmployeeId }) => { 
  
  // Usamos un estado interno para gestionar la navegación simulada desde la vista de lista.
  // CRÍTICO: Aseguramos que currentEmployeeId se inicialice a null si propEmployeeId es undefined o null
  const [currentEmployeeId, setCurrentEmployeeId] = useState(propEmployeeId || null); 
  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Usamos el ID del prop si existe, si no, es el ID seleccionado internamente
  const idToUse = propEmployeeId || currentEmployeeId; 

  // Usamos useEffect para reaccionar al cambio del ID.
  useEffect(() => {
    // Si no hay ID o el ID no es válido (ej: se borra de la URL), detenemos la carga.
    if (!idToUse || !employeesData[idToUse]) {
        setIsLoading(false);
        setEmployee(null);
        return;
    }

    setIsLoading(true);
    
    // Simulación de carga (reemplazar con fetch o Firestore en prod)
    const timer = setTimeout(() => {
      setEmployee(employeesData[idToUse]);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [idToUse]); 

  // --- Manejadores de Navegación SIMULADA ---
  const handleSelectEmployee = (id) => {
    // Al hacer clic en la lista, simulamos que navegamos, lo que dispara el useEffect
    setCurrentEmployeeId(id);
  };

  const handleBackToList = () => {
    // Vuelve a la vista de lista general, simulando que volvemos a la URL sin ID
    setCurrentEmployeeId(null);
    setEmployee(null);
  };

  // --- Lógica de Renderizado ---

  if (isLoading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center text-lg text-indigo-600">
          Cargando Expediente Personal...
          <div className="mt-4 animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Si no se encuentra el empleado, pero tenemos un ID, es un 404 simulado
  if (!employee && idToUse) {
     return (
      <div className="p-8 bg-gray-50 min-h-screen text-center pt-20">
        <h1 className="text-3xl text-red-600">Empleado No Encontrado (404)</h1>
        <p className="text-gray-500 mt-2">No se pudo cargar la información para el ID: {idToUse}</p>
        <button 
            onClick={handleBackToList}
            className="mt-6 text-indigo-600 hover:text-indigo-800 transition-colors flex items-center text-sm font-medium mx-auto"
        >
            <span className="mr-1">←</span> Volver al Listado
        </button>
      </div>
    );
  }


  // Vista de Expediente Detallado (Si hay un empleado seleccionado)
  if (employee) {
    return (
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-xl p-6 md:p-8">
          
          {/* Cabecera y Botón de Regreso */}
          <div className="flex items-center justify-between border-b pb-4 mb-6">
              <h1 className="text-3xl font-extrabold text-gray-900">
                  Expediente Personal
              </h1>
              {/* Botón de regreso a la lista de expedientes */}
              <button 
                  onClick={handleBackToList}
                  className="text-indigo-600 hover:text-indigo-800 transition-colors flex items-center text-sm font-medium"
              >
                  <span className="mr-1">←</span> Volver al Listado
              </button>
          </div>

          {/* Sección de Resumen y Datos Principales */}
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 p-4 bg-indigo-50 rounded-lg mb-8">
              <img 
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" 
                  src={employee.photoUrl} 
                  alt={`Foto de ${employee.name}`}
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100/94A3B8/ffffff?text=SIN+FOTO" }}
              />
              <div className="text-center md:text-left">
                  <h2 className="text-3xl font-bold text-indigo-800">{employee.name}</h2>
                  <p className="text-lg text-indigo-600 font-semibold">{employee.position}</p>
                  <p className="text-sm text-indigo-500 mt-1">ID: {employee.employeeId} | {employee.department}</p>
              </div>
          </div>
          
          {/* Contenido en dos columnas para desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Columna 1: Información Laboral */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                      <span role="img" aria-label="briefcase" className="mr-2">💼</span> Datos de Empleo
                  </h3>
                  <div className="space-y-1">
                      <DetailItem label="ID de Empleado" value={employee.employeeId} />
                      <DetailItem label="Departamento" value={employee.department} />
                      <DetailItem label="Fecha de Contratación" value={employee.hireDate} />
                      <DetailItem label="Salario Base (Mensual)" value={employee.salary} />
                      <DetailItem label="Tipo de Contrato" value={employee.contractType} />
                      <DetailItem label="Estado Actual" value={employee.status} />
                  </div>
              </div>

              {/* Columna 2: Información Personal */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                      <span role="img" aria-label="person" className="mr-2">👤</span> Datos Personales
                  </h3>
                  <div className="space-y-1">
                      <DetailItem label="Correo Electrónico" value={employee.personal.email} />
                      <DetailItem label="Teléfono" value={employee.personal.phone} />
                      <DetailItem label="Fecha de Nacimiento" value={employee.personal.birthDate} />
                      <DetailItem label="Nacionalidad" value={employee.personal.nationality} />
                      <DetailItem label="Dirección" value={employee.personal.address} />
                  </div>
              </div>
          </div>

          {/* Sección de Historial/Notas (Opcional) */}
          <div className="mt-8 bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                  <span role="img" aria-label="scroll" className="mr-2">📜</span> Resumen Histórico
              </h3>
              <ul className="divide-y divide-gray-100">
                  {employee.historySummary.map((item, index) => (
                      <li key={index} className="py-3">
                          <p className="text-sm font-semibold text-gray-700">
                              {item.event} - <span className="text-xs font-normal text-gray-500">{item.date}</span>
                          </p>
                          <p className="text-sm text-gray-600 mt-1 pl-4 border-l-2 border-indigo-200">{item.details}</p>
                      </li>
                  ))}
              </ul>
          </div>

        </div>
      </div>
    );
  }

  // Vista de Lista de Empleados (Si no hay ID en la URL / si se accede directamente desde un menú)
  const employeeList = Object.values(employeesData);

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-extrabold text-gray-900 border-b pb-3">
                Gestión de Expedientes de Personal
            </h1>
            <p className="text-gray-500">Selecciona un empleado para ver su expediente completo.</p>
            
            <div className="space-y-4 mt-6">
                {employeeList.map((emp) => (
                    <EmployeeCard 
                        key={emp.id} 
                        employee={emp} 
                        onSelect={handleSelectEmployee} // Usa la simulación de estado interna
                    />
                ))}
            </div>

            {/* Mensaje de advertencia actualizado */}
             <div className="p-4 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg text-sm mt-8">
                <p className="font-bold">✅ Estado Actual de la Ruta (SIMULACIÓN):</p>
                <p>Las rutas están configuradas correctamente en Next.js. La navegación (al hacer clic en "Ver Expediente" o "Volver") ahora está controlada por el estado interno del componente, ya que el router de Next.js no estaba disponible.</p>
            </div>
        </div>
    </div>
  );
};

export default EmployeeDetailsPage;