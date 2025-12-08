import EmployeeDetailsPage from '@/components/attendance/employees/expedite/personal/EmployeeDetailsPage';
import React from 'react';

// 1. Definir la interfaz de props que nuestro componente de UI espera
interface EmployeeDetailsProps {
    employeeId?: string | null; // Usamos '?' para hacerlo opcional, ya que también se usa en la ruta de listado
}

// 2. Crear un componente con el tipo definido (Casting)
// NOTA: Esta es una solución de TypeScript para que el compilador acepte el JSX.
const TypedEmployeeDetailsPage = EmployeeDetailsPage as React.FC<EmployeeDetailsProps>;

/**
 * Componente que maneja la ruta dinámica para el expediente de un empleado específico.
 * Se utiliza para la URL /attendance/personal/[ID].
 */
export default function EmployeeDetailPage({ params }: { params: { employeeId: string } }) {
  
  const employeeId = params.employeeId; 

  return (
    <div className="flex flex-1 flex-col p-4 md:p-8">
      {/* 3. Renderiza el componente usando el tipo definido y pasa el ID capturado */}
      <TypedEmployeeDetailsPage employeeId={employeeId} /> 
    </div>
  );
}