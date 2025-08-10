type Props = { className?: string; children: React.ReactNode }
export default function Card({ className='', children }: Props) {
  return <div className={`rounded-xl border border-neutral-200 bg-white p-6 shadow-sm ${className}`}>{children}</div>
}
