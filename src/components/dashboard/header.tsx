import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from '@/components/dashboard/user-nav';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <SidebarTrigger />
      <div className="w-full flex-1">
        {/* Can add breadcrumbs or search here */}
      </div>
      <UserNav />
    </header>
  );
}
