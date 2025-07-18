import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Finanzas en Pareja',
  description: 'Administrando nuestras finanzas en pareja.',
  generator: 'Ag-iA',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
