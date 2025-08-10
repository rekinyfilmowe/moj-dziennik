import Container from './Container'
export default function Footer() {
  return (
    <footer className="border-t border-neutral-200">
      <Container className="py-8 text-sm text-neutral-500">
        © {new Date().getFullYear()} Dziennik — wszelkie prawa zastrzeżone.
      </Container>
    </footer>
  )
}
