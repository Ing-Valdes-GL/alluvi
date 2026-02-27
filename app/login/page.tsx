'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/components/ThemeProvider'
import { ArrowLeft, Loader2, Hash } from 'lucide-react'

export default function LoginPage() {
  const { theme } = useTheme()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setMessage({ type: '', text: '' })
      
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/orders`,
        }
      })

      if (error) throw error
      setMessage({ type: 'success', text: 'Access link transmitted. Check your inbox.' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Transmission failed.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex flex-col p-8 md:p-12 ${theme === 'dark' ? 'bg-[#0A0A0A] text-white' : 'bg-white text-slate-900'} font-mono`}>
      
      {/* Top Navigation */}
      <Link 
        href="/" 
        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity mb-24"
      >
        <ArrowLeft size={14} />
        <span>Exit Terminal</span>
      </Link>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-4 leading-none">
            User <span className="text-[#FFA52F]">Access</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-30 leading-relaxed">
            Authentication required to initialize user session.
          </p>
        </div>

        {/* Status Message */}
        {message.text && (
          <div className={`mb-8 text-[10px] font-black uppercase tracking-widest p-4 border ${
            message.type === 'error' ? 'border-red-500/50 text-red-500' : 'border-[#FFA52F]/50 text-[#FFA52F]'
          }`}>
            {message.type === 'error' ? '>> ERROR: ' : '>> SUCCESS: '} {message.text}
          </div>
        )}

        {/* Simplified Form */}
        <form onSubmit={handleLogin} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 ml-1">Identify via Email</label>
            <input 
              type="email"
              required
              placeholder="USER@ALLUVICARE.COM"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full bg-transparent border-b-2 py-4 text-sm font-bold outline-none transition-all uppercase placeholder:opacity-10 ${
                theme === 'dark' ? 'border-white/10 focus:border-[#FFD363]' : 'border-slate-200 focus:border-[#FFA52F]'
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-between px-8 py-5 rounded-none font-black uppercase text-[11px] tracking-[0.3em] transition-all shadow-xl active:scale-95
              ${theme === 'dark' 
                ? 'bg-[#FFA52F] text-black hover:bg-[#FFD363]' 
                : 'bg-slate-900 text-white hover:bg-[#FFA52F]'}`}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              <>
                <span>Request Code</span>
                <Hash size={16} className="opacity-50" />
              </>
            )}
          </button>
        </form>

        {/* Footer Info */}
        <div className="mt-24 space-y-4">
          <div className={`h-[1px] w-12 ${theme === 'dark' ? 'bg-[#FFA52F]/30' : 'bg-slate-200'}`} />
          <p className="text-[9px] font-black uppercase tracking-widest opacity-20 leading-loose">
            Secure link protocol v2.4 <br />
            System Status: Operational
          </p>
        </div>
      </div>

      {/* Decorative side text */}
      <div className={`fixed bottom-12 right-12 text-[10px] font-black opacity-5 rotate-90 origin-right uppercase tracking-[0.5em] pointer-events-none hidden md:block`}>
        Identity_Verification_Portal
      </div>
    </div>
  )
}