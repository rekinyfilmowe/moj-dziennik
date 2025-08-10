'use client';

import dynamic from 'next/dynamic';
import type { ChartData, ChartOptions } from 'chart.js';

const Line = dynamic(() => import('react-chartjs-2').then(m => m.Line), { ssr: false });

import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js';
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

type Props = { data: number[]; labels: string[]; };

export default function ActivityChart({ data, labels }: Props) {
  const chartData: ChartData<'line'> = {
    labels,
    datasets: [{ label: 'Aktywność', data, borderWidth: 2, pointRadius: 2, tension: 0.3 }],
  };
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { grid: { display: false } }, y: { beginAtZero: true } },
  };
  return (
    <div className="h-64 rounded-lg border bg-card p-4">
      <div className="text-sm text-muted-foreground mb-2">Aktywność (ostatnie 7 dni)</div>
      <div className="h-[calc(100%-1.5rem)]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
