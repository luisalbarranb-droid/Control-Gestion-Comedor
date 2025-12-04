
export default function UsersPage() {
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Banner de éxito */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-6 mb-8 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">¡Gestión de Usuarios Activada!</h1>
              <p className="opacity-90">
                El módulo de Gestión de Usuarios está ahora disponible en el menú.
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6 text-gray-800">Gestión de Usuarios</h2>
        
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border rounded-lg p-5 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Total Usuarios</div>
            <div className="text-3xl font-bold text-blue-600">42</div>
          </div>
          <div className="bg-white border rounded-lg p-5 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Activos Hoy</div>
            <div className="text-3xl font-bold text-green-600">38</div>
          </div>
          <div className="bg-white border rounded-lg p-5 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Administradores</div>
            <div className="text-3xl font-bold text-purple-600">5</div>
          </div>
          <div className="bg-white border rounded-lg p-5 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Nuevos (7d)</div>
            <div className="text-3xl font-bold text-orange-600">3</div>
          </div>
        </div>

        {/* Tabla de ejemplo */}
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="font-semibold text-lg">Lista de Usuarios</h3>
            <p className="text-gray-500 text-sm">Usuarios registrados en el sistema</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-700">Nombre</th>
                  <th className="text-left p-4 font-medium text-gray-700">Rol</th>
                  <th className="text-left p-4 font-medium text-gray-700">Departamento</th>
                  <th className="text-left p-4 font-medium text-gray-700">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="font-medium text-blue-600">CR</span>
                      </div>
                      <span>Carlos Ruiz</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                      Super Admin
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">Administración</td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      Activo
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="font-medium text-green-600">MF</span>
                      </div>
                      <span>María Fernández</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                      Admin
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">Recursos Humanos</td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      Activo
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="font-medium text-orange-600">JM</span>
                      </div>
                      <span>José Martínez</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                      Chef
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">Cocina</td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      Activo
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t text-center">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              + Agregar Nuevo Usuario
            </button>
          </div>
        </div>

        {/* Nota importante */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-blue-600 text-xl">💡</span>
            <div>
              <p className="font-medium text-blue-800">Próximos pasos</p>
              <p className="text-blue-700 text-sm">
                Este módulo mostrará la lista real de usuarios cuando se conecte a la base de datos.
                Por ahora, está mostrando datos de ejemplo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
