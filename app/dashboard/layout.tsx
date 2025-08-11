import React from 'react'
import Sidebar from '@/components/Dashboard/Sidebar'
import TopBar from '@/components/Dashboard/TopBar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh grid grid-cols-1 md:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside className="hidden md:block border-r border-black/5 dark:border-white/10 bg-[rgb(var(--card))]">
        <div className="sticky top-0 h-dvh overflow-y-auto p-4">
          <Sidebar />
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col min-w-0">
        <header className="sticky top-0 z-20 border-b border-black/5 dark:border-white/10 bg-[rgb(var(--card))]/80 backdrop-blur">
          <div className="px-4 py-3">
            <TopBar />
          </div>
        </header>

        <main className="px-4 md:px-6 py-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
