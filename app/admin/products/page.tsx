'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/components/ThemeProvider'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Users, ShoppingBag, DollarSign, Clock, Package, X, Search, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const { theme } = useTheme()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setMounted(true)
    checkAdmin()
  }, [])

  useEffect(() => {
    if (mounted) {
      const timer = setTimeout(() => {
        fetchOrders(searchQuery)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [searchQuery, mounted])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      router.push('/home')
      return
    }

    loadDashboardData()
  }

  const loadDashboardData = async () => {
    try {
      const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
      const { data: orders } = await supabase.from('orders').select('total_amount, status')
      
      const totalOrders = orders?.length || 0
      const totalRevenue = orders?.reduce((sum, order) => {
        return sum + (order.status === 'confirmed' ? parseFloat(order.total_amount.toString()) : 0)
      }, 0) || 0
      const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0

      setStats({
        totalUsers: usersCount || 0,
        totalOrders,
        totalRevenue,
        pendingOrders
      })

      await fetchOrders()
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async (query = '') => {
    try {
      let supabaseQuery = supabase
        .from('orders')
        .select(`*, profiles (full_name, email)`)
        .order('created_at', { ascending: false })
      
      if (query) {
        supabaseQuery = supabaseQuery.ilike('reference_code', `%${query}%`)
      } 

      const { data, error } = await supabaseQuery
      if (error) throw error
      setRecentOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const cancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId)

      if (error) throw error
      fetchOrders(searchQuery)
      loadDashboardData()
    } catch (error) {
      alert('Failed to cancel order')
    }
  }

  if (!mounted || loading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Header />

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tighter uppercase">
            Admin <span className="text-brand-primary">Dashboard</span>
          </h1>
          <div className="h-1 w-20 bg-brand-primary mt-2 rounded-full" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'brand' },
            { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'brand' },
            { label: 'Net Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'brand' },
            { label: 'Pending', value: stats.pendingOrders, icon: Clock, color: 'yellow' },
          ].map((stat, i) => (
            <div key={i} className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} p-6 rounded-3xl border shadow-sm`}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-brand-primary/10 text-brand-primary">
                  <stat.icon size={24} />
                </div>
                <span className="text-[10px] font-black uppercase opacity-40 tracking-widest">{stat.label}</span>
              </div>
              <h3 className="text-3xl font-black">{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <Link href="/admin/products" className={`group p-8 rounded-3xl border transition-all ${
            theme === 'dark' ? 'bg-gray-900 border-gray-800 hover:border-brand-primary/50' : 'bg-white border-gray-200 hover:border-brand-primary'
          }`}>
            <div className="flex items-center gap-6">
              <div className="p-4 bg-brand-primary text-white rounded-2xl group-hover:scale-110 transition-transform">
                <Package size={30} />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Manage Products</h3>
                <p className="text-sm opacity-60">Add, edit, or remove inventory</p>
              </div>
              <ArrowRight className="ml-auto opacity-0 group-hover:opacity-100 transition-all text-brand-primary" />
            </div>
          </Link>

          <Link href="/admin/orders" className={`group p-8 rounded-3xl border transition-all ${
            theme === 'dark' ? 'bg-gray-900 border-gray-800 hover:border-brand-primary/50' : 'bg-white border-gray-200 hover:border-brand-primary'
          }`}>
            <div className="flex items-center gap-6">
              <div className="p-4 bg-brand-primary text-white rounded-2xl group-hover:scale-110 transition-transform">
                <ShoppingBag size={30} />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Full Order List</h3>
                <p className="text-sm opacity-60">Complete history and processing</p>
              </div>
              <ArrowRight className="ml-auto opacity-0 group-hover:opacity-100 transition-all text-brand-primary" />
            </div>
          </Link>
        </div>

        {/* Orders Section with Search */}
        <div className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} rounded-3xl border shadow-sm overflow-hidden`}>
          <div className="p-6 border-b border-inherit flex flex-col md:flex-row justify-between items-center gap-4 bg-brand-primary/5">
            <h2 className="text-xl font-black uppercase tracking-tight">
              {searchQuery ? 'Search Results' : 'Order Management'}
            </h2>
            
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary/50" size={18} />
              <input
                type="text"
                placeholder="Search reference code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-2xl border text-sm transition-all focus:ring-2 focus:ring-brand-primary focus:outline-none ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className={`text-[10px] font-black uppercase tracking-widest opacity-50 ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                  <th className="px-8 py-4">Reference</th>
                  <th className="px-8 py-4">Customer</th>
                  <th className="px-8 py-4">Amount</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-inherit">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center opacity-40 italic">
                      No matching orders found.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-brand-primary/5 transition-colors group">
                      <td className="px-8 py-5 font-black text-brand-primary tracking-tighter">
                        {order.reference_code}
                      </td>
                      <td className="px-8 py-5">
                        <p className="font-bold text-sm leading-none">{order.profiles?.full_name || 'Guest User'}</p>
                        <p className="text-xs opacity-50 mt-1">{order.profiles?.email}</p>
                      </td>
                      <td className="px-8 py-5 font-black">
                        ${parseFloat(order.total_amount.toString()).toFixed(2)}
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          order.status === 'pending' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600' : 
                          order.status === 'confirmed' ? 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary' : 
                          'bg-red-500/10 border-red-500/20 text-red-600'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        {order.status === 'pending' && (
                          <button 
                            onClick={() => cancelOrder(order.id)}
                            className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                            title="Cancel Order"
                          >
                            <X size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}