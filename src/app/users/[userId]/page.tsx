'use client';

import { useParams } from 'next/navigation';
import { users, areas } from '@/lib/placeholder-data';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Header } from '@/components/dashboard/header';
import { MainNav } from '@/components/dashboard/main-nav';
import { SquareCheck, User, Mail, Briefcase, Building, Calendar, QrCode } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Role } from '@/lib/types';
import QRCode from 'react-qr-code';

const roleVariant: Record<Role, string> = {
  superadmin: 'bg-purple-100 text-purple-800',
  admin: 'bg-blue-100 text-blue-800',
  comun: 'bg-gray-100 text-gray-800',
};

const statusVariant: Record<boolean, string> = {
  true: 'bg-green-100 text-green-800',
  false: 'bg-red-100 text-red-800',
};

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;

  const user = users.find(u => u.userId === userId);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Usuario no encontrado.</p>
      </div>
    );
  }
  
  const getAreaName = (areaId: string) => areas.find(a => a.id === areaId)?.nombre || 'N/A';
  const getUserInitials = (name: string) => name.split(' ').map((n) => n[0]).join('');

  const userDetails = [
    { label: 'Email', value: user.email, icon: Mail },
    { label: 'Rol', value: user.rol, icon: Briefcase, isBadge: true, badgeClass: roleVariant[user.rol] },
    { label: 'Área', value: getAreaName(user.area), icon: Building },
    { label: 'Miembro Desde', value: format(user.fechaCreacion, 'dd MMMM, yyyy', { locale: es }), icon: Calendar },
  ];

  return (
    <div className="min-h-screen w-full">
      <Sidebar>
        <SidebarHeader className="p-4 justify-center flex items-center gap-2">
          <SquareCheck className="size-8 text-primary" />
          <h1 className="font-headline text-2xl font-bold">Comedor</h1>
        </SidebarHeader>
        <SidebarContent>
          <MainNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex-1 p-4 md:p-8">
            <h1 className="font-headline text-2xl font-bold md:text-3xl mb-8">
              Perfil de Usuario
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Card>
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                             <Avatar className="h-24 w-24 mb-4">
                                <AvatarImage src={user.avatarUrl} alt={user.nombre} />
                                <AvatarFallback className="text-3xl">
                                {getUserInitials(user.nombre)}
                                </AvatarFallback>
                            </Avatar>
                            <h2 className="text-xl font-bold">{user.nombre}</h2>
                            <p className="text-muted-foreground">{user.email}</p>
                             <Badge variant="secondary" className={cn(statusVariant[user.activo], 'capitalize mt-4')}>
                                {user.activo ? 'Activo' : 'Inactivo'}
                            </Badge>
                        </CardContent>
                    </Card>
                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><QrCode className="w-5 h-5"/> Código QR de Asistencia</CardTitle>
                            <CardDescription>Usa este código para registrar tu entrada y salida en el lector.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center p-4 bg-white">
                           <QRCode
                                size={256}
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                value={user.userId}
                                viewBox={`0 0 256 256`}
                            />
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detalles del Usuario</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                                {userDetails.map(detail => (
                                    <div key={detail.label} className="flex items-start gap-3">
                                        <detail.icon className="w-5 h-5 text-muted-foreground mt-1" />
                                        <div>
                                            <dt className="font-medium text-sm text-muted-foreground">{detail.label}</dt>
                                            {detail.isBadge ? (
                                                <dd>
                                                    <Badge variant="secondary" className={cn(detail.badgeClass, 'capitalize text-sm')}>
                                                        {detail.value}
                                                    </Badge>
                                                </dd>
                                            ) : (
                                                <dd className="text-sm font-semibold">{detail.value}</dd>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </dl>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
      </SidebarInset>
    </div>
  );
}
