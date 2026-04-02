'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { Minus, Plus, ShoppingCart, CheckCircle2, Share2, X, Shield, FileText } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ProductDetails() {
  const { id } = useParams()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showCOAModal, setShowCOAModal] = useState(false)

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

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#0ea5e9]"></div></div>
  if (!product) return <div className="min-h-screen bg-white flex items-center justify-center uppercase font-bold">Product Not Found</div>

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] font-sans">
      <Header />

      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed top-28 left-1/2 -translate-x-1/2 z-[100] bg-[#0ea5e9] text-white px-8 py-3 rounded-full shadow-xl flex items-center gap-3 font-bold text-sm">
            <CheckCircle2 size={18} /> {product.name} added to cart
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* --- FIL D'ARIANE --- */}
        <div className="container mx-auto px-6 pt-10">
          <nav className="text-[10px] text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <Link href="/" className="hover:text-[#0ea5e9]">Shop</Link> 
            <span>/</span> 
            <span className="text-gray-900 font-semibold">{product.name}</span>
          </nav>
        </div>

        {/* --- SECTION PRODUIT PRINCIPALE --- */}
        <section className="container mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="bg-[#F9F9F9] rounded-xl border border-gray-100 p-12 flex items-center justify-center relative">
            <img src={product.main_image_url} alt={product.name} className="w-full max-w-[450px] h-auto object-contain mix-blend-multiply" />
            <button className="absolute top-6 right-6 p-3 bg-white rounded-full shadow-sm hover:text-[#0ea5e9] border border-gray-100"><Share2 size={18} /></button>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 mb-2 bg-blue-50 w-fit px-2 py-1 rounded-md">
              <Shield size={14} className="text-[#1e3a8a]" />
              <span className="text-[#1e3a8a] text-[10px] font-black uppercase tracking-wider">Certified Vertex Product</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">{product.name}</h1>
            
         

            {/* 1ER EMPLACEMENT : EXTRAIT DE LA DESCRIPTION (DYNAMIQUE) */}
            <div className="mb-8 border-t border-gray-100 pt-6">
              <div 
                className="text-gray-600 text-sm leading-relaxed line-clamp-3 whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: product.description || "No description available." }}
              />
            </div>

            <p className="text-gray-500 text-sm mb-4">⭐ 4.6 (25 Reviews)</p>

            <p className="text-[#D32F2F] text-4xl font-bold mb-10">£{product.price}</p>

            <div className="flex flex-wrap items-center gap-6 mb-10">
              <div className="flex items-center border border-gray-200 rounded-lg h-14 bg-white overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-5 text-gray-400 hover:text-black transition-colors border-r border-gray-100"><Minus size={16} /></button>
                <input type="number" value={quantity} readOnly className="w-12 text-center font-bold text-sm outline-none bg-transparent" />
                <button onClick={() => setQuantity(quantity + 1)} className="px-5 text-gray-400 hover:text-black transition-colors border-l border-gray-100"><Plus size={16} /></button>
              </div>

              <button 
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 min-w-[200px] h-14 bg-[#0ea5e9] hover:bg-black text-white rounded-lg font-bold uppercase text-[11px] tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg shadow-sky-50 disabled:bg-gray-300"
              >
                <ShoppingCart size={18} /> {product.stock > 0 ? 'Add To Cart' : 'Out of Stock'}
              </button>

              {/* View COA Button - Only shown if product has COA */}
              {product.coa_url && (
                <button
                  onClick={() => setShowCOAModal(true)}
                  className="h-14 px-6 border border-gray-200 hover:border-orange-500 text-gray-600 hover:text-orange-500 rounded-lg font-bold uppercase text-[10px] tracking-[0.15em] transition-all flex items-center justify-center gap-2 bg-transparent"
                >
                  <FileText size={16} /> View COA
                </button>
              )}
            </div>
          </div>
        </section>

        {/* --- BARRE D'AVANTAGES BLUE --- */}
        <div className="bg-blue-50 py-10 border-y border-sky-50">
          <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-700">
              <span className="text-[#0ea5e9] text-xl">✔</span> Money Back Guarantee
            </div>
            <div className="flex items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-700">
              <span className="text-[#0ea5e9] text-xl">✔</span> Top Quality Vegan Item
            </div>
            <div className="flex items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-700">
              <span className="text-[#0ea5e9] text-xl">✔</span> Fast & Secure Checkout
            </div>
          </div>
        </div>

        {/* --- 2ÈME EMPLACEMENT : DESCRIPTION COMPLÈTE (DYNAMIQUE) --- */}
        <section className="container mx-auto px-6 py-24 max-w-4xl">
          <div className="flex gap-10 border-b border-gray-100 mb-12">
            <button className="pb-5 border-b-2 border-[#0ea5e9] font-bold text-[11px] uppercase tracking-[0.2em] text-[#1A1A1A]">Description</button>
            <button className="pb-5 font-bold text-[11px] uppercase tracking-[0.2em] text-gray-400">Reviews (2)</button>
          </div>

          <div className="prose prose-neutral max-w-none">
            <div 
              className="text-gray-600 text-[15px] leading-[1.8] whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: product.description || "Full product details are being updated." }}
            />
            
            {/* Warning de sécurité (Conformité) */}
            <div className="mt-16 p-8 bg-red-50 border border-red-100 rounded-2xl">
              <h4 className="text-red-700 font-bold text-xs uppercase tracking-[0.2em] mb-3">Legal Notice</h4>
              <p className="text-red-600/80 text-[13px] leading-relaxed italic">
                This research compound is for laboratory use only. Not for human or veterinary use.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* COA Modal */}
      <AnimatePresence>
        {showCOAModal && product?.coa_url && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowCOAModal(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-md z-[200]"
            />
            <div className="fixed inset-0 z-[201] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-4xl max-h-[85vh] bg-white rounded-3xl shadow-2xl overflow-hidden pointer-events-auto"
              >
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-[#0ea5e9]" />
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      Certificate of Analysis
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowCOAModal(false)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-orange-100 text-slate-500 hover:text-orange-500 transition-all duration-200 group"
                    aria-label="Close modal"
                  >
                    <X size={20} className="group-hover:rotate-90 transition-transform duration-200" />
                  </button>
                </div>
                
                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(85vh-140px)] bg-slate-50">
                  {product.coa_url.endsWith('.pdf') ? (
                    <iframe
                      src={product.coa_url}
                      className="w-full h-[600px]"
                      title="Certificate of Analysis"
                    />
                  ) : (
                    <img
                      src={product.coa_url}
                      alt="Certificate of Analysis"
                      className="w-full h-auto max-h-[600px] object-contain"
                    />
                  )}
                </div>
                
                {/* Footer */}
                <div className="sticky bottom-0 px-6 py-4 border-t border-slate-200 bg-white flex justify-between items-center">
                  <p className="text-sm text-slate-500">
                    <span className="font-semibold">Product:</span> {product.name}
                  </p>
                  <a
                    href={product.coa_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#0ea5e9] hover:bg-sky-600 text-white px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-200 shadow-lg shadow-sky-500/25"
                  >
                    Open in New Tab
                  </a>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}