
import { UserNav } from '@/components/dashboard/user-nav';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { PanelLeft } from 'lucide-react';
import { MainNav } from './main-nav';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline">
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <MainNav />
          </SheetContent>
        </Sheet>
      </div>
      <div className="w-full flex-1">
        {/* Can add breadcrumbs or search here */}
      </div>
      <UserNav />
    </header>
  );
}
