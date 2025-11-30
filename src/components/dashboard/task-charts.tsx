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
import { stats } from '@/lib/placeholder-data';

const chartConfigBar = {
  eficiencia: {
    label: 'Eficiencia',
    color: 'hsl(var(--primary))',
  },
};

const chartConfigPie = {
  value: {
    label: 'Tareas',
  },
  ...stats.pieData.reduce((acc, cur) => {
    acc[cur.name] = { label: cur.name, color: cur.fill };
    return acc;
  }, {}),
};

export function TaskCharts() {
  return (
    <>
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Eficiencia por Usuario</CardTitle>
          <CardDescription>
            Tareas completadas vs. asignadas en el último ciclo.
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ChartContainer config={chartConfigBar} className="h-[300px] w-full">
            <ResponsiveContainer>
              <BarChart data={stats.chartData} accessibilityLayer>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
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
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Distribución de Tareas por Área</CardTitle>
          <CardDescription>
            Volumen de tareas asignadas a cada área.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfigPie}
            className="mx-auto aspect-square h-full max-h-[300px]"
          >
            <ResponsiveContainer>
              <PieChart>
                <Tooltip
                  content={<ChartTooltipContent nameKey="name" hideLabel />}
                />
                <Pie data={stats.pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                    const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
                    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                    return (
                        <text x={x} y={y} fill="currentColor" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs">
                        {`${(percent * 100).toFixed(0)}%`}
                        </text>
                    );
                }}>
                  {stats.pieData.map((entry, index) => (
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
        </CardContent>
      </Card>
    </>
  );
}
