'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, CartItem } from '@/lib/supabase'
import { useTheme } from '@/components/ThemeProvider'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, CreditCard, ShieldCheck, Truck } from 'lucide-react'

const generateOrderReference = () => {
  const datePart = Date.now().toString().slice(-6);
  const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `ORD-${datePart}-${randomPart}`;
}

export default function CartPage() {
  const { theme } = useTheme()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
    } else {
      setUser(user)
      loadCart(user.id)
    }
  }

  const loadCart = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('cart')
        .select(`*, products (*)`)
        .eq('user_id', userId)

      if (error) throw error
      setCartItems(data || [])
    } catch (error) {
      console.error('Error loading cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    try {
      const { error } = await supabase
        .from('cart')
        .update({ quantity: newQuantity })
        .eq('id', itemId)
      if (error) throw error
      if (user) loadCart(user.id)
    } catch (error) {
      console.error('Error updating quantity:', error)
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      const { error } = await supabase.from('cart').delete().eq('id', itemId)
      if (error) throw error
      if (user) loadCart(user.id)
    } catch (error) {
      console.error('Error removing item:', error)
    }
  }

  const calculateItemPrice = (item: CartItem) => {
    if (!item.products) return 0
    const price = item.products.has_promotion
      ? item.products.price * (1 - item.products.promotion_percentage / 100)
      : item.products.price
    return price * item.quantity
  }

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + calculateItemPrice(item), 0)
  }

  const handleCheckout = async () => {
    if (cartItems.length === 0 || !user) return
    try {
      const referenceCode = generateOrderReference();
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: calculateTotal(),
          status: 'pending',
          reference_code: referenceCode
        })
        .select().single()

      if (orderError) throw orderError;

      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.products?.name || '',
        quantity: item.quantity,
        unit_price: item.products?.price || 0,
        promotion_applied: item.products?.has_promotion || false,
        discount_percentage: item.products?.promotion_percentage || 0,
        subtotal: calculateItemPrice(item)
      }))

      await supabase.from('order_items').insert(orderItems)
      await supabase.from('cart').delete().eq('user_id', user.id)

      // Auto-message to chat logic remains same
      alert(`Order Success! Reference: ${order.reference_code}`);
      router.push('/chat')
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center text-white">
                <ShoppingBag size={28} />
            </div>
            <div>
                <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Your <span className="text-brand-primary italic">Selection</span></h1>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Review your medical inventory</p>
            </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-16 h-16 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Syncing Cart...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className={`${theme === 'dark' ? 'bg-gray-900/50 border-white/5' : 'bg-white border-gray-200'} rounded-[2.5rem] border p-20 text-center shadow-2xl`}>
            <div className="w-24 h-24 bg-gray-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="opacity-20" size={48} />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">The vault is empty</h2>
            <p className="opacity-50 max-w-md mx-auto mb-10 font-medium">You haven't added any pharmaceutical products to your order yet.</p>
            <button
              onClick={() => router.push('/products')}
              className="bg-brand-primary text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-brand-primary/20 flex items-center gap-3 mx-auto"
            >
              Browse Catalog <ArrowRight size={20} />
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Items Column */}
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item) => {
                if (!item.products) return null
                const finalPrice = item.products.has_promotion
                  ? item.products.price * (1 - item.products.promotion_percentage / 100)
                  : item.products.price

                return (
                  <div 
                    key={item.id}
                    className={`${theme === 'dark' ? 'bg-gray-900/40 border-white/5' : 'bg-white border-gray-200'} p-8 rounded-[2rem] border shadow-sm group hover:border-brand-primary/30 transition-all`}
                  >
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                      <div className="relative">
                        <img 
                            src={item.products.main_image_url} 
                            alt={item.products.name}
                            className="w-32 h-32 object-cover rounded-[1.5rem] shadow-2xl"
                        />
                        {item.products.has_promotion && (
                            <span className="absolute -top-3 -right-3 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full border-4 border-black">
                                -{item.products.promotion_percentage}%
                            </span>
                        )}
                      </div>

                      <div className="flex-1 text-center md:text-left">
                        <h3 className="text-2xl font-black tracking-tighter uppercase mb-1">{item.products.name}</h3>
                        <p className="text-sm opacity-50 font-medium mb-4 line-clamp-1">{item.products.description}</p>
                        
                        <div className="flex items-center justify-center md:justify-start gap-4">
                            <span className="text-2xl font-black tracking-tighter">${finalPrice.toFixed(2)}</span>
                            {item.products.has_promotion && (
                                <span className="text-sm opacity-30 line-through font-bold">${item.products.price.toFixed(2)}</span>
                            )}
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-4">
                        <div className={`flex items-center gap-1 p-1.5 rounded-2xl border ${theme === 'dark' ? 'bg-black border-white/10' : 'bg-gray-100 border-gray-200'}`}>
                            <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-2 hover:text-brand-primary transition-colors"
                            >
                                <Minus size={18} />
                            </button>
                            <span className="w-10 text-center font-black text-lg">{item.quantity}</span>
                            <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-2 hover:text-brand-primary transition-colors"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                        <button
                            onClick={() => removeItem(item.id)}
                            className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:opacity-100 opacity-50 transition-opacity flex items-center gap-2"
                        >
                            <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Summary Column */}
            <div className="lg:col-span-1">
              <div className={`${theme === 'dark' ? 'bg-gray-900 border-white/5' : 'bg-white border-gray-200'} p-10 rounded-[2.5rem] border shadow-2xl sticky top-28`}>
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 italic">Order Manifest</h2>
                
                <div className="space-y-4 mb-10">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-black uppercase opacity-40">Subtotal</span>
                    <span className="font-black">${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-black uppercase opacity-40">Logistics</span>
                    <span className="text-brand-primary font-black uppercase tracking-widest text-[10px]">Free Priority</span>
                  </div>
                  <div className="h-px bg-white/5 my-6" />
                  <div className="flex justify-between items-end">
                    <span className="font-black uppercase tracking-tighter text-lg">Total Amount</span>
                    <span className="text-4xl font-black tracking-tighter text-brand-primary">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-brand-primary text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] hover:scale-[1.02] transition-all shadow-xl shadow-brand-primary/30 flex items-center justify-center gap-4 group"
                >
                  Confirm Order <ArrowRight className="group-hover:translate-x-2 transition-transform" size={24} />
                </button>

                {/* Trust Badges */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 opacity-30">
                        <ShieldCheck size={16} />
                        <span className="text-[8px] font-black uppercase">Secure Protocol</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-30">
                        <Truck size={16} />
                        <span className="text-[8px] font-black uppercase">Fast Delivery</span>
                    </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}