import './globals.css'
import { Inter } from 'next/font/google'
import { Metadata } from 'next'
import { ThemeProvider } from '../components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

// Configuration SEO et Partage Social
export const metadata: Metadata = {
  title: {
    default: "Alluvi Health-Care | Secured Pharmaceutical Logistics",
    template: "%s | Alluvi Health-Care"
  },
  description: "Alluvi Health-Care provides safe, discreet, and professional pharmaceutical delivery services across the UK.",
  metadataBase: new URL('https://alluvihealth.store'),
  
  // Apparence dans Google (Outcome)
  alternates: {
    canonical: '/',
  },

  // Partage sur WhatsApp, Facebook, LinkedIn (Open Graph)
  openGraph: {
    title: "Alluvi Health-Care | Secured Logistics",
    description: "Professional and discreet pharmaceutical delivery services.",
    url: 'https://alluvihealth.store',
    siteName: 'Alluvi Health-Care',
    images: [
      {
        url: '/logo-share.png', // Place ce fichier dans ton dossier /public
        width: 1200,
        height: 630,
        alt: 'Alluvi Health-Care Logo',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },

  // Partage sur Twitter / X
  twitter: {
    card: 'summary_large_image',
    title: 'Alluvi Health-Care',
    description: 'Secured Pharmaceutical Logistics.',
    images: ['/logo-share.png'],
  },

  // Icônes du navigateur
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-white dark:bg-gray-900 transition-colors`}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="light" 
          enableSystem 
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}