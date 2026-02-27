'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/components/ThemeProvider'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Package, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react'

export default function OrdersPage() {
  const { theme } = useTheme()
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)

  const fetchOrders = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/login')
      else fetchOrders(user.id)
    }
    checkUser()
  }, [fetchOrders, router])

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase()
    const baseClass = "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border"
    
    if (s === 'confirmed' || s === 'approved') 
      return <span className={`${baseClass} bg-green-50 text-green-700 border-green-200`}>Confirmed</span>
    if (s === 'rejected' || s === 'cancelled') 
      return <span className={`${baseClass} bg-red-50 text-red-700 border-red-200`}>Rejected</span>
    
    return <span className={`${baseClass} bg-amber-50 text-amber-700 border-amber-200`}>Pending</span>
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Header />

      <main className="container mx-auto px-6 py-12 max-w-5xl">
        <h1 className="text-3xl font-extrabold mb-10 tracking-tight">Order History</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-gray-200 p-16 text-center rounded-xl shadow-sm">
            <Package className="mx-auto mb-4 text-gray-300" size={40} />
            <p className="text-gray-500 font-medium">No orders found in your account.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className={`bg-white border transition-all duration-200 overflow-hidden ${
                  expandedOrderId === order.id ? 'border-gray-900 shadow-md' : 'border-gray-200 shadow-sm'
                } rounded-xl`}
              >
                {/* Main Row */}
                <div 
                  className="p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                  onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                >
                  <div className="grid grid-cols-2 md:flex md:items-center gap-12">
                    <div>
                      <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">Reference</p>
                      <p className="text-sm font-mono font-bold">
                        {order.order_reference || order.reference_code || order.id.slice(0, 8)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">Date</p>
                      <p className="text-sm">
                        {new Date(order.created_at).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-10">
                    <div className="text-right">
                      <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">Total Amount</p>
                      <p className="text-sm font-bold">£ {Number(order.total_amount).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(order.status)}
                      {expandedOrderId === order.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Table */}
                {expandedOrderId === order.id && (
                  <div className="bg-gray-50 border-t border-gray-100 p-6">
                    <table className="w-full text-sm border-separate border-spacing-y-2">
                      <thead>
                        <tr className="text-[10px] uppercase text-gray-400">
                          <th className="text-left pb-2 font-bold px-2">Product</th>
                          <th className="text-center pb-2 font-bold px-2">Qty</th>
                          <th className="text-right pb-2 font-bold px-2">Unit Price</th>
                          <th className="text-right pb-2 font-bold px-2">Line Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.order_items?.map((item: any) => (
                          <tr key={item.id} className="bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden">
                            <td className="py-4 px-3 font-medium rounded-l-lg">{item.product_name}</td>
                            <td className="py-4 px-3 text-center text-gray-500 font-bold">x {item.quantity}</td>
                            <td className="py-4 px-3 text-right">£ {Number(item.unit_price).toFixed(2)}</td>
                            <td className="py-4 px-3 text-right font-bold text-gray-900 rounded-r-lg">
                              {/* Dynamic calculation: quantity * unit_price */}
                              £ {(Number(item.quantity) * Number(item.unit_price)).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}