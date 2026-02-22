'use client'

import * as React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  attribute?: string
  enableSystem?: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ 
  children, 
  defaultTheme = 'system',
  storageKey = 'theme-preference',
  ...props 
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [mounted, setMounted] = useState(false)

  // On attend que le composant soit monté (côté client)
  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem(storageKey) as Theme | null
    if (savedTheme) setTheme(savedTheme)
  }, [storageKey])

  // On applique le thème au HTML
  useEffect(() => {
    if (!mounted) return
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme, mounted])

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme)
      setTheme(newTheme)
    },
    toggleTheme: () => {
      const next = theme === 'light' ? 'dark' : 'light'
      localStorage.setItem(storageKey, next)
      setTheme(next)
    }
  }

  return (
    <ThemeContext.Provider value={value}>
      {/* IMPORTANT : On rend les enfants même si mounted est false, 
         mais le CONTEXTE est maintenant disponible pour useTheme() 
      */}
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  // On renvoie un objet vide ou par défaut si le contexte n'est pas encore prêt
  // au lieu de throw une erreur qui casse tout le site (Error 500)
  if (!context) {
    return {
      theme: 'light' as Theme,
      setTheme: () => {},
      toggleTheme: () => {}
    }
  }
  return context
}