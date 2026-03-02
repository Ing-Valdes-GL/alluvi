'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Search, CheckCircle2, Percent, Mail, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Footer from '@/components/Footer'

export default function Header() {
  const router = useRouter()
  const [isCatOpen, setIsCatOpen] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [searchValue, setSearchValue] = useState('')
  const [cartCount, setCartCount] = useState(0)
  const [products, setProducts] = useState<any[]>([])
  
  const [showPopup, setShowPopup] = useState(false)
  const [addedItemName, setAddedItemName] = useState('')
  const [filterPromo, setFilterPromo] = useState(false)

  // --- 1. CHARGEMENT DES DONNÉES ---
  useEffect(() => {
    const fetchData = async () => {
      const { data: catData } = await supabase.from('categories').select('*')
      setCategories(catData || [])
      const { data: prodData } = await supabase.from('products').select('*')
      setProducts(prodData || [])
    }
    fetchData()
  }, [])

  // --- 2. GESTION DU PANIER ---
  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      const totalItems = cart.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0)
      setCartCount(totalItems)
    }
    updateCartCount()
    window.addEventListener('storage', updateCartCount)
    window.addEventListener('cart-updated', updateCartCount) 
    return () => {
      window.removeEventListener('storage', updateCartCount)
      window.removeEventListener('cart-updated', updateCartCount)
    }
  }, [])

  const addToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault() // Empêche la navigation vers la page produit lors du clic sur le bouton
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingIndex = cart.findIndex((item: any) => item.id === product.id)
    if (existingIndex > -1) { cart[existingIndex].quantity += 1 } 
    else { cart.push({ ...product, quantity: 1 }) }
    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cart-updated'))
    setAddedItemName(product.name)
    setShowPopup(true)
    setTimeout(() => setShowPopup(false), 3000)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) { router.push(`/products?search=${encodeURIComponent(searchValue.trim())}`) }
  }

  const displayedProducts = products.filter((p: any) => {
    const matchesSearch = p.name.toLowerCase().includes(searchValue.toLowerCase())
    const matchesPromo = filterPromo ? p.on_sale === true : true
    return matchesSearch && matchesPromo
  })

  return (
    <div className="bg-white min-h-screen flex flex-col">
      
      {/* POPUP SUCCÈS */}
      <AnimatePresence>
        {showPopup && (
          <motion.div initial={{ opacity: 0, y: 50, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 50, x: '-50%' }} className="fixed bottom-10 left-1/2 z-[300] bg-[#0A0A0A] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[320px] border border-white/10">
            <div className="bg-green-500 p-1.5 rounded-full text-white"><CheckCircle2 size={18} /></div>
            <div className="flex-grow">
              <p className="text-[9px] uppercase font-black tracking-widest text-gray-400">Success</p>
              <p className="text-sm font-bold truncate">{addedItemName} added!</p>
            </div>
            <Link href="/cart" className="text-[#EF6C00] text-xs font-black uppercase underline decoration-2 underline-offset-4">Cart</Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BANDE DÉFILANTE */}
      <div className="bg-[#0A0A0A] text-white py-2.5 overflow-hidden border-b border-white/10 relative z-[100]">
        <div className="flex whitespace-nowrap animate-marquee">
          {[1, 2, 3].map((i) => (
            <span key={i} className="text-[10px] font-bold uppercase tracking-[0.2em] mx-10">Free Shipping on orders above £100 ★ Special Offer</span>
          ))}
        </div>
      </div>

      <header className="bg-white relative z-[90] border-b border-gray-100">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between gap-8">
          <Link href="/"><img src="/favicon.ico" alt="Alluvi" className="h-10 md:h-12" /></Link>
          <div className="hidden md:flex flex-grow max-w-2xl items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="flex-grow flex border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <input type="text" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} placeholder="Search a product..." className="flex-grow px-6 py-2.5 text-sm outline-none" />
              <button type="submit" className="bg-black text-white px-6"><Search size={18} /></button>
            </form>
            <button onClick={() => setFilterPromo(!filterPromo)} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border text-[10px] font-black uppercase ${filterPromo ? 'bg-[#EF6C00] text-white' : 'text-gray-400'}`}>
              <Percent size={14} /> {filterPromo ? 'Promos Only' : 'Everything'}
            </button>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/cart" className="relative group">
              <ShoppingCart size={24} className="text-gray-700 group-hover:text-orange-500" />
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{cartCount}</span>
            </Link>
          </div>
        </div>

        <nav className="bg-[#EF6C00]">
          <div className="container mx-auto px-4 flex items-center justify-between h-14">
            <div className="flex items-center h-full">
              <div className="hidden lg:flex items-center gap-10 text-white text-[11px] font-black uppercase tracking-widest">
                <Link href="/">HOME</Link>
                <Link href="/products">SHOP</Link>
                <Link href="/orders">MY ORDERS</Link>
                <Link href="/chat">SUPPORT</Link>
                <Link href="/admin" className="bg-white/10 px-3 py-1 rounded">ADMIN PANEL</Link>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-white">
              <p className="text-[10px] font-black uppercase">Order by Email</p>
              <a href="mailto:kentrellzaza83@gmail.com" className="bg-[#BF5600] p-2 rounded-full hover:bg-black transition-all"><Mail size={16} /></a>
            </div>
          </div>
        </nav>
      </header>

      {/* CONTENU PRINCIPAL (LA LISTE DE PRODUITS) */}
      <main className="container mx-auto px-4 py-16 bg-white flex-grow">
        <div className="flex flex-col items-center mb-12">
            <span className="bg-black text-white px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Collection</span>
            <h2 className="text-3xl md:text-4xl font-black text-center uppercase text-gray-900">
              {filterPromo ? 'Exclusive Deals' : 'Best Selling Products'}
            </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {displayedProducts.map((product: any) => (
            <motion.div 
              key={product.id} 
              layout 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col overflow-hidden"
            >
              {/* IMAGE CLIQUABLE VERS DÉTAILS */}
              <Link href={`/products/${product.id}`} className="relative aspect-square overflow-hidden bg-[#F9F9F9] flex items-center justify-center p-6 cursor-pointer">
                {product.on_sale && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white text-[9px] font-black px-2 py-1 rounded-md z-10">PROMO</div>
                )}
                <img 
                  src={product.main_image_url || "/placeholder.png"} 
                  className="max-h-full object-contain transition-transform duration-500 group-hover:scale-110" 
                  alt={product.name}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                  <span className="bg-white text-black text-[9px] font-black uppercase px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all">View Details</span>
                </div>
              </Link>

              {/* INFOS PRODUIT */}
              <div className="p-6 flex flex-col flex-grow">
                {/* CATÉGORIE : Orange, Petite et Espacée */}
                <span className="text-[#EF6C00] text-[10px] font-black uppercase tracking-[0.15em] mb-1 block">
                  {product.category_name || 'Uncategorized'}
                </span>

                {/* NOM CLIQUABLE */}
                <Link href={`/products/${product.id}`}>
                  <h3 className="font-black text-gray-900 uppercase text-lg mb-4 leading-tight group-hover:text-[#EF6C00] transition-colors cursor-pointer">
                    {product.name}
                  </h3>
                </Link>

                <p className="text-gray-400 text-xs mb-4 line-clamp-2 h-8">{product.description}</p>
                
                <div className="mt-auto">
                  <div className="flex items-baseline gap-2 mb-4">
                    <p className="text-[#EF6C00] font-black text-2xl">£{product.price}</p>
                    {product.on_sale && product.sale_price && (
                      <p className="text-gray-300 line-through text-sm">£{product.price}</p>
                    )}
                  </div>
                  
                  <button 
                    onClick={(e) => addToCart(e, product)} 
                    className="w-full bg-black text-white py-4 rounded-xl font-black uppercase text-[10px] hover:bg-[#EF6C00] transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    <ShoppingCart size={14} /> Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <Footer />

      <style jsx global>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 30s linear infinite; }
      `}</style>
    </div>
  )
}