'use client';

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Edit } from 'lucide-react';
import type { User } from '@/lib/types';
import { format } from 'date-fns';

type DetailItemProps = {
  label: string;
  value?: string | number | null;
};

const DetailItem = ({ label, value }: DetailItemProps) => (
  <div className="flex justify-between py-2 border-b">
    <dt className="text-sm text-muted-foreground">{label}</dt>
    <dd className="text-sm font-medium">{value || 'N/A'}</dd>
  </div>
);

export default function EmployeeDetailsPage({ params }: { params: { employeeId: string } }) {
  const firestore = useFirestore();
  const { employeeId } = params;

  const userDocRef = useMemoFirebase(
    () => (firestore && employeeId ? doc(firestore, 'users', employeeId) : null),
    [firestore, employeeId]
  );
  
  const { data: user, isLoading } = useDoc<User>(userDocRef);

  if (isLoading) {
    return <div className="p-8 text-center">Cargando expediente...</div>;
  }

  if (!user) {
    return notFound();
  }

  const creationDate = user.creationDate ? (user.creationDate as any).toDate() : null;
  const contractEndDate = user.contractEndDate ? (user.contractEndDate as any).toDate() : null;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
            <Button variant="outline" asChild>
                <Link href="/attendance/personal"><ArrowLeft className="mr-2 h-4 w-4"/> Volver a la Lista</Link>
            </Button>
            <Button>
                <Edit className="mr-2 h-4 w-4" /> Editar Expediente
            </Button>
        </div>

      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback className="text-3xl">{user.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl">{user.name}</CardTitle>
          <CardDescription className="text-lg capitalize">{user.role}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
            <section>
                <h3 className="font-semibold text-lg mb-2 border-b pb-1">Información Personal</h3>
                <dl className="space-y-1">
                    <DetailItem label="Cédula" value={user.cedula} />
                    <DetailItem label="Email" value={user.email} />
                    <DetailItem label="Teléfono" value={user.phone} />
                    <DetailItem label="Dirección" value={user.address} />
                </dl>
            </section>
            <section>
                <h3 className="font-semibold text-lg mb-2 border-b pb-1">Información Laboral</h3>
                <dl className="space-y-1">
                    <DetailItem label="Tipo de Personal" value={user.workerType} />
                    <DetailItem label="Área" value={user.area} />
                    <DetailItem label="Fecha de Ingreso" value={creationDate ? format(creationDate, 'dd/MM/yyyy') : 'N/A'} />
                    <DetailItem label="Tipo de Contrato" value={user.contractType} />
                    {user.contractType === 'determinado' && (
                        <DetailItem label="Fin de Contrato" value={contractEndDate ? format(contractEndDate, 'dd/MM/yyyy') : 'N/A'} />
                    )}
                </dl>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
