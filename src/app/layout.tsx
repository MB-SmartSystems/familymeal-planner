import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FamilyMeal Planner - Intelligente Wochenplanung',
  description: 'Erstelle intelligente Wochenpläne mit 100+ deutschen Familienrezepten. Berücksichtigt Präferenzen, Kochzeit und Ausgewogenheit.',
  keywords: ['Wochenplanung', 'Rezepte', 'Familie', 'deutsche Küche', 'Meal Prep'],
  authors: [{ name: 'MB SmartSystems' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}