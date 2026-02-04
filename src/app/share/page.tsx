
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import QRCode from 'react-qr-code';
import { Smartphone, ArrowDown, Share2 } from 'lucide-react';

export default function SharePage() {
  const [appUrl, setAppUrl] = useState('');

  useEffect(() => {
    // Establecemos manualmente la IP del servidor para asegurar que el QR sea accesible desde otros dispositivos
    setAppUrl('http://192.168.3.101:3000');
  }, []);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 md:gap-8 md:p-8 bg-muted/40">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto bg-primary text-primary-foreground p-3 rounded-full w-fit mb-4">
            <Share2 className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl">Compartir Aplicación</CardTitle>
          <CardDescription>
            Escanea el código QR con tu móvil o tablet para acceder a la aplicación al instante.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          {appUrl ? (
            <div className="bg-white p-4 rounded-lg border">
              <QRCode value={appUrl} size={256} />
            </div>
          ) : (
            <div className="h-[288px] w-[288px] bg-muted animate-pulse rounded-lg" />
          )}

          <div className="w-full space-y-4 text-left p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-3">
              <Smartphone className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold">Paso 1: Escanear</h4>
                <p className="text-sm text-muted-foreground">Abre la cámara de tu dispositivo y apunta al código QR.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ArrowDown className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold">Paso 2: Agregar a Inicio</h4>
                <p className="text-sm text-muted-foreground">Una vez abierta la app en tu navegador, busca la opción "Añadir a pantalla de inicio" en el menú para crear un acceso directo.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
