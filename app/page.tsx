import Container from '@/components/Container'
import Section from '@/components/Section'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Button from '@/components/Button'
import Card from '@/components/Card'

// app/page.tsx (sekcja startowa)
export default function Page() {
  return (
    <main>
      <section className="section">
        <div className="container">
          <div className="card p-8 md:p-12 bg-gradient-to-br from-white to-lime/30">
            <span className="badge bg-mint/60 text-ink/80">Nowoczesny i prosty</span>
            <h1 className="mt-4 max-w-3xl text-4xl md:text-6xl font-bold leading-tight text-ink">
              Twój dziennik — poukładany, lekki i zielony 🌿
            </h1>
            <p className="lead mt-4 max-w-2xl">
              Notuj myśli, śledź nawyki i patrz na postępy. Bez rozpraszaczy.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <a className="btn-primary">Wypróbuj za darmo</a>
              <a className="btn-ghost">Zobacz demo</a>
            </div>
          </div>
        </div>
      </section>
      <section id="funkcje" className="section">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold text-ink">Funkcje</h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {t:'Codzienne wpisy',d:'Tagi, emoji i wyszukiwarka.'},
              {t:'Nawyki',d:'Prosty tracker z wykresami.'},
              {t:'Prywatność',d:'Twoje dane — Twój wybór.'},
            ].map((f,i)=>(
              <article key={i} className="card p-6">
                <h3 className="text-lg font-semibold text-ink">{f.t}</h3>
                <p className="mt-2 text-slate-600">{f.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id="cennik" className="section">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-ink">Cennik</h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <article className="card p-6">
              <h3 className="text-xl font-semibold text-ink">Free</h3>
              <p className="text-slate-600 mt-1">Podstawowe funkcje</p>
              <ul className="mt-6 space-y-2 text-sm text-slate-700">
                <li>• 100 wpisów / mies.</li>
                <li>• 1 tracker nawyków</li>
              </ul>
              <a className="btn-ghost mt-6">Wybieram</a>
            </article>
            <article className="card p-6 ring-4 ring-mint/60">
              <h3 className="text-xl font-semibold text-ink">Pro</h3>
              <p className="text-slate-600 mt-1">Więcej mocy i bez limitów</p>
              <ul className="mt-6 space-y-2 text-sm text-slate-700">
                <li>• Nielimitowane wpisy</li>
                <li>• Zaawansowane statystyki</li>
                <li>• Eksport</li>
              </ul>
              <a className="btn-primary mt-6">Wybieram</a>
            </article>
          </div>
        </div>
      </section>
      <footer className="border-t border-border">
        <div className="container py-8 text-sm text-slate-600">
          © {new Date().getFullYear()} Dziennik
        </div>
      </footer>
    </main>
  );
}
