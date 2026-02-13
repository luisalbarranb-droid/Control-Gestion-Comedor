
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
    ArrowLeft,
    Calculator,
    FileText,
    Download,
    MessageSquare,
    HelpCircle,
    Save,
    User,
    ChevronRight,
    Printer,
    FileSpreadsheet,
    Zap,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where, updateDoc, doc } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useMultiTenant } from '@/providers/multi-tenant-provider';
import type { User as Employee } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { askSalaryExpert, type HRSalaryExpertOutput } from '@/ai/flows/hr-salary-expert';

export default function SalaryAssistantPage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const { activeComedorId, isSuperAdmin } = useMultiTenant();
    const { profile: currentUser } = useUser();
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // AI Chat states
    const [aiQuestion, setAiQuestion] = useState('');
    const [aiResponse, setAiResponse] = useState<HRSalaryExpertOutput | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);

    // States for calculations
    const [baseMonthlySalary, setBaseMonthlySalary] = useState<number>(0);
    const [foodAllocation, setFoodAllocation] = useState<number>(0);
    const [otherBonuses, setOtherBonuses] = useState<number>(0);
    const [utilidadesDays, setUtilidadesDays] = useState<number>(30);
    const [vacationBonusDays, setVacationBonusDays] = useState<number>(15);

    // Employees Query
    const usersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        const usersRef = collection(firestore, 'users');
        if (activeComedorId) {
            return query(usersRef, where('comedorId', '==', activeComedorId), orderBy('name', 'asc'));
        } else if (isSuperAdmin) {
            return query(usersRef, orderBy('name', 'asc'));
        }
        return null;
    }, [firestore, activeComedorId, isSuperAdmin]);

    const { data: employees, isLoading: employeesLoading } = useCollection<Employee>(usersQuery);

    const selectedEmployee = useMemo(() =>
        employees?.find(e => e.id === selectedEmployeeId),
        [employees, selectedEmployeeId]);

    // Handle employee selection to pre-fill data
    const handleEmployeeChange = (id: string) => {
        setSelectedEmployeeId(id);
        const emp = employees?.find(e => e.id === id);
        if (emp) {
            setBaseMonthlySalary(emp.baseSalary || 0);
            setFoodAllocation(emp.foodAllocation || 0);
            setOtherBonuses(emp.otherBonuses || 0);
        }
    };

    const handleSaveSalary = async () => {
        if (!firestore || !selectedEmployeeId) return;
        setIsSaving(true);
        try {
            const userRef = doc(firestore, 'users', selectedEmployeeId);
            await updateDoc(userRef, {
                baseSalary: baseMonthlySalary,
                foodAllocation: foodAllocation,
                otherBonuses: otherBonuses,
            });
            toast({ title: 'Datos Guardados', description: 'El perfil del empleado ha sido actualizado.' });
        } catch (e) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar la información.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleAskExpert = async () => {
        if (!aiQuestion.trim()) return;
        setIsAiLoading(true);
        try {
            const context = selectedEmployee ? {
                employeeName: selectedEmployee.name,
                baseSalary: baseMonthlySalary,
                normalSalary: normalSalary,
                integralSalary: integralSalary,
                fechaIngreso: selectedEmployee.fechaIngreso?.toString()
            } : undefined;

            const result = await askSalaryExpert({ question: aiQuestion, context });
            setAiResponse(result);
        } catch (e) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Error', description: 'El experto no pudo responder en este momento.' });
        } finally {
            setIsAiLoading(false);
        }
    };

    // VENEZUELAN LABOR LAW CALCULATIONS (LOTTT)
    const normalSalary = useMemo(() => baseMonthlySalary + otherBonuses, [baseMonthlySalary, otherBonuses]);
    const normalDaily = useMemo(() => normalSalary / 30, [normalSalary]);
    const utilidadesAliquot = useMemo(() => (normalSalary * utilidadesDays) / 360, [normalSalary, utilidadesDays]);
    const vacationBonusAliquot = useMemo(() => (normalSalary * vacationBonusDays) / 360, [normalSalary, vacationBonusDays]);
    const integralSalary = useMemo(() => normalSalary + utilidadesAliquot + vacationBonusAliquot, [normalSalary, utilidadesAliquot, vacationBonusAliquot]);
    const integralDaily = useMemo(() => integralSalary / 30, [integralSalary]);

    const estimatedPrestaciones = useMemo(() => {
        if (!selectedEmployee?.fechaIngreso) return 0;
        const ingreso = selectedEmployee.fechaIngreso instanceof Date
            ? selectedEmployee.fechaIngreso
            : (selectedEmployee.fechaIngreso as any).toDate?.() || new Date(selectedEmployee.fechaIngreso as any || Date.now());

        const diffTime = Math.abs(new Date().getTime() - ingreso.getTime());
        const years = diffTime / (1000 * 60 * 60 * 24 * 365.25);
        return years * 30 * integralDaily;
    }, [selectedEmployee, integralDaily]);

    // EXPORT FUNCTIONS
    const exportToExcel = () => {
        if (!mounted) return;
        const data = [
            ["SISTEMA DE CONTROL COMEDOR - REPORTE DE SALARIOS"],
            ["FECHA:", format(new Date(), 'dd/MM/yyyy HH:mm')],
            [],
            ["DATOS DEL EMPLEADO"],
            ["Nombre:", selectedEmployee?.name || "N/A"],
            ["Cédula:", selectedEmployee?.cedula || "N/A"],
            ["Cargo:", selectedEmployee?.position || "N/A"],
            ["Fecha Ingreso:", selectedEmployee?.fechaIngreso ? format(new Date(selectedEmployee.fechaIngreso as any), 'dd/MM/yyyy') : "N/A"],
            [],
            ["DESGlose DE SALARIO"],
            ["Salario Base Mensual:", baseMonthlySalary],
            ["Bonos Regulares:", otherBonuses],
            ["Cestaticket (Food):", foodAllocation],
            ["Salario Normal Mensual:", normalSalary],
            ["Salario Normal Diario:", normalDaily.toFixed(2)],
            [],
            ["ALÍCUOTAS PARA SALARIO INTEGRAL"],
            [`Utilidades (${utilidadesDays} días):`, utilidadesAliquot.toFixed(2)],
            [`Bono Vacacional (${vacationBonusDays} días):`, vacationBonusAliquot.toFixed(2)],
            ["Salario Integral Mensual:", integralSalary.toFixed(2)],
            ["Salario Integral Diario:", integralDaily.toFixed(2)],
            [],
            ["PRESTACIONES SOCIALES ESTIMADAS"],
            ["Total Acumulado:", estimatedPrestaciones.toFixed(2)]
        ];

        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Calculos");
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([wbout], { type: "application/octet-stream" }), `CalculoSalario_${selectedEmployee?.name || 'Manual'}.xlsx`);
    };

    if (!mounted) return null;

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                        <Link href="/attendance">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Asistente de Salarios y Prestaciones</h1>
                        <p className="text-muted-foreground">Experticia legal LOTTT (Venezuela) para tu gestión de nómina.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={exportToExcel} disabled={!selectedEmployeeId && baseMonthlySalary === 0}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar Excel
                    </Button>
                    <Button onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" /> Imprimir Vista
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 space-y-6 print:hidden">
                    <Card className="border-primary/20 shadow-lg">
                        <CardHeader className="bg-primary/5 rounded-t-lg">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" /> Datos del Empleado
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2">
                                <Label>Seleccionar Personal</Label>
                                <Select value={selectedEmployeeId} onValueChange={handleEmployeeChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Buscar empleado..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees?.map(emp => (
                                            <SelectItem key={emp.id} value={emp.id}>{emp.name} - {emp.cedula}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="baseSalary">Salario Base Mensual</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-muted-foreground">Bs.</span>
                                    <Input
                                        id="baseSalary"
                                        type="number"
                                        className="pl-10"
                                        value={baseMonthlySalary}
                                        onChange={(e) => setBaseMonthlySalary(Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="otherBonuses">Bonos Regulares</Label>
                                    <Input id="otherBonuses" type="number" value={otherBonuses} onChange={(e) => setOtherBonuses(Number(e.target.value))} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="food">Cestaticket</Label>
                                    <Input id="food" type="number" value={foodAllocation} onChange={(e) => setFoodAllocation(Number(e.target.value))} />
                                </div>
                            </div>

                            <Button className="w-full" variant="outline" onClick={handleSaveSalary} disabled={!selectedEmployeeId || isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Guardar en Perfil
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-orange-200">
                        <CardHeader className="bg-orange-50">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Zap className="h-4 w-4 text-orange-600" /> Parámetros LOTTT
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs">Días Utilidades (Anual)</Label>
                                    <Input type="number" value={utilidadesDays} onChange={e => setUtilidadesDays(Number(e.target.value))} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Días Bono Vac. (Anual)</Label>
                                    <Input type="number" value={vacationBonusDays} onChange={e => setVacationBonusDays(Number(e.target.value))} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-8">
                    <Tabs defaultValue="calculator" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 mb-4 h-12 print:hidden">
                            <TabsTrigger value="calculator" className="gap-2"><Calculator className="h-4 w-4" /> Cálculos</TabsTrigger>
                            <TabsTrigger value="docs" className="gap-2"><FileText className="h-4 w-4" /> Documentos</TabsTrigger>
                            <TabsTrigger value="expert" className="gap-2 bg-purple-50 text-purple-700 data-[state=active]:bg-purple-100"><MessageSquare className="h-4 w-4" /> Guía Experta</TabsTrigger>
                            <TabsTrigger value="history" className="gap-2"><HelpCircle className="h-4 w-4" /> Ayuda Legal</TabsTrigger>
                        </TabsList>

                        <TabsContent value="calculator" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="bg-blue-50/30 border-blue-200">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-md text-blue-900">Salario Normal</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-blue-700">Bs. {normalSalary.toLocaleString()}</div>
                                        <div className="text-sm text-blue-600 mt-1">Diario: Bs. {normalDaily.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-emerald-50/30 border-emerald-200">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-md text-emerald-900">Salario Integral</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-emerald-700">Bs. {integralSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                        <div className="text-sm text-emerald-600 mt-1">Diario: Bs. {integralDaily.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader><CardTitle>Cálculo de Prestaciones Sociales (Referencial)</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <span>Aliquota Mensual de Utilidades</span>
                                        <span className="font-mono">Bs. {utilidadesAliquot.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <span>Aliquota Mensual de Bono Vacacional</span>
                                        <span className="font-mono">Bs. {vacationBonusAliquot.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-4 bg-muted/50 px-4 rounded-lg">
                                        <div className="font-bold">Retroactividad Estimada</div>
                                        <div className="text-2xl font-bold text-primary">Bs. {estimatedPrestaciones.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="hidden print:block space-y-8 mt-12 p-8 border-2 border-slate-300">
                                <div className="text-center space-y-2">
                                    <h2 className="text-xl font-bold">RECIBO DE PAGO DE NÓMINA</h2>
                                    <p className="text-sm uppercase">{selectedEmployee?.name}</p>
                                    <p className="text-xs">C.I: {selectedEmployee?.cedula}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-8 text-sm">
                                    <div className="space-y-1">
                                        <p><strong>Salario Mensual:</strong> Bs. {baseMonthlySalary.toLocaleString()}</p>
                                        <p><strong>Bonos:</strong> Bs. {otherBonuses.toLocaleString()}</p>
                                        <p><strong>Cestaticket:</strong> Bs. {foodAllocation.toLocaleString()}</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p><strong>Total Devengado:</strong> Bs. {(normalSalary + foodAllocation).toLocaleString()}</p>
                                        <p className="mt-4 pt-4 border-t border-slate-400 text-center mx-auto w-48">Firma del Trabajador</p>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="docs" className="space-y-4">
                            <Card>
                                <CardHeader><CardTitle>Documentos Generados</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 border rounded-lg bg-slate-50 relative group">
                                        <Button variant="outline" size="sm" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => window.print()}>
                                            <Download className="h-4 w-4 mr-2" /> Descargar PDF
                                        </Button>
                                        <h3 className="font-bold mb-4 underline">CONSTANCIA DE TRABAJO</h3>
                                        <div className="text-sm space-y-4 text-justify">
                                            <p>Por medio de la presente se hace constar que el ciudadano(a) <strong>{selectedEmployee?.name || "_________________"}</strong>, titular de la Cédula de Identidad N° <strong>{selectedEmployee?.cedula || "__________"}</strong>, trabaja en esta empresa desde el día <strong>{selectedEmployee?.fechaIngreso ? format(new Date(selectedEmployee.fechaIngreso as any), 'dd/MM/yyyy') : "___/___/_____"}</strong>, desempeñando el cargo de <strong>{selectedEmployee?.position || "_________________"}</strong>.</p>
                                            <p>Devengando un salario mensual de <strong>Bs. {baseMonthlySalary.toLocaleString()}</strong>.</p>
                                            <p>Constancia que se expide a petición de la parte interesada en la ciudad de Caracas, a los {format(new Date(), "dd 'días del mes de' MMMM 'de' yyyy", { locale: es })}.</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="expert" className="space-y-4">
                            <Card className="border-purple-200">
                                <CardHeader className="bg-purple-50">
                                    <CardTitle className="flex items-center gap-2 text-purple-900">
                                        <Zap className="h-5 w-5 text-purple-600" /> Inteligencia Legal LOTTT
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Ej: ¿Cuántos días de vacaciones le corresponden a un empleado con 3 años?"
                                            value={aiQuestion}
                                            onChange={(e) => setAiQuestion(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAskExpert()}
                                        />
                                        <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleAskExpert} disabled={isAiLoading}>
                                            {isAiLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Consultar"}
                                        </Button>
                                    </div>

                                    {aiResponse && (
                                        <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-100 animate-in fade-in slide-in-from-bottom-2">
                                            <div className="flex items-start gap-4">
                                                <div className="bg-purple-600 p-2 rounded-lg"><MessageSquare className="h-5 w-5 text-white" /></div>
                                                <div className="space-y-2">
                                                    <p className="text-sm leading-relaxed text-purple-950">{aiResponse.answer}</p>
                                                    {aiResponse.recommendation && (
                                                        <div className="mt-2 p-3 bg-white/50 rounded border border-purple-200 text-xs font-semibold text-purple-800">
                                                            💡 Recomendación: {aiResponse.recommendation}
                                                        </div>
                                                    )}
                                                    {aiResponse.legalArticles && (
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {aiResponse.legalArticles.map(art => (
                                                                <Badge key={art} variant="outline" className="text-[10px] bg-purple-100 border-purple-300">{art}</Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="history">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Glosario de Conceptos Legales</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <h4 className="font-bold text-sm">Salario Normal (Art. 104 LOTTT)</h4>
                                        <p className="text-xs text-muted-foreground">Es la remuneración devengada por el trabajador en forma regular y permanente por la prestación de su servicio.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-bold text-sm">Salario Integral (Art. 122 LOTTT)</h4>
                                        <p className="text-xs text-muted-foreground">Base para el cálculo de las prestaciones sociales. Se compone del salario normal más las alícuotas correspondientes a utilidades y bono vacacional.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-bold text-sm">Utilidades (Art. 131 LOTTT)</h4>
                                        <p className="text-xs text-muted-foreground">Las entidades de trabajo deben distribuir entre sus trabajadores el 15% de los beneficios líquidos. Límite mínimo: 30 días. Límite máximo: 4 meses.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </main>
    );
}
