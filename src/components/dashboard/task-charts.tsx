'use client';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
  Tooltip,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { useMemo, useState, useEffect } from 'react';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { useMultiTenant } from '@/providers/multi-tenant-provider';
import type { Task, User } from '@/lib/types';
import { Loader2, AlertCircle } from 'lucide-react';

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function TaskCharts() {
  const [isClient, setIsClient] = useState(false);
  const firestore = useFirestore();
  const { user } = useUser();
  const { activeComedorId } = useMultiTenant();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const tasksQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const baseRef = collection(firestore, 'tasks');
    return activeComedorId
      ? query(baseRef, where('comedorId', '==', activeComedorId))
      : baseRef;
  }, [firestore, activeComedorId]);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const baseRef = collection(firestore, 'users');
    return activeComedorId
      ? query(baseRef, where('comedorId', '==', activeComedorId))
      : baseRef;
  }, [firestore, activeComedorId]);

  const { data: tasks, isLoading: isLoadingTasks, error: tasksError } = useCollection<Task>(tasksQuery, { disabled: !user });
  const { data: users, isLoading: isLoadingUsers } = useCollection<User>(usersQuery, { disabled: !user });

  const { chartData, pieData } = useMemo(() => {
    if (!tasks || !users) return { chartData: [], pieData: [] };

    // 1. Efficiency per User (Limit to top 10 for chart readability)
    const userStats: Record<string, { completed: number, total: number, name: string }> = {};

    // 2. Task Distribution per Area
    const areaStats: Record<string, number> = {};
    tasks.forEach(task => {
      // Safety check for assigned user
      if (task.asignadoA) {
        if (!userStats[task.asignadoA]) {
          const foundUser = users.find(u => u.id === task.asignadoA);
          userStats[task.asignadoA] = { completed: 0, total: 0, name: foundUser?.name || 'Desconocido' };
        }
        userStats[task.asignadoA].total++;
        if (task.estado === 'completada' || task.estado === 'verificada') {
          userStats[task.asignadoA].completed++;
        }
      }

      // Safety check for area - ensure it's a string and not empty
      if (task.area && typeof task.area === 'string') {
        const areaLabel = task.area.charAt(0).toUpperCase() + task.area.slice(1);
        areaStats[areaLabel] = (areaStats[areaLabel] || 0) + 1;
      } else {
        areaStats['Sin Área'] = (areaStats['Sin Área'] || 0) + 1;
      }
    });

    const efficiencyData = Object.values(userStats)
      .filter(stat => stat.total > 0)
      .map(stat => ({
        name: stat.name,
        eficiencia: Math.round((stat.completed / stat.total) * 100),
      }))
      .sort((a, b) => b.eficiencia - a.eficiencia)
      .slice(0, 10);

    const distributionData = Object.entries(areaStats).map(([name, value], index) => ({
      name,
      value,
      fill: COLORS[index % COLORS.length],
    }));

    return { chartData: efficiencyData, pieData: distributionData };
  }, [tasks, users]);

  const chartConfigBar = {
    eficiencia: {
      label: 'Eficiencia',
      color: 'hsl(var(--primary))',
    },
  };

  const chartConfigPie = useMemo(() => {
    const config: any = {
      value: { label: 'Tareas' }
    };
    pieData.forEach(item => {
      config[item.name] = { label: item.name, color: item.fill };
    });
    return config;
  }, [pieData]);

  const isLoading = isLoadingTasks || isLoadingUsers || !isClient;

  if (tasksError) {
    return (
      <Card className="col-span-2">
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <div className="text-center">
            <p className="font-semibold text-destructive">Error al cargar datos del gráfico</p>
            <p className="text-sm text-muted-foreground">{tasksError.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:gap-8 lg:grid-cols-2 lg:col-span-2">
      <Card>
        <CardHeader>
          <CardTitle>Eficiencia por Usuario</CardTitle>
          <CardDescription>
            {activeComedorId ? 'Rendimiento en esta sede.' : 'Rendimiento global del equipo.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          {isLoading ? (
            <div className="h-[300px] w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : chartData.length > 0 ? (
            <ChartContainer config={chartConfigBar} className="h-[300px] w-full">
              <ResponsiveContainer>
                <BarChart data={chartData} accessibilityLayer>
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Bar
                    dataKey="eficiencia"
                    fill="var(--color-eficiencia)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground text-sm">No hay datos para mostrar</div>
          )}
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Distribución por Área</CardTitle>
          <CardDescription>
            Volumen de tareas por departamento.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          {isLoading ? (
            <div className="h-full min-h-[300px] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : pieData.length > 0 ? (
            <ChartContainer
              config={chartConfigPie}
              className="mx-auto aspect-square h-full max-h-[300px]"
            >
              <ResponsiveContainer>
                <PieChart>
                  <Tooltip
                    content={<ChartTooltipContent nameKey="name" hideLabel />}
                  />
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                    const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
                    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                    return (
                      <text x={x} y={y} fill="currentColor" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-[10px] font-medium">
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend
                    content={<ChartLegendContent nameKey="name" />}
                    className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="h-full min-h-[300px] flex items-center justify-center text-muted-foreground text-sm">No hay datos registrados</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
