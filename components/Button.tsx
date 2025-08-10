type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
  asChild?: boolean
}
export default function Button({ variant='primary', className='', ...rest }: Props) {
  const base = 'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition';
  const variants = {
    primary: 'bg-primary text-white hover:opacity-90',
    secondary: 'bg-secondary text-white hover:opacity-90',
    ghost: 'bg-transparent border border-neutral-300 hover:bg-neutral-50',
  } as const;
  return <button className={`${base} ${variants[variant]} ${className}`} {...rest} />
}
