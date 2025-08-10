import Container from '@/components/Container'
import Section from '@/components/Section'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Button from '@/components/Button'
import Card from '@/components/Card'

export default function Page() {
  return (
    <>
      <Header />
      <main>
        <Section className="bg-muted">
          <Container className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Nagłówek z Figmy
              </h1>
              <p className="mt-4 text-lg text-neutral-600">
                Lead/opis zgodnie z typografią i spacingiem z Figmy.
              </p>
              <div className="mt-6 flex gap-4">
                <Button>Primary CTA</Button>
                <Button variant="ghost">Dowiedz się więcej</Button>
              </div>
            </div>
            <div className="aspect-[4/3] w-full rounded-xl bg-white/50 border border-neutral-200" />
          </Container>
        </Section>

        <Section id="features">
          <Container>
            <h2 className="text-2xl md:text-3xl font-semibold">Funkcje</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <Card><h3 className="font-medium">Feature 1</h3><p className="mt-2 text-neutral-600">Opis…</p></Card>
              <Card><h3 className="font-medium">Feature 2</h3><p className="mt-2 text-neutral-600">Opis…</p></Card>
              <Card><h3 className="font-medium">Feature 3</h3><p className="mt-2 text-neutral-600">Opis…</p></Card>
            </div>
          </Container>
        </Section>

        <Section id="pricing" className="bg-muted">
          <Container>
            <h2 className="text-2xl md:text-3xl font-semibold">Cennik</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <Card><h3 className="font-medium">Free</h3><p className="mt-2 text-neutral-600">…</p><Button className="mt-4 w-full">Wybieram</Button></Card>
              <Card className="border-primary/30"><h3 className="font-medium">Pro</h3><p className="mt-2 text-neutral-600">…</p><Button className="mt-4 w-full">Wybieram</Button></Card>
              <Card><h3 className="font-medium">Team</h3><p className="mt-2 text-neutral-600">…</p><Button className="mt-4 w-full">Wybieram</Button></Card>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  )
}
