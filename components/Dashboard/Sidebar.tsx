'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils'; // jeśli nie masz, zamień na prostą konkatenację klas

const NAV = [
  { href: '/dashboard', label: 'Pulpit' },
  { href: '/dashboard/lessons', label: 'Lekcja' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* mobile top bar for toggling sidebar */}
      <div className="lg:hidden sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="h-14 px-3 flex items-center justify-between">
          <button
            aria-label="Otwórz menu"
            onClick={() => setOpen(true)}
            className="px-2 py-1 rounded-md border"
          >
            ☰
          </button>
          <span className="font-medium">Dziennik</span>
          <div className="w-8" />
        </div>
      </div>

      {/* drawer */}
      <div
        aria-hidden={!open}
        className={cn(
          'fixed inset-0 bg-black/40 z-40 lg:hidden',
          open ? 'block' : 'hidden'
        )}
        onClick={() => setOpen(false)}
      />
      <aside
        className={cn(
          'fixed z-50 inset-y-0 left-0 w-72 bg-card border-r lg:static transform transition-transform',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        role="navigation"
        aria-label="Główna nawigacja"
      >
        <div className="h-14 border-b flex items-center px-4 font-semibold">Dziennik</div>
        <nav className="p-2 space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'block px-3 py-2 rounded-md text-sm hover:bg-muted',
                  active && 'bg-muted font-medium'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
