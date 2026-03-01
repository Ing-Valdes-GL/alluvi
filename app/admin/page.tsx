'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, type Order } from '@/lib/supabase'
import { useTheme } from '@/components/ThemeProvider'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { 
  Users, Package, MessageCircle, Clock, Check, 
  DollarSign, ShoppingBag, X, ArrowRight, ShieldAlert 
} from 'lucide-react'

export default function AdminDashboard() {
  const { theme } = useTheme()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    totalRevenue: 0,
    unreadMessages: 0
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])

  useEffect(() => {
    setMounted(true)
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        router.push('/login')
        return
      }

      // Vérification du profil + Sécurité par Email (Bypass)
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      const isOwnerEmail = user.email === 'doungmolagoungvaldes@gmail.com'

      if (profile?.is_admin || isOwnerEmail) {
        setUser(user)
        // On ne charge les données que si l'accès est validé
        await Promise.all([loadStats(), loadRecentOrders()])
        setLoading(false)
      } else {
        // Redirection si l'utilisateur n'est pas admin
        router.push('/home')
      }
    } catch (err) {
      console.error("Security Check Error:", err)
      router.push('/home')
    }
  }

  const loadStats = async () => {
    try {
      const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
      const { count: productsCount } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true)
      
      const { data: pendingOrders } = await supabase.from('orders').select('*').eq('status', 'pending')
      const { data: confirmedOrders } = await supabase.from('orders').select('*').eq('status', 'confirmed')

      const totalRevenue = confirmedOrders?.reduce((sum, order) => sum + parseFloat(order.total_amount.toString()), 0) || 0
      const { count: unreadCount } = await supabase.from('chat_messages').select('*', { count: 'exact', head: true }).eq('is_read', false)

      setStats({
        totalUsers: usersCount || 0,
        totalProducts: productsCount || 0,
        pendingOrders: pendingOrders?.length || 0,
        confirmedOrders: confirmedOrders?.length || 0,
        totalRevenue,
        unreadMessages: unreadCount || 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const loadRecentOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
      if (error) throw error
      setRecentOrders(data || [])
    } catch (error) { 
      console.error('Error loading orders:', error) 
    }
  }

  const confirmOrder = async (orderId: string) => {
    try {
      const { error } = await supabase.from('orders').update({
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
          confirmed_by: user.id
        }).eq('id', orderId)
      if (error) throw error
      loadStats(); loadRecentOrders();
    } catch (error) { alert('Failed to confirm order') }
  }

  const cancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return
    try {
      const { error } = await supabase.from('orders').update({ status: 'cancelled' }).eq('id', orderId)
      if (error) throw error
      loadStats(); loadRecentOrders();
    } catch (error) { alert('Failed to cancel order') }
  }

  if (!mounted || loading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'} flex flex-col items-center justify-center`}>
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-primary"></div>
          <ShieldAlert className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-primary opacity-50" size={20} />
        </div>
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] opacity-40 animate-pulse">
          Decrypting Admin Protocols...
        </p>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Breadcrumb / Exit */}
        <button 
          onClick={() => router.push('/home')}
          className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
        >
          <ArrowRight size={14} className="rotate-180" />
          Exit to System Home
        </button>

        <div className="mb-12">
          <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">
            Terminal <span className="text-brand-primary italic">Control</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-30 mt-2">
            Authorized Access Only — {user?.email}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: Users },
            { label: 'Live Products', value: stats.totalProducts, icon: Package },
            { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock },
            { label: 'Total Revenue', value: `${stats.totalRevenue.toLocaleString()} £`, icon: DollarSign },
          ].map((stat, i) => (
            <div key={i} className={`${theme === 'dark' ? 'bg-gray-900/40 border-white/5' : 'bg-white border-gray-100'} p-8 rounded-[2rem] border backdrop-blur-sm shadow-xl`}>
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 rounded-2xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                  <stat.icon size={20} />
                </div>
                <div className="h-1 w-8 bg-brand-primary/20 rounded-full" />
              </div> 
              <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-1">{stat.label}</p>
              <p className="text-3xl font-black tracking-tighter">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Action Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { title: 'Inventory', desc: 'Modify medical supply records', href: '/admin/products', icon: Package },
            { title: 'Logistics', desc: 'Track & confirm shipments', href: '/admin/orders', icon: ShoppingBag },
            { title: 'Intelligence', desc: 'Direct secure messaging', href: '/admin/chat', icon: MessageCircle, badge: stats.unreadMessages },
          ].map((action, i) => (
            <Link key={i} href={action.href} className={`group p-8 rounded-[2.5rem] border transition-all relative overflow-hidden ${
              theme === 'dark' ? 'bg-gray-900/40 border-white/5 hover:border-brand-primary/40' : 'bg-white border-gray-100 hover:border-brand-primary'
            }`}>
              <div className="relative z-10">
                <div className="bg-brand-primary text-white p-4 rounded-2xl w-fit mb-6 shadow-lg shadow-brand-primary/20">
                  <action.icon size={24} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-2">{action.title}</h3>
                <p className="text-xs font-medium opacity-50 mb-6 leading-relaxed">{action.desc}</p>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-primary group-hover:gap-4 transition-all">
                  Open Module <ArrowRight size={14} />
                </div>
              </div>
              {action.badge ? (
                <div className="absolute top-8 right-8 bg-red-500 text-white text-[10px] font-black rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                  {action.badge}
                </div>
              ) : null}
            </Link>
          ))}
        </div>

        {/* Recent Activity Table */}
        <div className={`${theme === 'dark' ? 'bg-gray-900/40 border-white/5' : 'bg-white border-gray-100'} rounded-[2.5rem] border shadow-2xl overflow-hidden`}>
          <div className="p-8 border-b border-inherit flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">Recent Activity</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-30">Live Logistics Feed</p>
            </div>
            <Link href="/admin/orders" className="px-6 py-2 rounded-full border border-brand-primary/30 text-[10px] font-black uppercase tracking-widest text-brand-primary hover:bg-brand-primary hover:text-white transition-all">
              Full Archive
            </Link>
          </div>

          <div className="divide-y divide-white/5">
            {recentOrders.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-500/10 rounded-full flex items-center justify-center opacity-20 mb-4">
                  <Clock size={24} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Zero active transmissions found</p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="p-8 flex flex-wrap items-center justify-between gap-6 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-6">
                    <div className="text-[10px] font-black opacity-20 hidden md:block w-8">
                      {new Date(order.created_at).getHours()}:00
                    </div>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xs ${
                      order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 
                      order.status === 'confirmed' ? 'bg-brand-primary/10 text-brand-primary' : 'bg-red-500/10 text-red-500'
                    }`}>
                      ID
                    </div>
                    <div>
                      <p className="font-black tracking-tight text-lg leading-tight uppercase">{order.reference_code}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                        {new Date(order.created_at).toLocaleDateString()} • {order.total_amount} FCFA
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${
                      order.status === 'pending' ? 'bg-yellow-500/5 border-yellow-500/20 text-yellow-500' : 
                      order.status === 'confirmed' ? 'bg-brand-primary/5 border-brand-primary/20 text-brand-primary' : 'bg-red-500/5 border-red-500/20 text-red-500'
                    }`}>
                      {order.status}
                    </span>
                    
                    {order.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => confirmOrder(order.id)} className="p-3 bg-brand-primary text-white rounded-xl hover:scale-110 transition-transform shadow-lg shadow-brand-primary/30">
                          <Check size={18} />
                        </button>
                        <button onClick={() => cancelOrder(order.id)} className="p-3 bg-red-500 text-white rounded-xl hover:scale-110 transition-transform shadow-lg shadow-red-500/30">
                          <X size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}