'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Minus, 
  Plus, 
  ShoppingCart, 
  ChevronLeft, 
  FileText, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ProductDetails() {
  const { id } = useParams()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (!error) setProduct(data)
      setLoading(false)
    }
    fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingIndex = cart.findIndex((item: any) => item.id === product.id)
    
    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity
    } else {
      cart.push({ ...product, quantity })
    }
    
    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cart-updated'))
    
    // Notification de succès sans redirection
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  // Logique du badge de stock
  const getStockStatus = () => {
    if (!product.stock || product.stock <= 0) return { label: 'Out of Stock', color: 'text-red-500 bg-red-500/10', dot: 'bg-red-500' }
    if (product.stock < 10) return { label: 'Low Stock', color: 'text-orange-500 bg-orange-500/10', dot: 'bg-orange-500' }
    return { label: 'In Stock', color: 'text-[#00A67E] bg-[#00A67E]/10', dot: 'bg-[#00A67E]' }
  }

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#EF6C00]"></div></div>
  if (!product) return <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center uppercase font-black">Product Not Found</div>

  const stockStatus = getStockStatus()

  return (
    <div className="min-h-screen bg-[#050505] text-white font-mono">
      <Header />

      {/* NOTIFICATION FLOTTANTE */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ y: -100, x: '-50%' }} animate={{ y: 20, x: '-50%' }} exit={{ y: -100, x: '-50%' }} className="fixed top-24 left-1/2 z-[500] bg-[#00EDAF] text-black px-8 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 shadow-2xl">
            <CheckCircle2 size={18} /> {quantity}x {product.name} Added to cart
          </motion.div>
        )}
      </AnimatePresence>

      <main className="container mx-auto px-4 py-12 md:py-20">
        <Link href="/products" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-12 uppercase text-[9px] font-black tracking-[0.2em]">
          <ChevronLeft size={14} /> Back to Catalog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* IMAGE SECTION */}
          <div className="relative">
            <div className="aspect-square bg-[#0A0A0A] rounded-[2.5rem] border border-white/5 flex items-center justify-center p-12 relative overflow-hidden">
              <div className="absolute top-8 left-8 bg-[#00A67E]/10 border border-[#00A67E]/20 text-[#00A67E] px-4 py-2 rounded-full flex items-center gap-2 text-[9px] font-black uppercase tracking-widest z-10 backdrop-blur-md">
                <ShieldCheck size={14} /> Verified Lab Result
              </div>
              <img src={product.main_image_url} alt={product.name} className="max-h-full object-contain" />
            </div>
          </div>

          {/* CONTENT SECTION */}
          <div className="flex flex-col justify-center">
            <span className="text-[#EF6C00] text-[10px] font-black uppercase tracking-[0.4em] mb-4">Compound Analysis</span>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-8">
              <span className="text-3xl font-black">£{product.price} GBP</span>
              <div className={`px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${stockStatus.color}`}>
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${stockStatus.dot}`} />
                {stockStatus.label}
              </div>
            </div>

            <div className="space-y-6 mb-10 max-w-xl">
              <p className="text-gray-400 text-sm leading-relaxed uppercase font-medium">
                {product.description || "High-purity research compound for laboratory use. Analyzed for consistency and molecular stability."}
              </p>
              <div className="border-l-2 border-red-600 bg-red-600/5 p-4">
                <p className="text-red-500 text-[9px] font-black uppercase tracking-tight leading-tight">
                  Warning: Strictly for in-vitro research. Not for human use.
                </p>
              </div>
            </div>

            {/* ACTION CARD */}
            <div className="bg-[#0D0D0D] border border-white/5 p-8 rounded-[2rem] max-w-sm">
              <div className="flex items-center justify-between mb-8">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Quantity</span>
                <div className="flex items-center gap-5 bg-black p-1.5 rounded-xl border border-white/10">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white transition-all"><Minus size={14} /></button>
                  <span className="text-md font-black w-4 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white transition-all"><Plus size={14} /></button>
                </div>
              </div>

              <button 
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
                  product.stock > 0 
                  ? 'bg-[#00EDAF] text-black hover:bg-white shadow-[0_0_30px_rgba(0,237,175,0.15)]' 
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ShoppingCart size={18} /> {product.stock > 0 ? 'Add to Cart' : 'Sold Out'}
              </button>

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}