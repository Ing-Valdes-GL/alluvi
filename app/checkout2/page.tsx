'use client'

import { useEffect, useState, Suspense } from 'react' // Ajout de Suspense
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

// 1. On déplace la logique dans un composant interne
function CheckoutDetails() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrderDetails() {
      if (!orderId) return
      
      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      const { data: itemsData } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId)

      setOrder(orderData)
      setItems(itemsData || [])
      setLoading(false)
    }

    fetchOrderDetails()
  }, [orderId])

  if (loading) return <div className="p-20 text-center font-black uppercase tracking-widest opacity-30">Loading your receipt...</div>
  if (!order) return <div className="p-20 text-center font-black uppercase tracking-widest opacity-30">Order not found.</div>

  return (
    <div className="bg-white min-h-screen font-sans">
      <Header />
      
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <h1 className="text-5xl font-black text-slate-800 mb-8 tracking-tight">
          Thank You. Your Order Has Been Received.
        </h1>

        <div className="flex flex-wrap gap-8 mb-12 text-sm border-b border-slate-100 pb-8">
          <div>
            <p className="text-slate-400 uppercase font-bold text-[10px] tracking-widest mb-1">Order number:</p>
            <p className="font-black text-slate-900">{order.reference_code || order.id.slice(0,5)}</p>
          </div>
          <div>
            <p className="text-slate-400 uppercase font-bold text-[10px] tracking-widest mb-1">Date:</p>
            <p className="font-black text-slate-900">
              {new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div>
            <p className="text-slate-400 uppercase font-bold text-[10px] tracking-widest mb-1">Total:</p>
            <p className="font-black text-slate-900">£{Number(order.total_amount).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-slate-400 uppercase font-bold text-[10px] tracking-widest mb-1">Payment method:</p>
            <p className="font-black text-slate-900 capitalize">{order.payment_method?.replace('_', ' ')}</p>
          </div>
        </div>

        <div className="border border-slate-100 rounded-sm p-8 shadow-sm">
          <h2 className="text-4xl font-black text-slate-900 mb-8">Order Details</h2>
          
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold uppercase text-slate-400 tracking-wider">
                <th className="pb-4">Product</th>
                <th className="pb-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {items.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-50">
                  <td className="py-6 flex items-center gap-4">
                    <span className="font-bold text-orange-500 hover:underline cursor-pointer">
                      {item.product_name}
                    </span>
                    <span className="font-black text-slate-900"> × {item.quantity}</span>
                  </td>
                  <td className="py-6 text-right font-medium">
                    £{(item.unit_price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="text-sm">
              <tr>
                <td className="pt-8 text-right pr-12 font-bold text-slate-900">Subtotal:</td>
                <td className="pt-8 text-right font-medium text-slate-700">£{Number(order.subtotal).toFixed(2)}</td>
              </tr>
              <tr>
                <td className="py-4 text-right pr-12 font-bold text-slate-900">Discount:</td>
                <td className="py-4 text-right font-medium text-slate-700">-£{Number(order.discount_amount).toFixed(2)}</td>
              </tr>
              <tr>
                <td className="py-4 text-right pr-12 font-bold text-slate-900">Shipping:</td>
                <td className="py-4 text-right font-medium text-slate-500 text-xs">
                    £{Number(order.shipping_fee).toFixed(2)} <span className="italic">via Express Delivery</span>
                </td>
              </tr>
              <tr className="text-xl">
                <td className="pt-6 text-right pr-12 font-black text-slate-900">Total:</td>
                <td className="pt-6 text-right font-black text-slate-900">£{Number(order.total_amount).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </main>

      <Footer />
    </div>
  )
}

// 2. Export principal avec Suspense
export default function Checkout2() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <CheckoutDetails />
    </Suspense>
  )
}