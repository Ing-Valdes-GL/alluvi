import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '../components/ThemeProvider' // Utilise l'import relatif sans src

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.className} bg-white dark:bg-gray-900 transition-colors`}>
        {/* On passe les props qui causent le "rouge" actuellement */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}