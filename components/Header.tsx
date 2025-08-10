import Container from './Container'
export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full border-b border-neutral-200 bg-white z-50">
      <Container className="py-4 flex items-center justify-between">
        <div className="text-lg font-semibold">Dziennik</div>
        <nav className="hidden md:flex gap-6">
          <a href="#features" className="hover:opacity-80">Funkcje</a>
          <a href="#pricing" className="hover:opacity-80">Cennik</a>
          <a href="/login" className="hover:opacity-80">Logowanie</a>
        </nav>
      </Container>
    </header>
  )
}
