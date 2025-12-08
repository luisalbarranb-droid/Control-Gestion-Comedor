// Este archivo mapea la URL simplificada: /attendance/personal
import EmployeeDetailsPage from '@/components/attendance/employees/expedite/personal/EmployeeDetailsPage';

/**
 * Muestra el listado de empleados para la gestión de expedientes.
 */
export default function ExpeditePersonalPage() {
  return (
    <div className="flex flex-1 flex-col p-4 md:p-8">
      {/* El componente de UI se carga sin el prop 'employeeId', por lo que muestra la lista de selección. */}
      <EmployeeDetailsPage />
    </div>
  );
}

