type Props = { className?: string; children: React.ReactNode }
export default function Container({ className = '', children }: Props) {
  return <div className={`mx-auto w-full max-w-6xl px-6 md:px-10 ${className}`}>{children}</div>
}
