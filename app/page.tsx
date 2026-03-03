'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ShoppingCart, ArrowRight, X, Smartphone, Zap, ShieldCheck } from 'lucide-react'

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [addedProduct, setAddedProduct] = useState<any | null>(null)

  useEffect(() => {
    async function loadProducts() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .limit(3) // Ajusté pour laisser de la place aux nouvelles sections
      setProducts(data || [])
      setLoading(false)
    }
    loadProducts()
  }, [])

  const addToCart = (product: any) => {
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = currentCart.find((item: any) => item.id === product.id)
    if (existingItem) { existingItem.quantity += 1 } 
    else { currentCart.push({ ...product, quantity: 1 }) }
    localStorage.setItem('cart', JSON.stringify(currentCart))
    setAddedProduct(product)
    window.dispatchEvent(new Event('storage'))
  }

  return (
    <div className="min-h-screen bg-white text-[#0A0A0B]">
      <Header />

{/* --- HERO SECTION : REPRODUCTION EXACTE MAQUETTE --- */}
<section className="relative bg-[#050505] min-h-[85vh] flex items-center justify-center overflow-hidden">
  
  {/* FOND GRILLE TECHNIQUE */}
  <div className="absolute inset-0 z-0 opacity-[0.15]" 
       style={{ backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #d7cec8 1px, transparent 1px)`, 
                backgroundSize: '6px 6px' }}>
  </div>

  <div className="container mx-auto px-4 relative z-10 flex items-center justify-between">
    
    {/* ARCHE GAUCHE (WEIGHT LOSS) */}
    <motion.div 
      initial={{ opacity: 0, x: -40 }} 
      animate={{ opacity: 1, x: 0 }} 
      className="hidden lg:block relative w-[280px] h-[300px] rounded-t-full overflow-hidden bg-[#EF6C00] flex-shrink-0"
    >
      <img src="/hero-right-arch.png" className="w-full h-full object-contain p-1 scale-110 z-10 relative" alt="" />
      <div className="absolute bottom-6 left-0 w-full text-center">
        
      </div>
    </motion.div>

    {/* BLOC CENTRAL : TYPOGRAPHIE MAQUETTE */}
    <div className="flex flex-col items-center text-center flex-grow px-10">
      <img src="/leaf-icon-gray.png" className="w-14 h-14 mb-8 opacity-70" alt="Logo" />
      
      <h1 className="text-4xl md:text-6xl font-black text-white leading-[0.8] tracking-[-0.06em] uppercase mb-8">
        ALLUVI <br /> HEALTH CARE
      </h1>
      
      <p className="text-xl md:text-3xl text-gray-400 font-medium tracking-tight mb-12">
        Savor the Taste of <span className="text-[#EF6C00] font-bold">Alluvi UK</span> Lifestyle!
      </p>
      
      <Link href="/products" className="group relative bg-gradient-to-r from-[#EF6C00] to-[#FF8C33] text-white px-14 py-5 rounded-xl font-black uppercase text-sm tracking-[0.2em] shadow-[0_15px_40px_rgba(239,108,0,0.3)] transition-all hover:scale-105">
        <span className="flex items-center gap-3">
            Browse All Products <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
        </span>
      </Link>
    </div>

    {/* ARCHE DROITE (RECOVERY) */}
    <motion.div 
      initial={{ opacity: 0, x: 40 }} 
      animate={{ opacity: 1, x: 0 }} 
      className="hidden lg:block relative w-[280px] h-[300px] rounded-t-full overflow-hidden bg-[#00A699] flex-shrink-0"
    >
      <img src="/hero-left-arch.png" className="w-full h-full object-contain p-1 scale-110 z-10 relative" alt="" />
      <div className="absolute bottom-6 left-0 w-full text-center">
       
      </div>
    </motion.div>

  </div>

  {/* MARQUEE FOOTER */}
  <div className="absolute bottom-0 w-full bg-[#EF6C00] py-4 z-20 overflow-hidden border-t border-white/10">
    <div className="flex whitespace-nowrap animate-marquee">
      {[1, 2, 3].map((i) => (
        <span key={i} className="text-white font-black text-[12px] uppercase tracking-[0.3em] mx-10">
          ★ Fast Shipping on orders above £100 ★ 100% Lab Tested ★ Pure Compounds ★ 
        </span>
      ))}
    </div>
  </div>
</section>

      {/* --- BEST SELLERS --- */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-4xl font-black uppercase tracking-tighter">Best Selling Products</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#EF6C00] rounded-xl p-10 flex flex-col justify-end min-h-[450px] relative overflow-hidden group">
               <div className="absolute top-10 left-10 opacity-20 group-hover:scale-110 transition-transform duration-700"><img src="/leaf-bg.png" className="w-32" /></div>
               <div className="relative z-10"><img src="/leaf-white.png" className="w-8 mb-6" /><h3 className="text-3xl font-black text-white leading-tight">Alluvi<br/>Healthcare<br/>Retratutide</h3></div>
            </div>
            {products.map((product) => (
              <div key={product.id} className="group border border-gray-100 rounded-xl p-6 flex flex-col hover:shadow-xl transition-all">
                <div className="aspect-square mb-6 overflow-hidden bg-[#F7F7F7] rounded-lg">
                  <img src={product.main_image_url} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform" />
                </div>
                <p className="text-[#EF6C00] text-[10px] font-bold uppercase mb-1">{product.category_name || 'Uncategorized'}</p>
                <h4 className="font-bold text-sm mb-4 h-10">{product.name}</h4>
                <p className="text-[#A13BB4] font-black text-lg mb-6">£{product.price}</p>
                <button onClick={() => addToCart(product)} className="w-full border border-gray-200 py-3 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-colors"><ShoppingCart size={14} /> Add To Cart</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION 1: RETATRUTIDE EVALUATION (Maquette 2) --- */}
      <section className="py-24 bg-[#F9F9F9] overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <div className="w-12 h-12 bg-[#8BC34A] rounded-lg flex items-center justify-center mb-8 shadow-lg shadow-green-200">
                <img src="/leaf-white.png" className="w-6 h-6" alt="Organic" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight tracking-tighter">Retatrutide – Pre-Filled Pen<br/>Evaluation</h2>
              <p className="text-gray-500 leading-relaxed mb-6 max-w-lg">
                Part of <span className="text-[#EF6C00] font-bold">Alluvi Labs'</span> ongoing research program into advanced GLP-1 multi-agonist compounds. This formulation is supplied in controlled batches for laboratory analysis of stability, compound behaviour, and injector system performance.
              </p>
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-10">Not for human or veterinary consumption.</p>
              <Link href="/about" className="bg-[#EF6C00] text-white px-8 py-4 rounded-lg font-black uppercase text-[10px] tracking-widest flex items-center gap-3 w-fit hover:bg-black transition-all shadow-xl shadow-orange-200">
                About Store <ArrowRight size={14} />
              </Link>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="relative z-10 scale-110 lg:translate-x-10">
                <img src="/supplement-box.png" alt="Supplement Box" className="w-full drop-shadow-[0_35px_35px_rgba(0,0,0,0.15)]" />
              </div>
              {/* Forme ondulée en arrière plan comme sur la maquette */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#EF6C00]/5 -z-0 rounded-[40%_60%_70%_30%/40%_50%_60%_70%] animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 2: PROMO BANNER (Maquette 3) --- */}
      <section className="py-10">
        <div className="container mx-auto px-6">
          <div className="bg-[#050A30] rounded-3xl overflow-hidden flex flex-col md:flex-row items-center relative min-h-[380px]">
            <div className="flex-1 p-12 lg:p-20 z-10">
              <h3 className="text-white text-4xl md:text-5xl font-black mb-4 leading-none tracking-tighter">No Prep. No Hassle.<br/>Just Precision Dosing.</h3>
              <p className="text-[#EF6C00] text-2xl font-black mb-10">Upto 35% off today!</p>
              <Link href="/products" className="inline-flex items-center gap-3 border-2 border-white/20 text-white px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-black transition-all">
                Shop Now <ArrowRight size={14} />
              </Link>
            </div>
            <div className="flex-1 bg-[#EF6C00] w-full h-full min-h-[380px] flex items-center justify-center relative">
               <div className="absolute left-0 top-0 bottom-0 w-24 bg-[#050A30] hidden md:block" style={{ clipPath: 'polygon(0 0, 0% 100%, 100% 0)' }} />
               <div className="relative z-10 flex flex-col items-center">
                 <h4 className="text-white text-7xl font-black opacity-40 absolute -left-20 top-1/2 -translate-y-1/2 rotate-[-90deg]">Alluvi Labs</h4>
                 <img src="/phone-app.png" className="w-48 lg:w-64 drop-shadow-2xl translate-y-8" alt="App Preview" />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 3: INFO BAR (Maquette 1) --- */}
      <section className="bg-[#E9DCC5] py-20 mt-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 border-2 border-black/10 rounded-2xl flex items-center justify-center shrink-0">
                <Zap className="text-black" size={28} />
              </div>
              <div>
                <h5 className="font-black text-sm uppercase tracking-wider mb-1">Fastest Delivery</h5>
                <p className="text-[11px] font-bold text-black/50 uppercase">Donec eget vestibulum quam</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 border-2 border-black/10 rounded-2xl flex items-center justify-center shrink-0">
                <ShieldCheck className="text-black" size={28} />
              </div>
              <div>
                <h5 className="font-black text-sm uppercase tracking-wider mb-1">Quality Products</h5>
                <p className="text-[11px] font-bold text-black/50 uppercase">100% Lab Tested & Verified</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 border-2 border-black/10 rounded-2xl flex items-center justify-center shrink-0">
                <Smartphone className="text-black" size={28} />
              </div>
              <div>
                <h5 className="font-black text-sm uppercase tracking-wider mb-1">Secure Payments</h5>
                <p className="text-[11px] font-bold text-black/50 uppercase">Encrypted Transaction Data</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- POPUP CONFIRMATION --- */}
      <AnimatePresence>
        {addedProduct && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[300] backdrop-blur-sm" onClick={() => setAddedProduct(null)} />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white z-[310] rounded-xl p-8 shadow-2xl text-center">
              <div className="bg-[#FFF5EB] p-4 rounded-lg mb-6"><p className="text-gray-600 text-xs font-bold italic">Product added to cart.</p></div>
              <img src={addedProduct.main_image_url} className="w-20 h-20 mx-auto object-contain mb-4" />
              <h6 className="font-bold text-sm mb-6">{addedProduct.name}</h6>
              <div className="flex gap-4">
                <button onClick={() => setAddedProduct(null)} className="flex-1 bg-[#EF6C00] text-white py-3 rounded-md font-black uppercase text-[10px]">Continue</button>
                <Link href="/cart" className="flex-1 bg-black text-white py-3 rounded-md font-black uppercase text-[10px] flex items-center justify-center gap-2">Cart <ShoppingCart size={14}/></Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
      <style jsx global>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 25s linear infinite; }
      `}</style>
    </div>
  )
}