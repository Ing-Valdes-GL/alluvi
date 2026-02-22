'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/components/ThemeProvider'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Users, ShoppingBag, DollarSign, Clock, Search, ShieldAlert } from 'lucide-react'

export default function AdminDashboard() {
  const { theme } = useTheme()
  const router = useRouter()
  const [stats, setStats] = useState({ totalUsers: 0, totalOrders: 0, totalRevenue: 0, pendingOrders: 0 })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // SÉCURITÉ CRITIQUE : Ton email est le "Master Key"
      const isMasterAdmin = user.email === 'doungmolagoungvaldes@gmail.com'

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle()

      // On laisse passer si c'est TOI (email) ou si la BD dit Admin
      if (isMasterAdmin || profile?.is_admin === true) {
        await loadDashboardData()
        setLoading(false)
      } else {
        router.push('/home')
      }
    } catch (err) {
      console.error("Auth Error:", err)
      router.push('/home')
    }
  }

  const loadDashboardData = async () => {
    // Note: Si RLS est activé sans policy, count renverra 0.
    const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    const { data: orders } = await supabase.from('orders').select('total_amount, status')
    
    const totalRevenue = orders?.reduce((sum, o) => sum + (o.status === 'confirmed' ? Number(o.total_amount || 0) : 0), 0) || 0

    setStats({
      totalUsers: usersCount || 0,
      totalOrders: orders?.length || 0,
      totalRevenue,
      pendingOrders: orders?.filter(o => o.status === 'pending').length || 0
    })

    const { data: recent } = await supabase
      .from('orders')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(10)
    setRecentOrders(recent || [])
  }

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 mb-4"></div>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Initialisation du Terminal...</p>
    </div>
  )

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-50'}`}>
      <Header />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-black uppercase mb-8 italic">Terminal <span className="text-blue-500">Control</span></h1>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <StatCard title="Total Users" value={stats.totalUsers} icon={<Users />} color="blue" theme={theme} />
          <StatCard title="Orders" value={stats.totalOrders} icon={<ShoppingBag />} color="green" theme={theme} />
          <StatCard title="Revenue" value={`${stats.totalRevenue} FCFA`} icon={<DollarSign />} color="purple" theme={theme} />
          <StatCard title="Pending" value={stats.pendingOrders} icon={<Clock />} color="yellow" theme={theme} />
        </div>

        {/* Tableau des commandes ici... */}
      </main>
      <Footer />
    </div>
  )
}

function StatCard({ title, value, icon, color, theme }: any) {
  return (
    <div className={`${theme === 'dark' ? 'bg-gray-900 border-white/5' : 'bg-white border-gray-200'} p-6 rounded-2xl border`}>
      <div className={`text-${color}-500 mb-4 opacity-80`}>{icon}</div>
      <p className="text-[10px] font-black uppercase opacity-40 mb-1">{title}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  )
}