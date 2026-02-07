'use client';

import { useEffect, useState } from 'react';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { APP_VERSION } from '@/lib/version';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { RefreshCw, ArrowUpCircle } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function VersionChecker() {
    const firestore = useFirestore();
    const { user, profile } = useUser();
    const { toast } = useToast();
    const [showUpdateDialog, setShowUpdateDialog] = useState(false);
    const [remoteVersion, setRemoteVersion] = useState<string | null>(null);

    const versionRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'system', 'config');
    }, [firestore]);

    const { data: config } = useDoc<any>(versionRef);

    useEffect(() => {
        if (config?.latestVersion) {
            setRemoteVersion(config.latestVersion);
            // Only show update if the version in DB is higher/different than local
            if (config.latestVersion !== APP_VERSION) {
                setShowUpdateDialog(true);
            }
        }
    }, [config]);

    // Sync current version to Firestore on load (only for superadmins)
    useEffect(() => {
        if (firestore && APP_VERSION && profile?.role === 'superadmin') {
            const updateSync = async () => {
                try {
                    await setDoc(doc(firestore, 'system', 'config'), {
                        latestVersion: APP_VERSION,
                        lastDeploy: new Date().toISOString(),
                        notes: [
                            'Gestión de eliminación de usuarios',
                            'Créditos VELCAR C.A. integrados',
                            'Corrección de bucle en reportes',
                            'Sistema de actualización inteligente'
                        ]
                    }, { merge: true });
                } catch (e) {
                    console.error("Error syncing version:", e);
                }
            };
            updateSync();
        }
    }, [firestore, profile?.role]);

    const handleUpdate = () => {
        window.location.reload();
    };

    if (!showUpdateDialog) return null;

    return (
        <AlertDialog open={showUpdateDialog}>
            <AlertDialogContent className="max-w-[400px]">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-primary">
                        <ArrowUpCircle className="h-6 w-6" />
                        Nueva Versión Disponible
                    </AlertDialogTitle>
                    <AlertDialogDescription className="pt-2">
                        Se ha desplegado una nueva versión del sistema <strong>({remoteVersion})</strong>.
                        Es necesario actualizar para aplicar las mejoras y correcciones de seguridad.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="bg-muted p-3 rounded-md text-xs space-y-2">
                    <p className="font-bold">Mejoras en esta versión:</p>
                    <ul className="list-disc pl-4 space-y-1">
                        <li>Gestión de eliminación de usuarios</li>
                        <li>Créditos VELCAR C.A. actualizados</li>
                        <li>Mejoras en estabilidad de reportes</li>
                    </ul>
                </div>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                        variant="default"
                        className="w-full flex items-center gap-2"
                        onClick={handleUpdate}
                    >
                        <RefreshCw className="h-4 w-4" />
                        Actualizar Ahora
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
