'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/components/ThemeProvider'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { 
  Users, ShoppingBag, DollarSign, Clock, Package, 
  Search, CheckCircle, XCircle, RefreshCcw, Hash, Mail, User
} from 'lucide-react'

export default function AdminDashboard() {
  const { theme } = useTheme()
  const router = useRouter()
  const [stats, setStats] = useState({ totalUsers: 0, totalOrders: 0, totalRevenue: 0, pendingOrders: 0 })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return; }

      const user = session.user
      const isMasterAdmin = user.email === 'doungmolagoungvaldes@gmail.com'
      const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle()

      const checkAdmin = isMasterAdmin || profile?.is_admin === true
      setIsAdmin(checkAdmin)

      if (checkAdmin) {
        const [usersRes, ordersRes] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact' }),
          supabase.from('orders').select('*').order('created_at', { ascending: false })
        ])
        const orders = ordersRes.data || []
        setRecentOrders(orders)
        setStats({
          totalUsers: usersRes.count || 0,
          totalOrders: orders.length,
          totalRevenue: orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0),
          pendingOrders: orders.filter(o => !['confirmed', 'rejected'].includes(o.status?.toLowerCase())).length
        })
      } else {
        const { data: orders } = await supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
        setRecentOrders(orders || [])
      }
    } catch (err) { console.error("Fetch Error:", err) } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleOrderAction = async (order: any, action: 'approve' | 'reject') => {
    let reason = ""
    const newStatus = action === 'approve' ? 'confirmed' : 'rejected'
    
    if (action === 'reject') {
      const input = prompt("REJECTION REASON (Sent to client):")
      if (!input) return
      reason = input
    } else {
      if (!confirm(`Authorize transmission #${order.order_reference}?`)) return
    }

    setActionLoading(order.id)
    try {
      const { error: dbError } = await supabase.from('orders').update({ status: newStatus }).eq('id', order.id)
      if (dbError) throw dbError

      setRecentOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: newStatus } : o))

      fetch('/api/send-order-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order, type: action === 'approve' ? 'CONFIRMATION' : 'DELETION', reason })
      }).catch(e => console.error("Email API Error:", e))

      fetchData()
    } catch (err: any) {
      alert(`SYSTEM_ERROR: ${err.message}`)
    } finally { setActionLoading(null) }
  }

  const filteredOrders = recentOrders.filter(order => 
    order.order_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.email_address?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black font-mono">
      <div className="relative">
        <RefreshCcw className="animate-spin text-[#FFA52F]" size={40} />
        <div className="absolute inset-0 blur-xl bg-[#FFA52F]/20 animate-pulse"></div>
      </div>
      <p className="mt-6 text-[10px] tracking-[0.8em] uppercase font-black text-[#FFA52F] opacity-50">Decrypting_Data...</p>
    </div>
  )

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#050505] text-white' : 'bg-gray-50 text-slate-900'} font-mono transition-colors duration-500`}>
      <Header />
      <main className="container mx-auto px-4 py-20 max-w-7xl">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3 opacity-40">
              <div className="h-[1px] w-8 bg-current"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Secure Terminal v3.0</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">
              {isAdmin ? 'System' : 'User'} <span className="text-[#FFA52F] drop-shadow-[0_0_15px_rgba(255,165,47,0.3)]">{isAdmin ? 'Core' : 'Access'}</span>
            </h1>
          </div>
          
          {isAdmin && (
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#FFA52F] opacity-50 group-focus-within:opacity-100 transition-opacity" size={18} />
              <input 
                type="text"
                placeholder="SEARCH_BY_REF_OR_EMAIL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border-2 border-white/5 py-5 pl-14 pr-6 rounded-2xl text-[11px] font-black uppercase outline-none focus:border-[#FFA52F]/50 focus:bg-white/10 transition-all backdrop-blur-md"
              />
            </div>
          )}
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {isAdmin && <StatCard title="Total_Users" value={stats.totalUsers} icon={<Users size={20}/>} theme={theme} />}
          <StatCard title="Orders_Volume" value={stats.totalOrders} icon={<ShoppingBag size={20}/>} theme={theme} />
          {isAdmin && <StatCard title="Gross_Revenue" value={`${stats.totalRevenue.toLocaleString()} £`} icon={<DollarSign size={20}/>} theme={theme} isGold />}
          <StatCard title="Active_Transmissions" value={stats.pendingOrders} icon={<Clock size={20}/>} theme={theme} />
        </div>

        {/* Table Container */}
        <div className={`relative rounded-[2rem] border-2 ${theme === 'dark' ? 'bg-black/40 border-white/5' : 'bg-white border-slate-200'} overflow-hidden shadow-2xl backdrop-blur-xl`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b-2 ${theme === 'dark' ? 'border-white/5 bg-white/[0.02]' : 'border-slate-100 bg-slate-50'}`}>
                  <th className="p-8 text-[9px] font-black uppercase tracking-[0.3em] opacity-40">Reference Code</th>
                  {isAdmin && <th className="p-8 text-[9px] font-black uppercase tracking-[0.3em] opacity-40">Client Identity</th>}
                  <th className="p-8 text-right text-[9px] font-black uppercase tracking-[0.3em] opacity-40">Amount</th>
                  <th className="p-8 text-center text-[9px] font-black uppercase tracking-[0.3em] opacity-40">Status</th>
                  {isAdmin && <th className="p-8 text-right text-[9px] font-black uppercase tracking-[0.3em] opacity-40">Decision</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FFA52F]/5 transition-all duration-300 group">
                    <td className="p-8">
                      <div className="flex items-center gap-3">
                        <Hash size={14} className="text-[#FFA52F] opacity-40" />
                        <span className="font-black text-[#FFA52F] text-base tracking-tighter group-hover:tracking-normal transition-all">
                          {order.reference_code || 'N/A'}
                        </span>
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="p-8">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <User size={12} className="opacity-30" />
                            <span className="text-[11px] font-black uppercase tracking-tight">{order.full_name || 'Anonymous'}</span>
                          </div>
                          <div className="flex items-center gap-2 opacity-40">
                            <Mail size={10} />
                            <span className="text-[9px] font-bold">{order.email_address}</span>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="p-8 text-right font-black text-base">
                      <span className="opacity-30 text-xs mr-1">£</span>
                      {Number(order.total_amount).toFixed(2)}
                    </td>
                    <td className="p-8 text-center">
                      <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase border ${
                        order.status === 'confirmed' 
                        ? 'border-green-500/30 text-green-400 bg-green-500/5' 
                        : order.status === 'rejected'
                        ? 'border-red-500/30 text-red-400 bg-red-500/5'
                        : 'border-[#FFA52F]/30 text-[#FFA52F] bg-[#FFA52F]/5'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${
                          order.status === 'confirmed' ? 'bg-green-400' : order.status === 'rejected' ? 'bg-red-400' : 'bg-[#FFA52F]'
                        }`}></span>
                        {order.status || 'PENDING'}
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="p-8">
                        <div className="flex justify-end gap-3">
                          {(!order.status || !['confirmed', 'rejected'].includes(order.status)) ? (
                            <>
                              <button 
                                onClick={() => handleOrderAction(order, 'approve')}
                                disabled={actionLoading === order.id}
                                className="group/btn flex items-center gap-2 px-4 py-3 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500 hover:text-black transition-all font-black text-[9px] uppercase tracking-widest disabled:opacity-50"
                              >
                                {actionLoading === order.id ? <RefreshCcw className="animate-spin" size={14}/> : <CheckCircle size={14} />}
                                <span className="hidden xl:block">Approve</span>
                              </button>
                              <button 
                                onClick={() => handleOrderAction(order, 'reject')}
                                disabled={actionLoading === order.id}
                                className="group/btn flex items-center gap-2 px-4 py-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-black transition-all font-black text-[9px] uppercase tracking-widest disabled:opacity-50"
                              >
                                <XCircle size={14} />
                                <span className="hidden xl:block">Reject</span>
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center gap-2 opacity-20 italic font-black text-[10px] uppercase tracking-[0.2em]">
                              <Package size={14} />
                              Archived
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredOrders.length === 0 && (
              <div className="py-32 text-center">
                <Package size={48} className="mx-auto mb-6 text-[#FFA52F] opacity-10" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30">Null_Result_Found</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function StatCard({ title, value, icon, theme, isGold }: any) {
  return (
    <div className={`group relative p-8 rounded-3xl border-2 transition-all duration-500 ${
      theme === 'dark' 
      ? (isGold ? 'bg-[#FFA52F]/5 border-[#FFA52F]/20' : 'bg-white/[0.02] border-white/5') 
      : (isGold ? 'bg-[#FFA52F]/5 border-[#FFA52F]/20' : 'bg-white border-slate-200')
    } hover:scale-[1.02] hover:border-[#FFA52F]/40`}>
      <div className={`mb-6 p-3 rounded-xl inline-block transition-colors ${isGold ? 'bg-[#FFA52F] text-black' : 'bg-current opacity-10'}`}>
        {icon}
      </div>
      <p className="text-[9px] font-black uppercase opacity-40 mb-1 tracking-[0.2em]">{title}</p>
      <p className={`text-4xl font-black italic tracking-tighter ${isGold ? 'text-[#FFA52F]' : ''}`}>
        {value}
      </p>
      {/* Background decoration */}
      <div className="absolute top-4 right-4 text-[40px] font-black opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity uppercase">
        {title.split('_')[0]}
      </div>
    </div>
  )
}