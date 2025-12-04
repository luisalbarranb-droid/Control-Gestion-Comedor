export default function UsersManagementPage() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            👑 Gestión de Usuarios
          </h1>
          <p className="text-gray-600">
            Administra los usuarios, roles y permisos del sistema
          </p>
        </div>
        
        {/* Banner de éxito */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-100 border border-green-200 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-green-800 mb-1">
                ¡Módulo Activado Correctamente!
              </h2>
              <p className="text-green-700">
                El módulo de "Gestión de Usuarios" está ahora disponible en el menú lateral.
                Puedes comenzar a administrar los usuarios del sistema.
              </p>
            </div>
          </div>
        </div>

        {/* Funcionalidades principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Ver Usuarios</h3>
            <p className="text-gray-600 text-sm">
              Lista completa de todos los usuarios registrados con filtros por rol y estado.
            </p>
          </div>
          
          <div className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">➕</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Crear Usuarios</h3>
            <p className="text-gray-600 text-sm">
              Agrega nuevos usuarios asignando nombre, email, contraseña, rol y área.
            </p>
          </div>
          
          <div className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">✏️</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Editar Usuarios</h3>
            <p className="text-gray-600 text-sm">
              Modifica información de usuarios existentes y actualiza sus permisos.
            </p>
          </div>
          
          <div className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">⚙️</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Gestionar Estado</h3>
            <p className="text-gray-600 text-sm">
              Activa o desactiva usuarios temporalmente sin eliminarlos del sistema.
            </p>
          </div>
        </div>

        {/* Datos de ejemplo */}
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="font-semibold text-lg">Ejemplo de Datos de Usuarios</h3>
            <p className="text-gray-500 text-sm">
              Esta tabla muestra cómo se verán los usuarios cuando el módulo esté completamente funcional.
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-700">Usuario</th>
                  <th className="text-left p-4 font-medium text-gray-700">Email</th>
                  <th className="text-left p-4 font-medium text-gray-700">Rol</th>
                  <th className="text-left p-4 font-medium text-gray-700">Área</th>
                  <th className="text-left p-4 font-medium text-gray-700">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {/* Super Admin */}
                <tr className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="font-bold text-purple-600">SA</span>
                      </div>
                      <div>
                        <p className="font-medium">Super Administrador</p>
                        <p className="text-sm text-gray-500">Acceso total</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">admin@comedor.com</td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
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
                
                {/* Chef */}
                <tr className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="font-bold text-orange-600">JM</span>
                      </div>
                      <div>
                        <p className="font-medium">José Martínez</p>
                        <p className="text-sm text-gray-500">Chef Principal</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">jose.martinez@comedor.com</td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
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
                
                {/* Mesero */}
                <tr className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="font-bold text-yellow-600">AR</span>
                      </div>
                      <div>
                        <p className="font-medium">Ana Rodríguez</p>
                        <p className="text-sm text-gray-500">Mesero Senior</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">ana.rodriguez@comedor.com</td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      Mesero
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">Servicio</td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      Activo
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="p-6 border-t bg-gray-50">
            <div className="flex justify-between items-center">
              <p className="text-gray-600">
                Mostrando <strong>3</strong> de <strong>42</strong> usuarios
              </p>
              <button className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                + Agregar Nuevo Usuario
              </button>
            </div>
          </div>
        </div>
        
        {/* Nota técnica */}
        <div className="mt-8 p-5 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600">💡</span>
            </div>
            <div>
              <h4 className="font-bold text-blue-800 mb-2">Estado del Módulo</h4>
              <p className="text-blue-700">
                <strong>Frontend:</strong> ✅ Completado - La interfaz está lista y visible en el menú.<br/>
                <strong>Backend:</strong> ⏳ Pendiente - Conectar con Firebase para datos reales.<br/>
                <strong>Permisos:</strong> 🔧 Configurable - Los filtros por rol se activarán cuando el backend esté listo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}