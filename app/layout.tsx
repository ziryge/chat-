import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navigation } from '@/components/navigation'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Devsquare',
  description: 'Where developers connect and build together',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>
        <Navigation />
        <main className="min-h-screen bg-black">
          {children}
        </main>
        <script
          async
          src="https://www.instagram.com/embed.js"
        ></script>
      </body>
    </html>
  )
}
