'use client';

import EmployeeDetailsPage from '@/components/attendance/employees/expedite/personal/EmployeeDetailsPage';

export default function EmployeeListPage() {
  return (
    <div className="flex flex-1 flex-col p-4 md:p-8">
      {/* Este componente muestra la lista de empleados cuando no recibe un ID */}
      <EmployeeDetailsPage />
    </div>
  );
}
