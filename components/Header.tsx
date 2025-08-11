// components/Header.tsx
export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-border">
      <div className="container flex items-center justify-between h-16">
        import Image from 'next/image'
import Link from 'next/link'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo-frajdo.png"  // ścieżka względem public/
            alt="Frajdo"
            width={32}
            height={32}
            priority
          />
          <span className="text-lg font-semibold text-ink">Frajdo</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm">
          <a className="hover:text-ink" href="#funkcje">Funkcje</a>
          <a className="hover:text-ink" href="#cennik">Cennik</a>
          <a className="hover:text-ink" href="#kontakt">Kontakt</a>
        </nav>

        <div className="flex items-center gap-3">
          <a className="btn-ghost">Zaloguj</a>
          <a className="btn-primary">Załóż konto</a>
        </div>
      </div>
    </header>
  )
}

        <nav className="hidden md:flex items-center gap-8 text-sm">
          <a className="hover:text-ink">Funkcje</a>
          <a className="hover:text-ink">Cennik</a>
          <a className="hover:text-ink">Kontakt</a>
        </nav>
        <div className="flex items-center gap-3">
          <a className="btn-ghost">Zaloguj</a>
          <a className="btn-primary">Załóż konto</a>
        </div>
      </div>
    </header>
  );
}
