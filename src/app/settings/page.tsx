'use client';

import { Settings } from 'lucide-react';
import { ProfileCard } from '@/components/settings/profile-card';

export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center gap-4">
        <Settings className="h-6 w-6" />
        <h1 className="font-headline text-2xl font-bold md:text-3xl">
          Configuración de la Cuenta
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <ProfileCard />
        </div>
        <div>
          {/* Espacio para futuras tarjetas de configuración, como notificaciones o temas */}
        </div>
      </div>
    </div>
  );
}