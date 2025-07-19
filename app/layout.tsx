import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3b82f6',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://duoprofits.info'),
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
  openGraph: {
    title: '💰 DuoProfits - Familia Gómez De La Cruz',
    description: 'Administra tus finanzas en pareja con DuoProfits. Gestiona ingresos, gastos, estadísticas y metas de ahorro de manera fácil y visual.',
    url: 'https://duoprofits.info',
    siteName: 'DuoProfits - Finanzas Familiares',
    images: [
      {
        url: '/fp.png',
        width: 1200,
        height: 630,
        alt: 'DuoProfits - Gestión Financiera para Parejas',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '💰 DuoProfits - Familia Gómez De La Cruz',
    description: 'Aplicación de finanzas familiares para administrar ingresos, gastos y metas de ahorro en pareja.',
    images: ['/fp.png'],
  },
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
