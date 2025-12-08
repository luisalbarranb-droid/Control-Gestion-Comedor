'use client';

import { OverviewCards } from '@/components/dashboard/overview-cards';
import { TaskCharts } from '@/components/dashboard/task-charts';
import { RecentTasks } from '@/components/dashboard/recent-tasks';
import AIPrioritizer from '@/components/dashboard/ai-prioritizer';
import { TopPerformers } from '@/components/dashboard/top-performers';

export default function Page() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-2xl font-bold md:text-3xl">
          Dashboard
        </h1>
        {/* <AIPrioritizer /> */}
      </div>
      {/* <OverviewCards /> */}
      {/* <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
        <TaskCharts />
        <TopPerformers />
      </div> */}
      {/* <RecentTasks /> */}
    </main>
  );
}
