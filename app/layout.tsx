import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dental Analytics Dashboard',
  description: 'Professional dental clinic analytics and patient management dashboard',
  keywords: 'dental, analytics, dashboard, patient management, insurance claims',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50 dark:bg-gray-900`}>
        <div id="root" className="h-full">
          {children}
        </div>
      </body>
    </html>
  )
}
