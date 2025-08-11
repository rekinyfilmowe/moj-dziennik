// app/layout.tsx
import '../styles/globals.css'
import { Inter } from 'next/font/google'
import Header from '@/components/Header'            // ⟵ DODANE
// (opcjonalnie) import Footer from '@/components/ui/Footer'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = { title: 'Dziennik', description: '...' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className={`${inter.variable} font-sans text-neutral-900 bg-white`}>
        <Header />                                     {/* ⟵ DODANE */}
        {children}
        {/* <Footer /> */}                               {/* opcjonalnie */}
      </body>
    </html>
  )
}
