// app/dashboard/layout.tsx
import type { ReactNode } from 'react';
import Sidebar from '@/components/Dashboard/Sidebar';
import TopBar from '@/components/Dashboard/TopBar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground lg:grid lg:grid-cols-[18rem_1fr]">
      <Sidebar />
      <div className="min-h-dvh">
        <TopBar />
        <main className="p-4 lg:p-6 space-y-6">{children}</main>
      </div>
    </div>
  );
}
