'use client'

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  ShoppingCart, Search, Sun, Moon, Menu, X, 
  Home, Package, MessageCircle, ShieldCheck, ClipboardList 
} from "lucide-react"
import { useTheme } from "./ThemeProvider"
import { supabase } from "@/lib/supabase"

export default function Header() {
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  // --- ÉTAT DU PANIER ---
  const [cartCount, setCartCount] = useState(0)

  // 1. Fonction pour calculer le nombre total d'articles
  const updateCartBadge = () => {
    if (typeof window !== 'undefined') {
      const savedCart = JSON.parse(localStorage.getItem('cart') || '[]')
      const totalItems = savedCart.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0)
      setCartCount(totalItems)
    }
  }

  useEffect(() => {
    // Initialisation au montage
    updateCartBadge()

    // Écouter l'événement personnalisé déclenché par la page Cart ou Products
    window.addEventListener('cart-updated', updateCartBadge)
    
    // Écouter les changements venant d'autres onglets
    window.addEventListener('storage', updateCartBadge)

    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single()
        
        const isEmailAdmin = session.user.email === 'doungmolagoungvaldes@gmail.com'
        setIsAdmin(!!profile?.is_admin || isEmailAdmin)
      }
    }

    checkAdmin()

    // Nettoyage des écouteurs
    return () => {
      window.removeEventListener('cart-updated', updateCartBadge)
      window.removeEventListener('storage', updateCartBadge)
    }
  }, [])

  const navLinks = [
    { name: "Home", href: "/home", icon: Home },
    { name: "Products", href: "/products", icon: Package },
    { name: "My Orders", href: "/orders", icon: ClipboardList },
    { name: "Support", href: "/chat", icon: MessageCircle },
  ]

  return (
    <header className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
      theme === 'dark' ? 'bg-black/80 border-white/5 text-white' : 'bg-white/90 border-gray-100 text-gray-900'
    } backdrop-blur-md`}>
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/home" className="flex flex-col items-start group">
          <span className="text-2xl font-black tracking-tighter leading-none group-hover:text-brand-primary transition-colors">
            ALLUVI<span className="text-brand-primary italic">.</span>
          </span>
          <span className="text-[8px] font-black tracking-[0.3em] uppercase opacity-40">HEALTH CARE</span>
        </Link>

        {/* NAVIGATION CENTRALE */}
        <nav className="hidden lg:flex items-center bg-gray-500/5 p-1.5 rounded-2xl border border-white/5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  isActive 
                    ? 'text-brand-primary bg-brand-primary/10 shadow-sm' 
                    : 'opacity-40 hover:opacity-100 hover:bg-white/5'
                }`}
              >
                <link.icon size={14} className={isActive ? 'text-brand-primary' : ''} />
                {link.name}
              </Link>
            )
          })}

          {isAdmin && (
            <Link
              href="/admin"
              className="ml-2 flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-brand-primary/30 text-brand-primary bg-brand-primary/5 hover:bg-brand-primary hover:text-white transition-all animate-pulse hover:animate-none"
            >
              <ShieldCheck size={14} />
              Admin Panel
            </Link>
          )}
        </nav>

        {/* ICONES DE DROITE */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 mr-2 px-3 py-1.5 bg-gray-500/5 rounded-full border border-white/5">
            

            {/* BADGE ACTUALISÉ ICI */}
            <Link href="/cart" className="p-2 rounded-full hover:bg-white/10 transition-colors relative group">
              <ShoppingCart size={18} className="opacity-50 group-hover:opacity-100 transition-opacity" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-brand-primary text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          <button
            onClick={toggleTheme}
            className={`p-3 rounded-xl transition-all border ${
              theme === 'dark' 
                ? 'bg-white/5 border-white/10 text-yellow-400 hover:bg-yellow-400/10' 
                : 'bg-gray-100 border-gray-200 text-indigo-600 hover:bg-indigo-600/10'
            }`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button 
            className="lg:hidden p-3 rounded-xl bg-brand-primary text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* MENU MOBILE */}
      {isMenuOpen && (
        <div className={`lg:hidden absolute top-full left-0 w-full border-b p-6 space-y-3 animate-in fade-in slide-in-from-top-2 shadow-2xl ${
          theme === 'dark' ? 'bg-black border-white/10' : 'bg-white border-gray-100'
        }`}>
          {[...navLinks, ...(isAdmin ? [{ name: "Admin Panel", href: "/admin", icon: ShieldCheck }] : [])].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center gap-4 p-4 rounded-2xl font-black uppercase tracking-widest text-[10px] ${
                link.name === "Admin Panel" 
                ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20' 
                : 'hover:bg-brand-primary/5'
              }`}
            >
              <link.icon size={18} className={link.name === "Admin Panel" ? "text-brand-primary" : "opacity-50"} />
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}