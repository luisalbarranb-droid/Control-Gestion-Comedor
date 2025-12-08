'use client';

import React from 'react';
import { SidebarContext } from './sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const value = React.useMemo(() => ({ isMobile }), [isMobile]);

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}
