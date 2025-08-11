export default function TopBar() {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <input
          type="search"
          placeholder="Szukaj…"
          className="w-64 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm
                     placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm
                     hover:bg-slate-50"
        >
          Import
        </button>
        <button
          className="inline-flex items-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white
                     shadow-sm hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        >
          Nowy wpis
        </button>
        <div className="h-8 w-8 rounded-full bg-emerald-200 ring-1 ring-emerald-300" />
      </div>
    </div>
  )
}
