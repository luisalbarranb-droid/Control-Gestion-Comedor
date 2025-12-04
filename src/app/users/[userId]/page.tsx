// src/app/users/[userId]/page.tsx - Detalle de usuario
'use client';

import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  Calendar, 
  User, 
  Briefcase,
  Building,
  Shield,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Datos de ejemplo para un usuario
const usuarioEjemplo = {
  id: '1',
  nombre: 'Juan Pérez',
  email: 'juan.perez@empresa.com',
  rol: 'superadmin',
  telefono: '+1234567890',
  departamento: 'Administración',
  puesto: 'Director General',
  estado: 'activo',
  fechaCreacion: '2024-01-15',
  ultimoAcceso: '2024-12-03T10:30:00Z',
  direccion: 'Av. Principal 123',
  fechaNacimiento: '1985-06-15',
  notas: 'Usuario con acceso completo al sistema.',
  permisos: ['todos'],
};

const roles = {
  superadmin: { label: 'Super Admin', color: 'bg-purple-100 text-purple-800' },
  admin: { label: 'Administrador', color: 'bg-red-100 text-red-800' },
  chef: { label: 'Chef', color: 'bg-orange-100 text-orange-800' },
  mesero: { label: 'Mesero', color: 'bg-yellow-100 text-yellow-800' },
  empleado: { label: 'Empleado', color: 'bg-blue-100 text-blue-800' },
};

export default function DetalleUsuarioPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/users')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Detalle de Usuario</h1>
            <p className="text-gray-500">Información completa del usuario</p>
          </div>
        </div>
        <Button onClick={() => router.push(`/users/edit/${userId}`)}>
          <Edit className="h-4 w-4 mr-2" />
          Editar Usuario
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Información básica */}
        <div className="lg:col-span-1 space-y-6">
          {/* Tarjeta de perfil */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-gray-600" />
                </div>
                <h2 className="text-xl font-bold">{usuarioEjemplo.nombre}</h2>
                <p className="text-gray-500">{usuarioEjemplo.puesto}</p>
                
                <div className="mt-4">
                  <Badge className={roles[usuarioEjemplo.rol as keyof typeof roles]?.color}>
                    {roles[usuarioEjemplo.rol as keyof typeof roles]?.label}
                  </Badge>
                </div>

                <div className="mt-6 w-full space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Estado</span>
                    {usuarioEjemplo.estado === 'activo' ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-green-600 font-medium">Activo</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-red-600 font-medium">Inactivo</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Miembro desde</span>
                    <span className="font-medium">
                      {new Date(usuarioEjemplo.fechaCreacion).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de contacto */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{usuarioEjemplo.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="font-medium">{usuarioEjemplo.telefono}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
                  <p className="font-medium">
                    {new Date(usuarioEjemplo.fechaNacimiento).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha - Tabs con más información */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="informacion">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="informacion">Información</TabsTrigger>
              <TabsTrigger value="laboral">Laboral</TabsTrigger>
              <TabsTrigger value="permisos">Permisos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="informacion" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Nombre Completo</p>
                      <p className="font-medium">{usuarioEjemplo.nombre}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{usuarioEjemplo.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Teléfono</p>
                      <p className="font-medium">{usuarioEjemplo.telefono}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Dirección</p>
                      <p className="font-medium">{usuarioEjemplo.direccion}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actividad</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Último acceso</span>
                      <span className="font-medium">
                        {new Date(usuarioEjemplo.ultimoAcceso).toLocaleString('es-ES')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Cuenta creada</span>
                      <span className="font-medium">
                        {new Date(usuarioEjemplo.fechaCreacion).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="laboral">
              <Card>
                <CardHeader>
                  <CardTitle>Información Laboral</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Building className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-500">Departamento</p>
                        <p className="font-medium">{usuarioEjemplo.departamento}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm text-gray-500">Puesto</p>
                        <p className="font-medium">{usuarioEjemplo.puesto}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Descripción del Puesto</h3>
                    <p className="text-gray-600">
                      {usuarioEjemplo.rol === 'superadmin' 
                        ? 'Responsable de la administración completa del sistema del comedor, incluyendo gestión de usuarios, configuraciones y reportes.'
                        : usuarioEjemplo.rol === 'admin'
                        ? 'Administra usuarios, reportes y configuración básica del sistema.'
                        : 'Usuario operativo del sistema del comedor.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="permisos">
              <Card>
                <CardHeader>
                  <CardTitle>Permisos del Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="font-medium">Nivel de Acceso: {roles[usuarioEjemplo.rol as keyof typeof roles]?.label}</p>
                        <p className="text-sm text-gray-500">
                          {usuarioEjemplo.rol === 'superadmin'
                            ? 'Acceso completo a todas las funcionalidades del sistema'
                            : usuarioEjemplo.rol === 'admin'
                            ? 'Acceso administrativo limitado'
                            : 'Acceso operativo básico'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Funcionalidades Permitidas</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {[
                          'Dashboard',
                          'Gestión de Usuarios',
                          'Tareas',
                          'Asistencia',
                          'Menús',
                          'Inventario',
                          'Reportes',
                          'Configuración'
                        ].map((funcionalidad) => (
                          <div key={funcionalidad} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>{funcionalidad}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
