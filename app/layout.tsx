import './globals.css'
import { Inter } from 'next/font/google'
import { Metadata } from 'next'
import { ThemeProvider } from '../components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

// Configuration SEO et Partage Social
export const metadata: Metadata = {
  title: {
    default: "Vertex Biolabs | Advanced Pharmaceutical Research",
    template: "%s | Vertex Biolabs"
  },
  description: "Vertex Biolabs provides cutting-edge pharmaceutical research and development with secure logistics across the UK.",
  metadataBase: new URL('https://alluvihealth.store'),
  
  // Apparence dans Google (Outcome)
  alternates: {
    canonical: '/',
  },

  // Partage sur WhatsApp, Facebook, LinkedIn (Open Graph)
  openGraph: {
    title: "Vertex Biolabs | Advanced Research",
    description: "Cutting-edge pharmaceutical research and development services.",
    url: 'https://alluvihealth.store',
    siteName: 'Vertex Biolabs',
    images: [
      {
        url: '/favicon.ico', // Place ce fichier dans ton dossier /public
        width: 1200,
        height: 630,
        alt: 'Vertex Biolabs Logo',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },

  // Partage sur Twitter / X
  twitter: {
    card: 'summary_large_image',
    title: 'Vertex Biolabs',
    description: 'Advanced Pharmaceutical Research.',
    images: ['/logo-share.png'],
  },

  // Icônes du navigateur
  icons: {
    icon: '/hero-left-arch.png',
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