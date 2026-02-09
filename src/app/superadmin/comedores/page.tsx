
'use client';

import React, { useState, useMemo } from 'react';
import { useMultiTenant } from '@/providers/multi-tenant-provider';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import type { Comedor } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Building2, MapPin, Phone, Globe, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export default function ComedoresPage() {
    const { isSuperAdmin } = useMultiTenant();
    const firestore = useFirestore();
    const { toast } = useToast();
    const comedoresRef = useMemoFirebase(() => collection(firestore, 'comedores'), [firestore]);
    const { data: comedores, isLoading } = useCollection<Comedor>(comedoresRef);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        slug: '',
        direccion: '',
        telefono: '',
    });

    if (!isSuperAdmin) {
        return (
            <div className="p-8 text-center text-red-500">
                Acceso denegado. Se requieren permisos de Super Administrador.
            </div>
        );
    }

    const handleAddComedor = async () => {
        if (!formData.nombre || !formData.slug) {
            toast({ variant: 'destructive', title: 'Error', description: 'Nombre y Slug son obligatorios.' });
            return;
        }

        try {
            await addDocumentNonBlocking(collection(firestore, 'comedores'), {
                ...formData,
                isActive: true,
                creationDate: serverTimestamp(),
            });
            toast({ title: 'Éxito', description: 'Comedor creado correctamente.' });
            setIsAdding(false);
            setFormData({ nombre: '', slug: '', direccion: '', telefono: '' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo crear el comedor.' });
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Comedores</h1>
                    <p className="text-muted-foreground">Administra las diferentes sedes de VELCAR, C.A.</p>
                </div>

                <Dialog open={isAdding} onOpenChange={setIsAdding}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> Nueva Sede
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Agregar Nueva Sede</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nombre de la Sede</Label>
                                <Input
                                    id="name"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    placeholder="Ej. Comedor Principal Caracas"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug (URL amigable)</Label>
                                <Input
                                    id="slug"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                                    placeholder="ej. caracas-principal"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="address">Dirección</Label>
                                <Input
                                    id="address"
                                    value={formData.direccion}
                                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                    placeholder="Av. Universidad..."
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input
                                    id="phone"
                                    value={formData.telefono}
                                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                    placeholder="+58..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAddComedor}>Guardar Sede</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {comedores?.map((comedor) => (
                        <Card key={comedor.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <CardHeader className="bg-slate-50 border-b">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-white rounded-lg border shadow-sm">
                                        <Building2 className="h-6 w-6 text-primary" />
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${comedor.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {comedor.isActive ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                                <CardTitle className="mt-4">{comedor.nombre}</CardTitle>
                                <CardDescription>ID: {comedor.id}</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Globe className="h-4 w-4" />
                                    <span>Slug: {comedor.slug}</span>
                                </div>
                                {comedor.direccion && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        <span>{comedor.direccion}</span>
                                    </div>
                                )}
                                {comedor.telefono && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Phone className="h-4 w-4" />
                                        <span>{comedor.telefono}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                    {comedores?.length === 0 && (
                        <div className="col-span-full p-12 text-center border-2 border-dashed rounded-xl">
                            <p className="text-muted-foreground">No hay sedes registradas todavía.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
