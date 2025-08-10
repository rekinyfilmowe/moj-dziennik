type Props = { className?: string; children: React.ReactNode; id?: string }
export default function Section({ className = '', children, id }: Props) {
  return <section id={id} className={`py-12 md:py-20 ${className}`}>{children}</section>
}
