import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

export const metadata: Metadata = {
  title: '💰 DuoProfits - Familia Gómez De La Cruz',
  description: 'Aplicación de finanzas familiares para administrar ingresos, gastos y metas de ahorro en pareja.',
  generator: 'Next.js',
  keywords: ['finanzas', 'pareja', 'gastos', 'ingresos', 'presupuesto', 'ahorro'],
  authors: [{ name: 'DuoProfits Team' }],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-64.svg', sizes: '64x64', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon-64.svg',
  },
  manifest: '/manifest.json',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3b82f6',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="">
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="min-h-screen font-roboto bg-gray-50">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
