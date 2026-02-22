'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ShoppingCart, ArrowRight, X } from 'lucide-react'

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [addedProduct, setAddedProduct] = useState<any | null>(null) // Pour la popup de confirmation

  useEffect(() => {
    async function loadProducts() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .limit(5) // On en prend 5 pour remplir la grille selon la maquette
      setProducts(data || [])
      setLoading(false)
    }
    loadProducts()
  }, [])

  // Fonction d'ajout au panier sans connexion (LocalStorage)
  const addToCart = (product: any) => {
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = currentCart.find((item: any) => item.id === product.id)
    
    if (existingItem) {
      existingItem.quantity += 1
    } else {
      currentCart.push({ ...product, quantity: 1 })
    }
    
    localStorage.setItem('cart', JSON.stringify(currentCart))
    setAddedProduct(product) // Déclenche la popup (image_2efb5f.jpg)
    
    // Déclenche un événement pour que le Header mette à jour son compteur
    window.dispatchEvent(new Event('storage'))
  }

  return (
    <div className="min-h-screen bg-white text-[#0A0A0B]">
      <Header />

      {/* --- HERO SECTION (image_2ef43a.jpg) --- */}
      <section className="relative bg-[#0A0A0B] pt-32 pb-48 overflow-hidden">
        {/* Grille de fond subtile */}
        <div className="absolute inset-0 opacity-20 bg-[url('/grid-pattern.png')] bg-repeat" />
        
        <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">
          <motion.img 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            src="/leaf-icon-gray.png" className="w-12 h-12 mb-8 opacity-50" alt="" 
          />
          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-none mb-6">
            ALLUVI HEALTH CARE
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl font-medium">
            Savor the Taste of <span className="text-[#EF6C00]">Alluvi UK</span> Lifestyle!
          </p>
          
          <Link href="/products" className="bg-[#EF6C00] text-white px-10 py-4 rounded-md font-black uppercase text-xs tracking-[0.2em] flex items-center gap-3 hover:bg-white hover:text-[#EF6C00] transition-all">
            Browse All Products <ArrowRight size={16} />
          </Link>

          {/* Boites flottantes sur les côtés */}
          <div className="absolute left-10 top-1/2 -translate-y-1/2 hidden lg:block w-72">
            <img src="/hero-left.png" alt="" className="drop-shadow-2xl rotate-[-5deg]" />
          </div>
          <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden lg:block w-72">
            <img src="/hero-right.png" alt="" className="drop-shadow-2xl rotate-[5deg]" />
          </div>
        </div>

        {/* --- BANDE JAUNE/ORANGE ROULANTE --- */}
        <div className="absolute bottom-0 w-full bg-[#EF6C00] py-4 border-t border-white/10">
          <div className="flex whitespace-nowrap animate-marquee">
            {[1, 2, 3].map((i) => (
              <span key={i} className="text-white font-black text-[11px] uppercase tracking-[0.2em] mx-10">
                ★ Fast Shipping on orders above £250 ★ Special Offer : Get 35% Discount Code "alluvicare26" ★ Fast Shipping on orders above £100 ★ 100% Lab Tested
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* --- DESCRIPTION & PRODUITS (image_2ef45d.jpg) --- */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <p className="text-gray-500 text-xs leading-relaxed font-medium">
              Alluvi Healthcare provides advanced <span className="text-[#EF6C00] border-b border-[#EF6C00]/30 cursor-help">peptide</span>-based supplements and weight management solutions designed to support energy, recovery, and overall wellness. Our mission is to make effective, science-driven <span className="text-[#EF6C00] border-b border-[#EF6C00]/30 cursor-help">health</span> and performance products accessible to everyone. Trusted quality for research teams.
            </p>
            <h2 className="text-4xl font-black mt-10 uppercase tracking-tighter">Best Selling Products</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* CARTE ORANGE LATÉRALE (image_2ef45d.jpg) */}
            <div className="bg-[#EF6C00] rounded-xl p-10 flex flex-col justify-end min-h-[450px] relative overflow-hidden group">
               <div className="absolute top-10 left-10 opacity-20 group-hover:scale-110 transition-transform duration-700">
                  <img src="/leaf-bg.png" className="w-32" alt="" />
               </div>
               <div className="relative z-10">
                  <img src="/leaf-white.png" className="w-8 mb-6" alt="" />
                  <h3 className="text-3xl font-black text-white leading-tight">Alluvi<br/>Healthcare<br/>Retratutide</h3>
               </div>
            </div>

            {/* GRILLE DE PRODUITS */}
            {products.map((product) => (
              <div key={product.id} className="group border border-gray-100 rounded-xl p-6 flex flex-col hover:shadow-xl transition-all">
                <div className="aspect-square mb-6 overflow-hidden bg-[#F7F7F7] rounded-lg">
                  <img src={product.main_image_url} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform" alt="" />
                </div>
                <p className="text-[#EF6C00] text-[10px] font-bold uppercase mb-1 underline underline-offset-4 decoration-[#EF6C00]/30">{product.category_name || 'Uncategorized'}</p>
                <h4 className="font-bold text-sm mb-4 h-10 flex-grow">{product.name}</h4>
                <p className="text-[#A13BB4] font-black text-lg mb-6">£{product.price}</p>
                <button 
                  onClick={() => addToCart(product)}
                  className="w-full border border-gray-200 py-3 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-colors"
                >
                  <ShoppingCart size={14} /> Add To Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- INFO BAR (image_2ef77c.png) --- */}
      <section className="bg-[#D4BC8E] py-16">
         <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex items-center gap-6 border-r border-black/10 last:border-0">
               <div className="p-4 border border-black/20 rounded-lg"><img src="/truck-icon.png" className="w-8" /></div>
               <div>
                  <h5 className="font-black text-sm uppercase">Fastest Delivery</h5>
                  <p className="text-[11px] font-medium opacity-70">Donec eget vestibuls quam</p>
               </div>
            </div>
            {/* ... Répéter pour Quality Products et Secure Payments ... */}
         </div>
      </section>

      {/* --- POPUP DE CONFIRMATION AJOUT PANIER (image_2efb5f.jpg) --- */}
      <AnimatePresence>
        {addedProduct && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[300] backdrop-blur-sm" onClick={() => setAddedProduct(null)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white z-[310] rounded-xl p-8 shadow-2xl"
            >
              <button onClick={() => setAddedProduct(null)} className="absolute top-4 right-4 text-gray-400 hover:text-black"><X size={20}/></button>
              
              <div className="bg-[#FFF5EB] p-4 rounded-lg text-center mb-6">
                 <p className="text-gray-600 text-xs font-bold italic">Product has been added to your cart.</p>
              </div>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-gray-50 rounded p-1 border border-gray-100">
                  <img src={addedProduct.main_image_url} className="w-full h-full object-contain" alt="" />
                </div>
                <div>
                   <h6 className="font-bold text-sm">{addedProduct.name}</h6>
                   <p className="text-xs font-bold text-gray-400">1 × £{addedProduct.price}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setAddedProduct(null)} className="flex-1 bg-[#EF6C00] text-white py-3 rounded-md font-black uppercase text-[10px] tracking-widest shadow-lg shadow-orange-500/20">1 Item</button>
                <Link href="/cart" className="flex-1 bg-[#333] text-white py-3 rounded-md font-black uppercase text-[10px] tracking-widest text-center flex items-center justify-center gap-2">View Cart <ShoppingCart size={14}/></Link>
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