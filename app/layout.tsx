import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google" // Import Inter font
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Toaster } from "@/components/ui/toaster" // Import Toaster for toasts

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" }) // Configure Inter font

export const metadata: Metadata = {
  title: "Rentify - Endless Options, One Rent",
  description: "Rent furniture, appliances, electronics, and more with flexible terms and a premium experience.",
    generator: 'Team75'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="flex flex-col min-h-screen">
            <Header />
            {children}
            <Footer />
          </div>
          <Toaster /> {/* Add Toaster component here */}
        </ThemeProvider>
      </body>
    </html>
  )
}
