'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Activity, Mail, Phone, MapPin, ShieldCheck, ArrowRight, MessageCircle, Send } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'

export default function Footer() {
  const { theme } = useTheme()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    setLoading(true)
    // Simule une inscription/authentification rapide
    setTimeout(() => {
      setLoading(false)
      router.push('/home')
    }, 1000)
  }

  return (
    <footer className={`border-t-4 border-orange-500 ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
      <div className="container mx-auto px-4 py-20 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
          
          {/* Brand & Newsletter Column */}
          <div className="col-span-1 md:col-span-5 space-y-8">
            <Link href="/" className="flex items-center gap-2 group">
              <Activity className="w-10 h-10 text-orange-500 transition-transform group-hover:rotate-12" />
              <span className="text-4xl font-black tracking-tighter uppercase">
                Allu<span className="text-orange-500">vi</span>
              </span>
            </Link>
            
            <p className="max-w-sm text-sm font-bold uppercase tracking-widest opacity-60 leading-relaxed">
              Powered by Alluvi Health Care. Providing premium pharmaceutical products with blockchain-grade security.
            </p>

            {/* Subscribe Form intégré */}
            <div className="space-y-4">
              <h4 className="font-black text-xs uppercase tracking-[0.3em] text-orange-500">Newsletter</h4>
              <form onSubmit={handleSubscribe} className="relative max-w-sm group">
                <input 
                  type="email"
                  placeholder="Enter your email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-6 pr-16 py-5 rounded-[2rem] text-xs font-black uppercase tracking-widest outline-none transition-all border-2 ${
                    theme === 'dark' 
                    ? 'bg-gray-900 border-white/5 focus:border-orange-500' 
                    : 'bg-gray-100 border-transparent focus:bg-white focus:border-orange-500'
                  }`}
                />
                <button 
                  disabled={loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform disabled:opacity-50"
                >
                  {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" /> : <Send size={18} />}
                </button>
              </form>
            </div>

            <div className="flex items-center gap-3 text-orange-500 font-black text-xs uppercase tracking-widest bg-orange-500/10 w-fit px-6 py-3 rounded-2xl border border-orange-500/20">
              <ShieldCheck size={18} />
              <span>Certified Medical Supplier</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1 md:col-span-3">
            <h3 className="font-black text-sm uppercase tracking-[0.4em] mb-10 text-orange-500">Explore</h3>
            <ul className="space-y-6">
              {[
                { name: 'All Products', href: '/products' },
                { name: 'My Cart', href: '/cart' },
                { name: 'Support Chat', href: '/chat' }
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="group flex items-center gap-3 text-xs font-black uppercase tracking-widest hover:text-orange-500 transition-colors">
                    <ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-orange-500"/>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div className="col-span-1 md:col-span-4">
            <h3 className="font-black text-sm uppercase tracking-[0.4em] mb-10 text-orange-500">Contact Us</h3>
            <ul className="space-y-6">
              <li className="flex items-center gap-5 group">
                <div className={`p-4 rounded-2xl transition-all ${theme === 'dark' ? 'bg-gray-900 group-hover:bg-orange-500' : 'bg-gray-100 group-hover:bg-orange-500'} group-hover:text-white`}>
                  <Mail size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Email Support</span>
                  <a href="/chat" className="text-xs font-black uppercase tracking-widest hover:text-orange-500">support@Alluvi.com</a>
                </div>
              </li>

              <li className="flex items-center gap-5 group">
                <a href="https://wa.me/+237692118391" target="_blank" rel="noopener noreferrer" className="flex items-center gap-5">
                  <div className={`p-4 rounded-2xl transition-all ${theme === 'dark' ? 'bg-gray-900 group-hover:bg-green-500' : 'bg-gray-100 group-hover:bg-green-500'} group-hover:text-white`}>
                    <Phone size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Direct Line</span>
                    <span className="text-xs font-black uppercase tracking-widest">WhatsApp Support</span>
                  </div>
                </a>
              </li>

              <li className="flex items-center gap-5 group">
                <a href="https://t.me/+237692118391" target="_blank" rel="noopener noreferrer" className="flex items-center gap-5">
                  <div className={`p-4 rounded-2xl transition-all ${theme === 'dark' ? 'bg-gray-900 group-hover:bg-blue-500' : 'bg-gray-100 group-hover:bg-blue-500'} group-hover:text-white`}>
                    <MessageCircle size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Community</span>
                    <span className="text-xs font-black uppercase tracking-widest">Telegram Channel</span>
                  </div>
                </a>
              </li>

              <li className="flex items-center gap-5 group pt-4">
                <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'} text-orange-500`}>
                  <MapPin size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Headquarters</span>
                  <span className="text-xs font-black uppercase tracking-widest">London, United Kingdom</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`mt-20 pt-10 border-t ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'} flex flex-col md:flex-row justify-between items-center gap-8`}>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
            © {new Date().getFullYear()} Alluvi Health-Care. All rights reserved.
          </p>
          <div className="flex gap-10">
            <Link href="#" className="text-[10px] font-black uppercase tracking-widest hover:text-orange-500 transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-[10px] font-black uppercase tracking-widest hover:text-orange-500 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}