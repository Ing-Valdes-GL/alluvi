'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/components/ThemeProvider'
import { ArrowLeft, Loader2, Chrome } from 'lucide-react'

export default function LoginPage() {
  const { theme } = useTheme()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      setError('')
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/home`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) throw error
    } catch (error: any) {
      setError(error.message || 'An error occurred during sign in')
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] ${theme === 'dark' ? 'bg-brand-primary/10' : 'bg-brand-primary/5'}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] ${theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-500/5'}`} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back Link */}
        <Link 
          href="/" 
          className={`group inline-flex items-center gap-2 mb-8 text-[10px] font-black uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-opacity`}
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Return to Terminal</span>
        </Link>

        {/* Login Card */}
        <div className={`${theme === 'dark' ? 'bg-gray-900/50 border-white/5' : 'bg-white border-gray-200'} backdrop-blur-xl p-10 md:p-12 rounded-[2.5rem] border shadow-2xl relative overflow-hidden`}>
          
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-brand-primary/30 rotate-3 group-hover:rotate-0 transition-transform">
                
              </div>
            </div>
            <h1 className="text-3xl font-black tracking-tighter uppercase mb-2">
              Identity <span className="text-brand-primary italic">Verification</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
              Access the medical logistics portal
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              {error}
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className={`w-full group relative flex items-center justify-center gap-4 px-8 py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all duration-300 disabled:opacity-50
              ${theme === 'dark' 
                ? 'bg-white text-black hover:bg-brand-primary hover:text-white' 
                : 'bg-black text-white hover:bg-brand-primary'}`}
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Chrome size={20} />
                <span className="text-xs">Authorize via Google</span>
              </>
            )}
            
            {/* Subtle glow effect on hover */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl bg-brand-primary/30 transition-opacity -z-10" />
          </button>

          {/* Footer Info */}
          <div className="mt-10 space-y-4 text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.15em] opacity-30 leading-relaxed">
              By accessing this terminal, you acknowledge our <br />
              <span className="underline cursor-pointer hover:text-brand-primary transition-colors">Security Protocols</span> & <span className="underline cursor-pointer hover:text-brand-primary transition-colors">Privacy Policy</span>
            </p>
            
            <div className="pt-6 border-t border-white/5 flex justify-center gap-6 opacity-20">
                <div className="w-2 h-2 rounded-full bg-current" />
                <div className="w-2 h-2 rounded-full bg-current" />
                <div className="w-2 h-2 rounded-full bg-current" />
            </div>
          </div>
        </div>

        {/* Support Note */}
        <p className="text-center mt-8 text-[10px] font-black uppercase tracking-widest opacity-30">
          Locked out? <span className="text-brand-primary cursor-pointer">Contact System Admin</span>
        </p>
      </div>
    </div>
  )
}
