// src/app/users/edit/[userId]/page.tsx
'use client';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const { userId } = params;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Editar Usuario</h1>
      <p>Aquí se editará la información del usuario con ID: <span className="font-mono bg-muted px-2 py-1 rounded">{userId}</span>.</p>
      <Button onClick={() => router.back()} variant="outline" className="mt-4">
        Volver
      </Button>
    </div>
  );
}
