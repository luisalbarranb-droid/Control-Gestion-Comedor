'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, ScanLine } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function ScannerCard() {
    const { toast } = useToast();
    const [isScanning, setIsScanning] = useState(false);

    const handleScan = (type: 'in' | 'out') => {
        setIsScanning(true);
        toast({
            title: 'Simulando Escaneo...',
            description: `Buscando cámara y leyendo código QR para registrar la ${type === 'in' ? 'entrada' : 'salida'}.`,
        });

        // In a real app, you would activate the camera here.
        // For this prototype, we just simulate a successful scan after a delay.
        setTimeout(() => {
            setIsScanning(false);
            toast({
                title: `Registro Exitoso (${type === 'in' ? 'Entrada' : 'Salida'})`,
                description: 'La asistencia del empleado ha sido actualizada.',
            });
        }, 2500);
    };


    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><QrCode /> Lector de Asistencia</CardTitle>
                <CardDescription>Registra la entrada y salida del personal escaneando su código QR.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-6 p-8">
                <div className="relative w-48 h-48 flex items-center justify-center bg-muted rounded-lg overflow-hidden">
                    <ScanLine className={`absolute w-full h-1 bg-primary/50 transition-transform duration-3000 ease-linear ${isScanning ? 'animate-scan' : ''}`} />
                    <QrCode className="w-24 h-24 text-muted-foreground" />
                     <style jsx>{`
                        .animate-scan {
                            animation: scan 3s linear infinite;
                        }
                        @keyframes scan {
                            0% { transform: translateY(-100px); }
                            50% { transform: translateY(100px); }
                            100% { transform: translateY(-100px); }
                        }
                    `}</style>
                </div>

                <div className="w-full grid grid-cols-2 gap-4">
                    <Button onClick={() => handleScan('in')} disabled={isScanning} size="lg">
                        Registrar Entrada
                    </Button>
                     <Button onClick={() => handleScan('out')} disabled={isScanning} size="lg" variant="outline">
                        Registrar Salida
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
