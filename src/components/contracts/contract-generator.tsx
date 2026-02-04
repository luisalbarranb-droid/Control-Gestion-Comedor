'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { FileText, Download, Eye } from 'lucide-react';
import type { ContractTemplate, User } from '@/lib/types';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ContractGeneratorProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    templates: ContractTemplate[];
    employees: User[];
    onSuccess?: () => void;
}

// Helper function to convert Timestamp to Date
function convertToDate(date: any): Date {
    if (!date) return new Date();
    if (date instanceof Date) return date;
    if (date?.toDate) return date.toDate();
    return new Date(date);
}

// Helper function to format civil status
function formatCivilStatus(status?: string): string {
    const statusMap: Record<string, string> = {
        'Single': 'Soltero/a',
        'Married': 'Casado/a',
        'Divorced': 'Divorciado/a',
        'Widowed': 'Viudo/a',
        'Cohabiting': 'Unión Libre',
    };
    return status ? statusMap[status] || status : 'No especificado';
}

// Helper function to format gender
function formatGender(gender?: string): string {
    const genderMap: Record<string, string> = {
        'M': 'Masculino',
        'F': 'Femenino',
        'Other': 'Otro',
    };
    return gender ? genderMap[gender] || gender : 'No especificado';
}

// Helper function to format contract type
function formatContractType(type?: string): string {
    const typeMap: Record<string, string> = {
        'determinado': 'Tiempo Determinado',
        'indeterminado': 'Tiempo Indeterminado',
        'prueba': 'Período de Prueba',
    };
    return type ? typeMap[type] || type : 'No especificado';
}

export function ContractGenerator({ isOpen, onOpenChange, templates, employees, onSuccess }: ContractGeneratorProps) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user } = useUser();

    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
    const [showPreview, setShowPreview] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const selectedTemplate = useMemo(
        () => templates.find(t => t.id === selectedTemplateId),
        [templates, selectedTemplateId]
    );

    const selectedEmployee = useMemo(
        () => employees.find(e => e.id === selectedEmployeeId),
        [employees, selectedEmployeeId]
    );

    // Generate contract content by replacing placeholders
    const generatedContent = useMemo(() => {
        if (!selectedTemplate || !selectedEmployee) return '';

        let content = selectedTemplate.content;
        const employee = selectedEmployee;

        // Replace all placeholders
        const replacements: Record<string, string> = {
            '{{nombre}}': employee.name || 'N/A',
            '{{nombres}}': employee.nombres || employee.name || 'N/A',
            '{{apellidos}}': employee.apellidos || 'N/A',
            '{{cedula}}': employee.cedula || 'N/A',
            '{{rif}}': employee.rif || 'N/A',
            '{{direccion}}': employee.address || 'N/A',
            '{{telefono}}': employee.phone || 'N/A',
            '{{email}}': employee.email || 'N/A',
            '{{cargo}}': employee.position || 'N/A',
            '{{departamento}}': employee.department || 'N/A',
            '{{area}}': employee.area || 'N/A',
            '{{fechaIngreso}}': employee.fechaIngreso
                ? format(convertToDate(employee.fechaIngreso), 'dd/MM/yyyy', { locale: es })
                : 'N/A',
            '{{fechaNacimiento}}': employee.fechaNacimiento
                ? format(convertToDate(employee.fechaNacimiento), 'dd/MM/yyyy', { locale: es })
                : 'N/A',
            '{{nacionalidad}}': employee.nationality || 'N/A',
            '{{estadoCivil}}': formatCivilStatus(employee.civilStatus),
            '{{genero}}': formatGender(employee.gender),
            '{{tipoContrato}}': formatContractType(employee.contractType),
            '{{diasContrato}}': employee.diasContrato?.toString() || 'N/A',
            '{{fechaFinContrato}}': employee.contractEndDate
                ? format(convertToDate(employee.contractEndDate), 'dd/MM/yyyy', { locale: es })
                : 'N/A',
            '{{banco}}': employee.bankName || 'N/A',
            '{{numeroCuenta}}': employee.bankAccountNumber || 'N/A',
            '{{tipoCuenta}}': employee.bankAccountType || 'N/A',
            '{{contactoEmergencia}}': employee.emergencyContactName || 'N/A',
            '{{telefonoEmergencia}}': employee.emergencyContactPhone || 'N/A',
            '{{relacionEmergencia}}': employee.emergencyContactRelation || 'N/A',
            '{{fechaActual}}': format(new Date(), 'dd/MM/yyyy', { locale: es }),
        };

        // Replace all placeholders in content
        Object.entries(replacements).forEach(([placeholder, value]) => {
            content = content.replace(new RegExp(placeholder, 'g'), value);
        });

        return content;
    }, [selectedTemplate, selectedEmployee]);

    const handleGenerate = async () => {
        if (!selectedTemplate || !selectedEmployee || !firestore || !user) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Por favor selecciona una plantilla y un empleado.',
            });
            return;
        }

        setIsLoading(true);
        try {
            await addDoc(collection(firestore, 'generatedContracts'), {
                templateId: selectedTemplate.id,
                userId: selectedEmployee.id,
                generatedContent,
                generatedBy: user.uid,
                generatedAt: Timestamp.now(),
                contractDate: Timestamp.now(),
                status: 'draft',
            });

            toast({
                title: 'Contrato Generado',
                description: `El contrato para ${selectedEmployee.name} se ha generado exitosamente.`,
            });

            handleClose();
            onSuccess?.();
        } catch (error) {
            console.error('Error generating contract:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'No se pudo generar el contrato.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadHTML = () => {
        if (!generatedContent || !selectedEmployee) return;

        const blob = new Blob([generatedContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contrato_${selectedEmployee.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
            title: 'Descarga Iniciada',
            description: 'El contrato se está descargando en formato HTML.',
        });
    };

    const handleClose = () => {
        setSelectedTemplateId('');
        setSelectedEmployeeId('');
        setShowPreview(false);
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Generar Contrato Individual</DialogTitle>
                    <DialogDescription>
                        Selecciona una plantilla y un empleado para generar su contrato personalizado.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Template Selection */}
                    <div className="grid gap-2">
                        <Label htmlFor="template">Plantilla de Contrato *</Label>
                        <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona una plantilla..." />
                            </SelectTrigger>
                            <SelectContent>
                                {templates.filter(t => t.isActive).map((template) => (
                                    <SelectItem key={template.id} value={template.id}>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{template.name}</span>
                                            {template.description && (
                                                <span className="text-xs text-muted-foreground">{template.description}</span>
                                            )}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Employee Selection */}
                    <div className="grid gap-2">
                        <Label htmlFor="employee">Empleado *</Label>
                        <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un empleado..." />
                            </SelectTrigger>
                            <SelectContent>
                                {employees.map((employee) => (
                                    <SelectItem key={employee.id} value={employee.id}>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{employee.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {employee.cedula && `CI: ${employee.cedula}`}
                                                {employee.position && ` • ${employee.position}`}
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Preview Toggle */}
                    {selectedTemplate && selectedEmployee && (
                        <div className="space-y-4">
                            <Button
                                variant="outline"
                                onClick={() => setShowPreview(!showPreview)}
                                className="w-full"
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                {showPreview ? 'Ocultar Vista Previa' : 'Ver Vista Previa'}
                            </Button>

                            {showPreview && (
                                <div className="border rounded-lg p-6 bg-white dark:bg-gray-900 max-h-96 overflow-y-auto">
                                    <div
                                        className="prose prose-sm dark:prose-invert max-w-none"
                                        dangerouslySetInnerHTML={{ __html: generatedContent }}
                                    />
                                </div>
                            )}

                            {/* Template Info */}
                            <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
                                <div className="flex items-start gap-2">
                                    <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-sm">Información del Contrato</h4>
                                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Plantilla:</span>
                                                <p className="font-medium">{selectedTemplate.name}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Empleado:</span>
                                                <p className="font-medium">{selectedEmployee.name}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Tipo:</span>
                                                <p className="font-medium">{formatContractType(selectedTemplate.contractType)}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Campos detectados:</span>
                                                <p className="font-medium">{selectedTemplate.placeholders.length} marcadores</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button type="button" variant="outline" onClick={handleClose}>
                        Cancelar
                    </Button>
                    {selectedTemplate && selectedEmployee && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleDownloadHTML}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Descargar HTML
                        </Button>
                    )}
                    <Button
                        type="button"
                        onClick={handleGenerate}
                        disabled={!selectedTemplate || !selectedEmployee || isLoading}
                    >
                        {isLoading ? 'Generando...' : 'Generar y Guardar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
