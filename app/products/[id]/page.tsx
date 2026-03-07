'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { Minus, Plus, ShoppingCart, CheckCircle2, Heart, Share2 } from 'lucide-react'
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
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
      if (!error) setProduct(data)
      setLoading(false)
    }
    fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingIndex = cart.findIndex((item: any) => item.id === product.id)
    if (existingIndex > -1) { cart[existingIndex].quantity += quantity } 
    else { cart.push({ ...product, quantity }) }
    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cart-updated'))
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#EF6C00]"></div></div>
  if (!product) return <div className="min-h-screen bg-white flex items-center justify-center uppercase font-bold">Product Not Found</div>

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A]">
      <Header />

      {/* NOTIFICATION SUCCÈS */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed top-28 left-1/2 -translate-x-1/2 z-[100] bg-[#EF6C00] text-white px-8 py-3 rounded-full shadow-xl flex items-center gap-3 font-bold text-sm">
            <CheckCircle2 size={18} /> {product.name} added to cart
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* --- SECTION 1 : FIL D'ARIANE (Maquette 1) --- */}
        <div className="container mx-auto px-6 pt-8">
          <nav className="text-[11px] text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Link href="/" className="hover:text-[#EF6C00]">Shop</Link> 
            <span>|</span> 
            <Link href="/products" className="hover:text-[#EF6C00]">Uncategorized</Link>
            <span>|</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>

        {/* --- SECTION 2 : PRODUIT (Maquette 1 & 2) --- */}
        <section className="container mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Image avec loupe */}
          <div className="relative group bg-[#F9F9F9] rounded-xl overflow-hidden border border-gray-100 p-8">
            <img 
              src={product.main_image_url} 
              alt={product.name} 
              className="w-full h-auto object-contain mix-blend-multiply"
            />
            <button className="absolute top-4 right-4 bg-white p-2.5 rounded-full shadow-md text-gray-400 hover:text-[#EF6C00] transition-colors">
              <Share2 size={18} />
            </button>
          </div>

          {/* Détails d'achat */}
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">{product.name}</h1>
            
            <div className="flex items-center gap-1 mb-6 text-[#EF6C00]">
              {[...Array(5)].map((_, i) => <span key={i} className="text-lg">★</span>)}
              <span className="text-gray-400 text-[11px] ml-2 font-medium">(2 CUSTOMER REVIEWS)</span>
            </div>

            <div className="space-y-4 mb-8 border-t border-gray-100 pt-6">
              <p className="font-bold text-sm uppercase tracking-wide">Each Kit Includes:</p>
              <ul className="text-gray-600 text-[14px] space-y-2 list-disc ml-5">
                <li>Pre-filled Research device (40mg total)</li>
                <li>Comprehensive research information sheet</li>
              </ul>
            </div>

            <p className="text-[#D32F2F] text-3xl font-bold mb-8">£{product.price}</p>

            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-200 rounded-lg h-14 bg-white">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 text-gray-400 hover:text-black"><Minus size={16} /></button>
                <input type="number" value={quantity} readOnly className="w-10 text-center font-bold outline-none" />
                <button onClick={() => setQuantity(quantity + 1)} className="px-4 text-gray-400 hover:text-black"><Plus size={16} /></button>
              </div>

              <button 
                onClick={handleAddToCart}
                className="flex-1 h-14 bg-[#EF6C00] hover:bg-black text-white rounded-lg font-bold uppercase text-[12px] tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg shadow-orange-100"
              >
                <ShoppingCart size={18} /> Add To Cart
              </button>
            </div>

            <div className="mt-10 pt-6 border-t border-gray-100 space-y-2">
              <p className="text-[12px] text-gray-500"><span className="font-bold text-gray-900">Category:</span> Uncategorized</p>
              <p className="text-[12px] text-gray-500 leading-relaxed"><span className="font-bold text-gray-900">Tags:</span> research, compound, laboratory-use, bpc-157</p>
            </div>
          </div>
        </section>

        {/* --- SECTION 3 : BARRE D'AVANTAGES BEIGE (Maquette 3) --- */}
        <div className="bg-[#FFF8F1] py-6 border-y border-orange-100">
          <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-center gap-3 text-[12px] font-bold uppercase tracking-wider text-gray-700">
              <span className="text-[#EF6C00]">✔</span> Money Back Guarantee
            </div>
            <div className="flex items-center justify-center gap-3 text-[12px] font-bold uppercase tracking-wider text-gray-700">
              <span className="text-[#EF6C00]">✔</span> Top Quality Vegan Item
            </div>
            <div className="flex items-center justify-center gap-3 text-[12px] font-bold uppercase tracking-wider text-gray-700">
              <span className="text-[#EF6C00]">✔</span> Fast & Secure Checkout
            </div>
          </div>
        </div>

        {/* --- SECTION 4 : DESCRIPTION DÉTAILLÉE (Maquette 4) --- */}
        <section className="container mx-auto px-6 py-20 max-w-4xl">
          <h2 className="text-2xl font-bold mb-8 border-b border-gray-100 pb-4">Product Description</h2>
          <div className="prose prose-orange max-w-none text-gray-600 text-sm leading-loose">
            <p className="mb-6 font-medium text-gray-900">{product.description || "Detailed research formulation supplied in a pre-filled research device."}</p>
            
            <p className="mb-6">Produced exclusively for controlled laboratory R&D applications. Provided in sealed batches to support compound stability analysis and formulation studies.</p>
            
            <div className="bg-red-50 border-l-4 border-red-500 p-4 my-8">
              <p className="text-red-700 font-bold text-xs uppercase tracking-tight">
                Not for human or veterinary consumption. Research & Development purposes only.
              </p>
            </div>

            <h3 className="text-gray-900 font-bold text-lg mb-4">Storage & Handling:</h3>
            <ul className="list-disc ml-5 space-y-2 mb-8">
              <li>Store refrigerated (2–8°C). Do not freeze.</li>
              <li>Supplied in fixed-volume sealed format for laboratory analysis.</li>
            </ul>

            <h3 className="text-gray-900 font-bold text-lg mb-4">Delivery Information:</h3>
            <p>Dispatched with a cold pack via Tracked 2 DAY UK Delivery to ensure integrity.</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}