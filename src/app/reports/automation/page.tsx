
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Mail, Clock, Calendar, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/components/ui/toast';

export default function ReportAutomationPage() {
    const firestore = useFirestore();
    const { user, profile } = useUser();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Local state for the form
    const [isEnabled, setIsEnabled] = useState(false);
    const [email, setEmail] = useState('');

    // Use a special document ID for the user's subscription
    const subscriptionRef = useMemoFirebase(() => {
        if (!firestore || !user?.uid) return null;
        return doc(firestore, 'report_subscriptions', user.uid);
    }, [firestore, user?.uid]);

    const { data: subscription, isLoading } = useDoc<any>(subscriptionRef, { disabled: !user });

    useEffect(() => {
        if (subscription) {
            setIsEnabled(subscription.active ?? false);
            setEmail(subscription.email || user?.email || '');
        } else if (user) {
            setEmail(user.email || '');
        }
    }, [subscription, user]);

    const handleSave = async () => {
        if (!firestore || !user) return;
        setIsSubmitting(true);

        try {
            await setDoc(doc(firestore, 'report_subscriptions', user.uid), {
                userId: user.uid,
                userName: profile?.name || user.displayName || 'Usuario',
                email: email,
                active: isEnabled,
                schedule: 'Viernes 17:00 PM',
                frequency: 'semanal',
                updatedAt: serverTimestamp(),
            }, { merge: true });

            toast({
                title: isEnabled ? 'Suscripción Activada' : 'Suscripción Desactivada',
                description: isEnabled
                    ? `Recibirás el reporte todos los viernes en ${email}.`
                    : 'Ya no recibirás reportes automáticos.',
            });
        } catch (error) {
            console.error('Error saving subscription:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'No se pudo guardar la configuración.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
                <Mail className="h-6 w-6 text-primary" />
                <h1 className="font-headline text-2xl font-bold md:text-3xl">Automatización de Reportes</h1>
            </div>

            <Card className={isEnabled ? "border-green-200 bg-green-50/10" : ""}>
                <CardHeader>
                    <CardTitle>Reporte Semanal Consolidado</CardTitle>
                    <CardDescription>
                        Recibe un resumen completo de la semana (Gastos, Asistencia y Tareas) directamente en tu bandeja de entrada.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
                        <div className="space-y-0.5">
                            <Label className="text-base font-bold">Activar Envío Automático</Label>
                            <p className="text-sm text-muted-foreground">
                                Se enviará cada viernes a las 5:00 PM (Hora local).
                            </p>
                        </div>
                        <Switch
                            checked={isEnabled}
                            onCheckedChange={setIsEnabled}
                        />
                    </div>

                    {isEnabled && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="space-y-2">
                                <Label htmlFor="email">Correo Electrónico de Destino</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="ejemplo@correo.com"
                                        className="pl-10"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white p-3 rounded border">
                                    <Clock className="h-4 w-4 text-primary" />
                                    <span>Próximo envío: Próximo Viernes 17:00</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white p-3 rounded border">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    <span>Frecuencia: Semanal</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isEnabled && (
                        <div className="flex items-center gap-2 p-3 text-sm text-orange-600 bg-orange-50 rounded border border-orange-100">
                            <AlertCircle className="h-4 w-4" />
                            <span>El envío automático está desactivado actualmente.</span>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="border-t pt-6">
                    <Button onClick={handleSave} disabled={isSubmitting} className="w-full md:w-auto">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar Configuración
                    </Button>
                </CardFooter>
            </Card>

            <div className="space-y-4">
                <h3 className="text-lg font-bold">¿Qué incluye este reporte?</h3>
                <div className="grid gap-3">
                    {[
                        { title: "Resumen de Inventario", desc: "Monto total en almacén y artículos críticos agotados." },
                        { title: "Control de Asistencia", desc: "Consolidado de faltas, retardos y horas del personal." },
                        { title: "Gestión Operativa", desc: "Porcentaje de tareas completadas y eficiencia por área." }
                    ].map((item, i) => (
                        <div key={i} className="flex gap-3 p-3 rounded border bg-white">
                            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                            <div>
                                <p className="font-semibold text-sm">{item.title}</p>
                                <p className="text-xs text-muted-foreground">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
