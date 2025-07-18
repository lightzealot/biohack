import { Metadata } from "next";

export const metadata: Metadata = {
  title: "DuoProfits - Gestión Financiera",
  description: "Administra tus finanzas en pareja con DuoProfits.",
  openGraph: {
    title: "DuoProfits - Gestión Financiera",
    description: "Administrando nuestras finanzas en pareja con DuoProfits.",
    url: "https://duoprofits.info",
    siteName: "DuoProfits",
    images: [
      {
        url: "https://duoprofits.info/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "DuoProfits - Gestión Financiera",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
};