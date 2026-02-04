'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { UploadCloud, File, X, FileText, AlertCircle } from 'lucide-react';
import type { ContractType } from '@/lib/types';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';

interface ContractTemplateUploadProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSuccess?: () => void;
}

// Available placeholders that can be used in contracts
const AVAILABLE_PLACEHOLDERS = [
    { key: '{{nombre}}', description: 'Nombre completo del empleado' },
    { key: '{{nombres}}', description: 'Nombres del empleado' },
    { key: '{{apellidos}}', description: 'Apellidos del empleado' },
    { key: '{{cedula}}', description: 'Cédula de identidad' },
    { key: '{{rif}}', description: 'RIF del empleado' },
    { key: '{{direccion}}', description: 'Dirección del empleado' },
    { key: '{{telefono}}', description: 'Teléfono del empleado' },
    { key: '{{email}}', description: 'Correo electrónico' },
    { key: '{{cargo}}', description: 'Cargo o posición' },
    { key: '{{departamento}}', description: 'Departamento' },
    { key: '{{area}}', description: 'Área de trabajo' },
    { key: '{{fechaIngreso}}', description: 'Fecha de ingreso' },
    { key: '{{fechaNacimiento}}', description: 'Fecha de nacimiento' },
    { key: '{{nacionalidad}}', description: 'Nacionalidad' },
    { key: '{{estadoCivil}}', description: 'Estado civil' },
    { key: '{{genero}}', description: 'Género' },
    { key: '{{tipoContrato}}', description: 'Tipo de contrato' },
    { key: '{{diasContrato}}', description: 'Días de duración del contrato' },
    { key: '{{fechaFinContrato}}', description: 'Fecha de finalización del contrato' },
    { key: '{{banco}}', description: 'Nombre del banco' },
    { key: '{{numeroCuenta}}', description: 'Número de cuenta bancaria' },
    { key: '{{tipoCuenta}}', description: 'Tipo de cuenta bancaria' },
    { key: '{{contactoEmergencia}}', description: 'Nombre del contacto de emergencia' },
    { key: '{{telefonoEmergencia}}', description: 'Teléfono del contacto de emergencia' },
    { key: '{{relacionEmergencia}}', description: 'Relación con el contacto de emergencia' },
    { key: '{{fechaActual}}', description: 'Fecha actual (al generar el contrato)' },
];

export function ContractTemplateUpload({ isOpen, onOpenChange, onSuccess }: ContractTemplateUploadProps) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user } = useUser();

    const [file, setFile] = useState<File | null>(null);
    const [templateName, setTemplateName] = useState('');
    const [description, setDescription] = useState('');
    const [contractType, setContractType] = useState<ContractType>('determinado');
    const [content, setContent] = useState('');
    const [detectedPlaceholders, setDetectedPlaceholders] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const selectedFile = acceptedFiles[0];
            setFile(selectedFile);

            // Read file content
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                setContent(text);

                // Detect placeholders in the content
                const placeholders = AVAILABLE_PLACEHOLDERS
                    .filter(p => text.includes(p.key))
                    .map(p => p.key);
                setDetectedPlaceholders(placeholders);
            };
            reader.readAsText(selectedFile);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept: {
            'text/html': ['.html'],
            'text/plain': ['.txt'],
        },
    });

    const handleSave = async () => {
        if (!templateName || !content || !firestore || !user) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Por favor completa todos los campos requeridos.',
            });
            return;
        }

        setIsLoading(true);
        try {
            await addDoc(collection(firestore, 'contractTemplates'), {
                name: templateName,
                description,
                content,
                contractType,
                placeholders: detectedPlaceholders,
                createdBy: user.uid,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                isActive: true,
            });

            toast({
                title: 'Plantilla Guardada',
                description: 'La plantilla de contrato se ha guardado exitosamente.',
            });

            handleClose();
            onSuccess?.();
        } catch (error) {
            console.error('Error saving template:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'No se pudo guardar la plantilla.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setTemplateName('');
        setDescription('');
        setContent('');
        setDetectedPlaceholders([]);
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Subir Plantilla de Contrato</DialogTitle>
                    <DialogDescription>
                        Sube un archivo HTML o TXT con tu plantilla de contrato. Usa marcadores como {'{{'} nombre {'}}'}  para campos dinámicos.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Template Info */}
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="templateName">Nombre de la Plantilla *</Label>
                            <Input
                                id="templateName"
                                placeholder="Ej: Contrato Laboral Estándar"
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe cuándo usar esta plantilla..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={2}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="contractType">Tipo de Contrato</Label>
                            <Select value={contractType} onValueChange={(value) => setContractType(value as ContractType)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="determinado">Tiempo Determinado</SelectItem>
                                    <SelectItem value="indeterminado">Tiempo Indeterminado</SelectItem>
                                    <SelectItem value="prueba">Período de Prueba</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* File Upload */}
                    {!file ? (
                        <div
                            {...getRootProps()}
                            className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted'
                                }`}
                        >
                            <input {...getInputProps()} />
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground">
                                    <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                                </p>
                                <p className="text-xs text-muted-foreground">Archivos HTML o TXT</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center p-4 rounded-md border bg-muted/50">
                                <FileText className="w-6 h-6 mr-3 text-primary" />
                                <span className="font-medium flex-1">{file.name}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setFile(null);
                                        setContent('');
                                        setDetectedPlaceholders([]);
                                    }}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Content Preview */}
                            <div className="grid gap-2">
                                <Label>Vista Previa del Contenido</Label>
                                <Textarea
                                    value={content}
                                    onChange={(e) => {
                                        setContent(e.target.value);
                                        // Re-detect placeholders
                                        const placeholders = AVAILABLE_PLACEHOLDERS
                                            .filter(p => e.target.value.includes(p.key))
                                            .map(p => p.key);
                                        setDetectedPlaceholders(placeholders);
                                    }}
                                    rows={8}
                                    className="font-mono text-xs"
                                />
                            </div>

                            {/* Detected Placeholders */}
                            {detectedPlaceholders.length > 0 && (
                                <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                                    <div className="flex items-start gap-2 mb-2">
                                        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                        <div>
                                            <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100">
                                                Marcadores Detectados ({detectedPlaceholders.length})
                                            </h4>
                                            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                                Estos campos se llenarán automáticamente con los datos del empleado
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {detectedPlaceholders.map((placeholder) => (
                                            <code
                                                key={placeholder}
                                                className="text-xs font-mono bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 rounded px-2 py-1"
                                            >
                                                {placeholder}
                                            </code>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Available Placeholders Reference */}
                            <div className="p-4 border rounded-lg bg-muted/50">
                                <h4 className="font-semibold text-sm mb-2">Marcadores Disponibles</h4>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    {AVAILABLE_PLACEHOLDERS.map((p) => (
                                        <div key={p.key} className="flex items-start gap-2">
                                            <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-primary">
                                                {p.key}
                                            </code>
                                            <span className="text-muted-foreground">{p.description}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button type="button" onClick={handleSave} disabled={!templateName || !content || isLoading}>
                        {isLoading ? 'Guardando...' : 'Guardar Plantilla'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
