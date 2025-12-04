
'use client';

import { 
  Users,
  Building,
  Shield,
  CheckCircle,
  Plus
} from 'lucide-react';

export default function UsersManagementPage() {
  
  return (
    <div className="p-4 md:p-6">
       <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-6 mb-8 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">¡Módulo de Usuarios Activado!</h1>
              <p className="opacity-90">
                El módulo de "Gestión de Usuarios" está ahora visible en el menú.
              </p>
            </div>
          </div>
        </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600">
            Administra los usuarios, roles y permisos del sistema.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nuevo Usuario
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500">Total Usuarios</p>
                    <p className="text-2xl font-bold">8</p>
                </div>
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                </div>
            </div>
        </div>
        <div className="bg-white border rounded-lg p-5 shadow-sm">
             <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500">Activos</p>
                    <p className="text-2xl font-bold text-green-600">8</p>
                </div>
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
            </div>
        </div>
        <div className="bg-white border rounded-lg p-5 shadow-sm">
             <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500">Admins</p>
                    <p className="text-2xl font-bold text-purple-600">3</p>
                </div>
                <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Shield className="h-5 w-5 text-purple-600" />
                </div>
            </div>
        </div>
        <div className="bg-white border rounded-lg p-5 shadow-sm">
             <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500">Áreas</p>
                    <p className="text-2xl font-bold text-orange-600">8</p>
                </div>
                <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Building className="h-5 w-5 text-orange-600" />
                </div>
            </div>
        </div>
      </div>
      
       <div className="bg-white border rounded-xl shadow-sm">
          <div className="p-6 border-b">
            <h3 className="font-semibold text-lg">Lista de Usuarios</h3>
            <p className="text-gray-500 text-sm">Este es un ejemplo de cómo se verán los usuarios. El siguiente paso es conectar esto a Firebase.</p>
          </div>
           <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-700">Nombre</th>
                  <th className="text-left p-4 font-medium text-gray-700">Rol</th>
                  <th className="text-left p-4 font-medium text-gray-700">Área</th>
                  <th className="text-left p-4 font-medium text-gray-700">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="p-4">Super Admin</td>
                  <td className="p-4">Superadmin</td>
                  <td className="p-4">Administración</td>
                  <td className="p-4 text-green-600">Activo</td>
                </tr>
                 <tr>
                  <td className="p-4">Erika Esquivel</td>
                  <td className="p-4">Admin</td>
                  <td className="p-4">Cocina</td>
                  <td className="p-4 text-green-600">Activo</td>
                </tr>
              </tbody>
            </table>
          </div>
       </div>
    </div>
  );
}

