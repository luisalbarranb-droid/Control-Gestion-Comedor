
'use client';

import { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Header } from '@/components/dashboard/header';
import { MainNav } from '@/components/dashboard/main-nav';
import { SquareCheck, Users, ClipboardCheck, Clock, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer, Pie, PieChart, Cell } from 'recharts';

import { addDays, format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { stats as placeholderStats } from '@/lib/placeholder-data';


const efficiencyByAreaData = [
    { name: 'Cocina', efficiency: 88, fill: 'var(--color-chart-1)' },
    { name: 'Servicio', efficiency: 92, fill: 'var(--color-chart-2)' },
    { name: 'Limpieza', efficiency: 85, fill: 'var(--color-chart-3)' },
    { name: 'Almacén', efficiency: 95, fill: 'var(--color-chart-4)' },
    { name: 'Equipos', efficiency: 80, fill: 'var(--color-chart-5)' },
]

const workloadByUserData = [
    { name: 'Carlos R.', tasks: 15, fill: 'var(--color-chart-1)' },
    { name: 'María F.', tasks: 12, fill: 'var(--color-chart-2)' },
    { name: 'José M.', tasks: 18, fill: 'var(--color-chart-3)' },
    { name: 'Ana G.', tasks: 8, fill: 'var(--color-chart-4)' },
    { name: 'Luis P.', tasks: 10, fill: 'var(--color-chart-5)' },
]

const KPI_CARDS = [
  {
    title: 'Eficiencia General',
    value: `${placeholderStats.eficiencia.toFixed(1)}%`,
    description: '+5% vs. mes anterior',
    icon: TrendingUp,
  },
  {
    title: 'Tareas Completadas',
    value: placeholderStats.completadas,
    description: 'En el período seleccionado',
    icon: ClipboardCheck,
  },
  {
    title: 'Tareas Pendientes',
    value: placeholderStats.pendientes,
    description: 'Actualmente abiertas',
    icon: Clock,
  },
  {
    title: 'Usuarios Activos',
    value: 5,
    description: 'Que completaron tareas',
    icon: Users,
  },
];


export default function StatsPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2024, 4, 1),
    to: addDays(new Date(2024, 4, 1), 30),
  });

  return (
    <div className="min-h-screen w-full">
      <Sidebar>
        <SidebarHeader className="p-4 justify-center flex items-center gap-2">
          <SquareCheck className="size-8 text-primary" />
          <h1 className="font-headline text-2xl font-bold">Comedor</h1>
        </SidebarHeader>
        <SidebarContent>
          <MainNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="font-headline text-2xl font-bold md:text-3xl">
              Estadísticas
            </h1>
            <div className="flex items-center gap-2">
                <Popover>
                <PopoverTrigger asChild>
                    <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                        "w-full md:w-[300px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                    )}
                    >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                        date.to ? (
                        <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                        </>
                        ) : (
                        format(date.from, "LLL dd, y")
                        )
                    ) : (
                        <span>Selecciona un rango</span>
                    )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                    />
                </PopoverContent>
                </Popover>
                <Button>Aplicar</Button>
            </div>
          </div>
          
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {KPI_CARDS.map(kpi => (
                <Card key={kpi.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                        <kpi.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpi.value}</div>
                        <p className="text-xs text-muted-foreground">{kpi.description}</p>
                    </CardContent>
                </Card>
            ))}
          </div>

          <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Eficiencia por Área</CardTitle>
                <CardDescription>
                  Porcentaje de tareas completadas a tiempo por área.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-[300px] w-full">
                    <ResponsiveContainer>
                        <BarChart data={efficiencyByAreaData} margin={{ top: 20, right: 20, bottom: 5, left: -20 }}>
                           <CartesianGrid vertical={false} />
                            <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#888888" fontSize={12} />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                            <Bar dataKey="efficiency" radius={[4, 4, 0, 0]}>
                                {efficiencyByAreaData.map(entry => (
                                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Carga de Trabajo por Usuario</CardTitle>
                <CardDescription>
                  Número de tareas asignadas a cada usuario en el período.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-[300px] w-full">
                    <ResponsiveContainer>
                        <BarChart data={workloadByUserData} layout="vertical" margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                           <CartesianGrid horizontal={false} />
                            <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} stroke="#888888" fontSize={12} width={80} />
                            <XAxis type="number" dataKey="tasks" hide />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                            <Bar dataKey="tasks" layout="vertical" radius={[0, 4, 4, 0]}>
                                 {workloadByUserData.map(entry => (
                                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

          </div>
        </main>
      </SidebarInset>
    </div>
  );
}
