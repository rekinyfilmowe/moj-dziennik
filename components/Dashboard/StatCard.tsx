type Props = {
  label: string;
  value: string | number;
  help?: string;
};

export function StatCard({ label, value, help }: Props) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {help && <div className="mt-2 text-xs text-muted-foreground">{help}</div>}
    </div>
  );
}
