import React from 'react'
import Sidebar from '@/components/Dashboard/Sidebar'
import TopBar from '@/components/Dashboard/TopBar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh grid grid-cols-[260px_1fr] bg-emerald-50/30 text-slate-800">
      {/* Sidebar */}
      <aside className="hidden md:block">
        <div className="sticky top-0 h-dvh overflow-y-auto border-r border-slate-200 bg-white">
          <Sidebar />
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="px-4 py-3">
            <TopBar />
          </div>
        </header>

        <main className="px-4 md:px-6 py-6">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
