'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Plus, Download, Eye, Trash2, Edit } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import type { ContractTemplate, GeneratedContract, User } from '@/lib/types';
import { ContractTemplateUpload } from '@/components/contracts/contract-template-upload';
import { ContractGenerator } from '@/components/contracts/contract-generator';
import { useToast } from '@/components/ui/toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Helper function to convert Timestamp to Date
function convertToDate(date: any): Date {
    if (!date) return new Date();
    if (date instanceof Date) return date;
    if (date?.toDate) return date.toDate();
    return new Date(date);
}

export default function ContractsPage() {
    const firestore = useFirestore();
    const { toast } = useToast();

    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [generatorDialogOpen, setGeneratorDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'template' | 'contract' } | null>(null);
    const [editingTemplate, setEditingTemplate] = useState<ContractTemplate | null>(null);

    // Fetch templates
    const templatesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(
            collection(firestore, 'contractTemplates'),
            orderBy('createdAt', 'desc')
        );
    }, [firestore]);

    const { data: templates, isLoading: isLoadingTemplates } = useCollection<ContractTemplate>(templatesQuery);

    // Fetch generated contracts
    const contractsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(
            collection(firestore, 'generatedContracts'),
            orderBy('generatedAt', 'desc')
        );
    }, [firestore]);

    const { data: generatedContracts, isLoading: isLoadingContracts } = useCollection<GeneratedContract>(contractsQuery);

    // Fetch employees
    const employeesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'users');
    }, [firestore]);

    const { data: employees, isLoading: isLoadingEmployees } = useCollection<User>(employeesQuery);

    const handleDelete = async () => {
        if (!itemToDelete || !firestore) return;

        try {
            const collectionName = itemToDelete.type === 'template' ? 'contractTemplates' : 'generatedContracts';
            await deleteDoc(doc(firestore, collectionName, itemToDelete.id));

            toast({
                title: 'Eliminado',
                description: `${itemToDelete.type === 'template' ? 'Plantilla' : 'Contrato'} eliminado exitosamente.`,
            });
        } catch (error) {
            console.error('Error deleting:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'No se pudo eliminar el elemento.',
            });
        } finally {
            setDeleteDialogOpen(false);
            setItemToDelete(null);
        }
    };

    const handleDownloadContract = (contract: GeneratedContract) => {
        const blob = new Blob([contract.generatedContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contrato_${contract.id}_${format(new Date(), 'yyyyMMdd')}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
            title: 'Descarga Iniciada',
            description: 'El contrato se está descargando.',
        });
    };

    const getEmployeeName = (userId: string) => {
        const employee = employees?.find(e => e.id === userId);
        return employee?.name || 'Empleado desconocido';
    };

    const getTemplateName = (templateId: string) => {
        const template = templates?.find(t => t.id === templateId);
        return template?.name || 'Plantilla desconocida';
    };

    const handleEditTemplate = (template: ContractTemplate) => {
        setEditingTemplate(template);
        setUploadDialogOpen(true);
    };

    const handleNewTemplate = () => {
        setEditingTemplate(null);
        setUploadDialogOpen(true);
    };

    const isLoading = isLoadingTemplates || isLoadingContracts || isLoadingEmployees;

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-headline text-2xl font-bold md:text-3xl">Gestión de Contratos</h1>
                    <p className="text-muted-foreground">
                        Administra plantillas y genera contratos personalizados para cada empleado.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={handleNewTemplate}>
                        <Upload className="mr-2 h-4 w-4" />
                        Subir Plantilla
                    </Button>
                    <Button onClick={() => setGeneratorDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Generar Contrato
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/10 dark:to-background border-blue-100 dark:border-blue-900/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Plantillas Activas</CardTitle>
                        <FileText className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? '...' : templates?.filter(t => t.isActive).length || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/10 dark:to-background border-green-100 dark:border-green-900/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Contratos Generados</CardTitle>
                        <FileText className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? '...' : generatedContracts?.length || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Empleados Registrados</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? '...' : employees?.length || 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Templates Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Plantillas de Contratos</CardTitle>
                    <CardDescription>
                        Plantillas disponibles para generar contratos personalizados.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">Cargando plantillas...</div>
                    ) : templates && templates.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Tipo de Contrato</TableHead>
                                    <TableHead>Marcadores</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Fecha de Creación</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {templates.map((template) => (
                                    <TableRow key={template.id}>
                                        <TableCell className="font-medium">
                                            <div>
                                                <p>{template.name}</p>
                                                {template.description && (
                                                    <p className="text-xs text-muted-foreground">{template.description}</p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {template.contractType === 'determinado' && 'Tiempo Determinado'}
                                                {template.contractType === 'indeterminado' && 'Tiempo Indeterminado'}
                                                {template.contractType === 'prueba' && 'Período de Prueba'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">
                                                {template.placeholders.length} campos
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={template.isActive ? 'default' : 'secondary'}>
                                                {template.isActive ? 'Activa' : 'Inactiva'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {format(convertToDate(template.createdAt), 'dd/MM/yyyy', { locale: es })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEditTemplate(template)}
                                                >
                                                    <Edit className="h-4 w-4 text-blue-500" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setItemToDelete({ id: template.id, type: 'template' });
                                                        setDeleteDialogOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-8">
                            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground mb-4">No hay plantillas disponibles</p>
                            <Button onClick={handleNewTemplate}>
                                <Upload className="mr-2 h-4 w-4" />
                                Subir Primera Plantilla
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Generated Contracts Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Contratos Generados</CardTitle>
                    <CardDescription>
                        Historial de contratos generados para empleados.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">Cargando contratos...</div>
                    ) : generatedContracts && generatedContracts.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Empleado</TableHead>
                                    <TableHead>Plantilla</TableHead>
                                    <TableHead>Fecha de Generación</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {generatedContracts.map((contract) => (
                                    <TableRow key={contract.id}>
                                        <TableCell className="font-medium">
                                            {getEmployeeName(contract.userId)}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {getTemplateName(contract.templateId)}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {format(convertToDate(contract.generatedAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    contract.status === 'signed'
                                                        ? 'default'
                                                        : contract.status === 'draft'
                                                            ? 'secondary'
                                                            : 'outline'
                                                }
                                            >
                                                {contract.status === 'draft' && 'Borrador'}
                                                {contract.status === 'signed' && 'Firmado'}
                                                {contract.status === 'archived' && 'Archivado'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Descargar HTML"
                                                    onClick={() => handleDownloadContract(contract)}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive"
                                                    onClick={() => {
                                                        setItemToDelete({ id: contract.id, type: 'contract' });
                                                        setDeleteDialogOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-8">
                            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground mb-4">No hay contratos generados</p>
                            <Button onClick={() => setGeneratorDialogOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Generar Primer Contrato
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialogs */}
            <ContractTemplateUpload
                isOpen={uploadDialogOpen}
                onOpenChange={setUploadDialogOpen}
                editingTemplate={editingTemplate}
                onSuccess={() => {
                    toast({
                        title: 'Éxito',
                        description: `La plantilla se ha ${editingTemplate ? 'actualizado' : 'guardado'} correctamente.`,
                    });
                    setEditingTemplate(null);
                }}
            />

            <ContractGenerator
                isOpen={generatorDialogOpen}
                onOpenChange={setGeneratorDialogOpen}
                templates={templates || []}
                employees={employees || []}
                onSuccess={() => {
                    toast({
                        title: 'Éxito',
                        description: 'El contrato se ha generado correctamente.',
                    });
                }}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente{' '}
                            {itemToDelete?.type === 'template' ? 'la plantilla' : 'el contrato'}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
