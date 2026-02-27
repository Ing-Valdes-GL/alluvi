'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Search, ChevronDown, Phone, Menu, X, Facebook, Twitter, Instagram, Youtube, CheckCircle2, Percent, Mail } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Footer from '@/components/Footer'

export default function Header() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
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

  const addToCart = (product: any) => {
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
    <div className="bg-white min-h-screen flex flex-col"> {/* Ajout de flex-col pour pousser le footer en bas */}
      
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
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">{cartCount}</span>
            </Link>
           
          </div>
        </div>

        <nav className="bg-[#EF6C00]">
          <div className="container mx-auto px-4 flex items-center justify-between h-14">
            <div className="flex items-center h-full">
              <div className="relative h-full">
               
                <AnimatePresence>
                  {isCatOpen && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }} className="absolute top-full left-0 w-72 bg-white shadow-2xl z-[110] py-5 border border-gray-100">
                      {categories.map((cat: any) => (
                        <Link key={cat.id} href={`/products?category=${cat.id}`} className="flex items-center gap-4 px-8 py-3.5 hover:bg-gray-50 text-[13px] font-bold">
                          <img src={cat.icon_url || "/leaf-icon.png"} className="w-5 h-5" alt="" />{cat.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="hidden lg:flex items-center gap-10 ml-10 text-white text-[11px] font-bold uppercase tracking-widest">
                <Link href="/">HOME</Link>
                <Link href="/products">SHOP</Link>
                <Link href="/orders">MY ORDERS</Link>
                <Link href="/chat">SUPPORT</Link>
             
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-white">
              <p className="text-[10px] font-black uppercase">Order by Email</p>
              <a href="mailto:kentrellzaza83@gmail.com" className="bg-[#BF5600] p-2 rounded-full hover:bg-black transition-all"><Mail size={16} /></a>
            </div>
          </div>
        </nav>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="container mx-auto px-4 py-16 bg-white flex-grow">
        <div className="flex flex-col items-center mb-12">
            <span className="bg-black text-white px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Collection</span>
            <h2 className="text-3xl md:text-4xl font-black text-center uppercase text-gray-900">
              {filterPromo ? 'Exclusive Deals' : 'Featured Products'}
            </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {displayedProducts.map((product: any) => (
            <motion.div key={product.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col">
              <div className="relative aspect-square overflow-hidden bg-[#F9F9F9] flex items-center justify-center p-6 rounded-t-2xl">
                {product.on_sale && <div className="absolute top-4 right-4 bg-red-500 text-white text-[9px] font-black px-2 py-1 rounded-md">PROMO</div>}
                <img src={product.image_url || "/placeholder.png"} className="max-h-full object-contain transition-transform group-hover:scale-110" />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="font-black text-gray-900 uppercase text-lg mb-1">{product.name}</h3>
                <p className="text-gray-400 text-xs mb-4 line-clamp-2 h-8">{product.description}</p>
                <div className="mt-auto">
                  <p className="text-[#EF6C00] font-black text-2xl mb-4">£{product.price}</p>
                  <button onClick={() => addToCart(product)} className="w-full bg-black text-white py-3 rounded-lg font-black uppercase text-[10px] hover:bg-[#EF6C00] transition-all">Add to Cart</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* --- FOOTER --- */}
      <Footer />

      {/* MENU MOBILE */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="fixed inset-y-0 left-0 w-80 bg-white z-[210] p-10 flex flex-col">
              <button onClick={() => setIsMenuOpen(false)} className="self-end p-2"><X size={24} /></button>
              <div className="flex flex-col gap-8 mt-10 text-lg font-black uppercase">
                <Link href="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
                <Link href="/products" onClick={() => setIsMenuOpen(false)}>Shop</Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 30s linear infinite; }
      `}</style>
    </div>
  )
}