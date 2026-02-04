'use client';

import { OverviewCards } from '@/components/dashboard/overview-cards';
import { TaskCharts } from '@/components/dashboard/task-charts';
import { RecentTasks } from '@/components/dashboard/recent-tasks';
import AIPrioritizer from '@/components/dashboard/ai-prioritizer';
import { TopPerformers } from '@/components/dashboard/top-performers';

import { collection } from 'firebase/firestore';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { InventoryAlerts } from '@/components/dashboard/inventory-alerts';
import type { InventoryItem } from '@/lib/types';

import { AIPurchaseSuggester } from '@/components/dashboard/ai-purchase-suggester';

export default function Page() {
  const firestore = useFirestore();
  const { user } = useUser();

  const inventoryQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'inventory');
  }, [firestore]);

  const { data: inventory, isLoading: isLoadingInventory } = useCollection<InventoryItem>(inventoryQuery, { disabled: !user });

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-2xl font-bold md:text-3xl">
          Dashboard
        </h1>
        <div className="flex gap-2">
          <AIPrioritizer />
          <AIPurchaseSuggester inventoryItems={inventory || []} />
        </div>
      </div>
      <OverviewCards />
      <div className="grid gap-4 md:gap-8 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <TaskCharts />
            </div>
            <TopPerformers />
          </div>
        </div>
        <div className="space-y-4">
          <InventoryAlerts items={inventory || []} isLoading={isLoadingInventory} />
        </div>
      </div>
      <RecentTasks />
    </main>
  );
}
