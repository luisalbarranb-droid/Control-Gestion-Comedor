// src/app/users/new/page.tsx
'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function NewUserPage() {
    const router = useRouter();
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Crear Nuevo Usuario</h1>
      <p>Esta es la página para crear un nuevo usuario.</p>
       <Button onClick={() => router.back()} variant="outline" className="mt-4">
        Volver
      </Button>
    </div>
  );
}
