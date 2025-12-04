// src/app/users/page.tsx
export default function UsersPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Gestión de Usuarios</h1>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-green-800 mb-2">✅ ¡Módulo funcionando!</h2>
        <p className="text-green-700">
          El menú "Gestión de Usuarios" ahora está visible y accesible.
          Esta es la página principal donde podrás gestionar usuarios.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-2">Usuarios Totales</h3>
          <p className="text-3xl font-bold text-blue-600">5</p>
          <p className="text-gray-500 text-sm">Usuarios registrados</p>
        </div>
        
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-2">Activos</h3>
          <p className="text-3xl font-bold text-green-600">4</p>
          <p className="text-gray-500 text-sm">Usuarios activos</p>
        </div>
        
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-2">Roles</h3>
          <p className="text-3xl font-bold text-purple-600">3</p>
          <p className="text-gray-500 text-sm">Diferentes roles</p>
        </div>
      </div>
    </div>
  );
}
