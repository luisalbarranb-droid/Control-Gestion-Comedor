import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Header } from '@/components/dashboard/header';
import { MainNav } from '@/components/dashboard/main-nav';
import { OverviewCards } from '@/components/dashboard/overview-cards';
import { TaskCharts } from '@/components/dashboard/task-charts';
import { RecentTasks } from '@/components/dashboard/recent-tasks';
import { Bot, Home, Settings, SquareCheck, Users } from 'lucide-react';
import AIPrioritizer from '@/components/dashboard/ai-prioritizer';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  return (
    <div className="min-h-screen w-full">
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader className="p-4 justify-center flex items-center gap-2">
          <SquareCheck className="size-8 text-primary" />
          <h1 className="font-headline text-2xl font-bold group-data-[collapsible=icon]:hidden">
            Comedor
          </h1>
        </SidebarHeader>
        <SidebarContent>
          <MainNav />
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center justify-between">
            <h1 className="font-headline text-2xl font-bold md:text-3xl">
              Dashboard
            </h1>
            <AIPrioritizer />
          </div>
          <OverviewCards />
          <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
            <TaskCharts />
          </div>
          <RecentTasks />
        </main>
      </SidebarInset>
    </div>
  );
}
