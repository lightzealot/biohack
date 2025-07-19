import { Metadata } from "next";

export const metadata: Metadata = {
  title: "💰 DuoProfits - Familia Gómez De La Cruz",
  description: "Aplicación de finanzas familiares para administrar ingresos, gastos y metas de ahorro en pareja.",
  openGraph: {
    title: "💰 DuoProfits - Familia Gómez De La Cruz",
    description: "Administra tus finanzas en pareja con DuoProfits. Gestiona ingresos, gastos, estadísticas y metas de ahorro de manera fácil y visual.",
    url: "https://duoprofits.info",
    siteName: "DuoProfits - Finanzas Familiares",
    images: [
      {
        url: "/fp.png",
        width: 1200,
        height: 630,
        alt: "DuoProfits - Gestión Financiera para Parejas",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "💰 DuoProfits - Familia Gómez De La Cruz",
    description: "Aplicación de finanzas familiares para administrar ingresos, gastos y metas de ahorro en pareja.",
    images: ["/fp.png"],
  },
};