import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Business Automation Dashboard - Monitoreo de Workflows",
  description: "Dashboard profesional para monitorear y gestionar workflows de automatización empresarial en tiempo real",
  keywords: ["automation", "workflows", "dashboard", "n8n", "business", "analytics"],
  authors: [{ name: "Tu Nombre" }],
  creator: "Tu Nombre",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}