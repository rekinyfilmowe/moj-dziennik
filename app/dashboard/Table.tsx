type Row = { title: string; date: string; tag?: string };

export default function Table({ rows }: { rows: Row[] }) {
  return (
    <div className="rounded-lg border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="text-left px-3 py-2">Tytuł</th>
            <th className="text-left px-3 py-2">Data</th>
            <th className="text-left px-3 py-2">Tag</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t">
              <td className="px-3 py-2">{r.title}</td>
              <td className="px-3 py-2 text-muted-foreground">{r.date}</td>
              <td className="px-3 py-2">
                {r.tag && <span className="px-2 py-1 rounded-md border text-xs">{r.tag}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div className="p-6 text-sm text-muted-foreground">Brak danych do wyświetlenia.</div>
      )}
    </div>
  );
}
