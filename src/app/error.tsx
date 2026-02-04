'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('App Error:', error);
    }, [error]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
            <div className="rounded-full bg-red-100 p-6 mb-6">
                <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Ups! Algo salió mal</h2>
            <p className="text-gray-600 mb-8 max-w-md">
                La aplicación encontró un error inesperado al renderizar esta página.
                {error.message && (
                    <code className="block mt-4 p-2 bg-gray-100 rounded text-xs text-red-500 font-mono text-left overflow-auto max-h-32">
                        Error: {error.message}
                    </code>
                )}
            </p>
            <div className="flex gap-4">
                <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    className="gap-2"
                >
                    Recargar Página
                </Button>
                <Button
                    onClick={() => reset()}
                    className="gap-2"
                >
                    <RefreshCcw className="h-4 w-4" />
                    Intentar de nuevo
                </Button>
            </div>
        </div>
    );
}
