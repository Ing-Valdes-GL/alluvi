'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Search, ChevronDown, Phone, Menu, X, Facebook, Twitter, Instagram, Youtube, CheckCircle2, Percent } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Header() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCatOpen, setIsCatOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [searchValue, setSearchValue] = useState('')
  const [cartCount, setCartCount] = useState(0)
  const [products, setProducts] = useState([])
  
  // États pour les fonctionnalités ajoutées
  const [showPopup, setShowPopup] = useState(false)
  const [addedItemName, setAddedItemName] = useState('')
  const [filterPromo, setFilterPromo] = useState(false)

  // --- 1. CHARGEMENT DES DONNÉES ---
  useEffect(() => {
    const fetchData = async () => {
      // Fetch catégories
      const { data: catData } = await supabase.from('categories').select('*')
      setCategories(catData || [])

      // Fetch produits (assure-toi que la colonne 'on_sale' existe pour les promos)
      const { data: prodData } = await supabase.from('products').select('*')
      setProducts(prodData || [])
    }
    fetchData()
  }, [])

  // --- 2. GESTION DYNAMIQUE DU COMPTEUR DE PANIER ---
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

  // --- 3. LOGIQUE AJOUT AU PANIER + POPUP ---
  const addToCart = (product: any) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingIndex = cart.findIndex((item: any) => item.id === product.id)

    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1
    } else {
      cart.push({ ...product, quantity: 1 })
    }

    localStorage.setItem('cart', JSON.stringify(cart))
    
    // Déclenche l'événement pour mettre à jour le header
    window.dispatchEvent(new Event('cart-updated'))
    
    // Affichage de la popup de succès
    setAddedItemName(product.name)
    setShowPopup(true)
    setTimeout(() => setShowPopup(false), 3000) // Disparaît après 3s
  }

  // --- 4. FILTRAGE ET RECHERCHE (COMPARAISON DE CARACTÈRES) ---
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchValue.trim())}`)
    }
  }

  const displayedProducts = products.filter((p: any) => {
    const matchesSearch = p.name.toLowerCase().includes(searchValue.toLowerCase())
    const matchesPromo = filterPromo ? p.on_sale === true : true
    return matchesSearch && matchesPromo
  })

  return (
    <div className="bg-white min-h-screen">
      
      {/* --- POPUP DE CONFIRMATION (ANIMÉE) --- */}
      <AnimatePresence>
        {showPopup && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-10 left-1/2 z-[300] bg-[#0A0A0A] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[320px] border border-white/10"
          >
            <div className="bg-green-500 p-1.5 rounded-full text-white">
              <CheckCircle2 size={18} />
            </div>
            <div className="flex-grow">
              <p className="text-[9px] uppercase font-black tracking-widest text-gray-400">Success</p>
              <p className="text-sm font-bold truncate max-w-[180px]">{addedItemName} added!</p>
            </div>
            <Link href="/cart" className="text-[#EF6C00] text-xs font-black uppercase underline decoration-2 underline-offset-4">
              Cart
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- BANDE DÉFILANTE --- */}
      <div className="bg-[#0A0A0A] text-white py-2.5 overflow-hidden border-b border-white/10 relative z-[100]">
        <div className="flex whitespace-nowrap animate-marquee">
          {[1, 2, 3].map((i) => (
            <span key={i} className="text-[10px] font-bold uppercase tracking-[0.2em] mx-10">
              Free Shipping on orders above £100 ★ Special Offer : Get 35% Discount Code "VEGAN35" ★ Free Shipping on orders above £100
            </span>
          ))}
        </div>
      </div>

      <header className="bg-white relative z-[90] border-b border-gray-100">
        {/* --- MAIN HEADER --- */}
        <div className="container mx-auto px-4 py-6 flex items-center justify-between gap-4 md:gap-8">
          <Link href="/" className="shrink-0">
            <img src="/logo.png" alt="Alluvi" className="h-10 md:h-12 object-contain" />
          </Link>
          
          <div className="hidden md:flex flex-grow max-w-2xl items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="flex-grow flex border border-gray-200 rounded-lg overflow-hidden shadow-sm focus-within:border-black transition-colors">
              <input 
                type="text" 
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search a product (ex: Tripeptide)..." 
                className="flex-grow px-6 py-2.5 text-sm italic outline-none text-gray-500"
              />
              <button type="submit" className="bg-black text-white px-6 hover:bg-gray-800 transition-colors">
                <Search size={18} />
              </button>
            </form>

            {/* BOUTON FILTRE PROMOTION */}
            <button 
              onClick={() => setFilterPromo(!filterPromo)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border transition-all text-[10px] font-black uppercase tracking-widest ${
                filterPromo 
                ? 'bg-[#EF6C00] border-[#EF6C00] text-white shadow-lg shadow-orange-200' 
                : 'bg-white border-gray-200 text-gray-400 hover:border-black hover:text-black'
              }`}
            >
              <Percent size={14} />
              {filterPromo ? 'Promos Only' : 'Everything'}
            </button>
          </div>

          <div className="flex items-center gap-5">
            <Link href="/cart" className="relative cursor-pointer group">
              <ShoppingCart size={24} className="text-gray-700 group-hover:text-orange-500 transition-colors" />
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            </Link>
            <button onClick={() => setIsMenuOpen(true)}>
              <Menu size={28} className="text-gray-700 hover:text-orange-500 cursor-pointer transition-colors" />
            </button>
          </div>
        </div>

        {/* --- NAVIGATION BAR --- */}
        <nav className="bg-[#EF6C00]">
          <div className="container mx-auto px-4 flex items-center justify-between h-14">
            <div className="flex items-center h-full">
              <div className="relative h-full">
                <button 
                  onClick={() => setIsCatOpen(!isCatOpen)}
                  className="bg-[#BF5600] text-white h-full px-8 flex items-center gap-4 font-bold text-xs uppercase tracking-tighter hover:bg-[#a34a00] transition-colors"
                >
                  CATEGORIES <ChevronDown size={16} className={`transition-transform duration-300 ${isCatOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isCatOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }}
                      className="absolute top-full left-0 w-72 bg-white shadow-2xl z-[110] py-5 rounded-b-xl border border-gray-100"
                    >
                      {categories.map((cat: any) => (
                        <Link 
                          key={cat.id} href={`/products?category=${cat.id}`} onClick={() => setIsCatOpen(false)}
                          className="flex items-center gap-4 px-8 py-3.5 hover:bg-gray-50 text-gray-800 text-[13px] font-bold transition-colors group"
                        >
                          <img src={cat.icon_url || "/leaf-icon.png"} className="w-5 h-5 opacity-80 group-hover:opacity-100" alt="" />
                          {cat.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="hidden lg:flex items-center gap-10 ml-10 text-white text-[11px] font-bold uppercase tracking-widest">
                <Link href="/" className="hover:opacity-80">Home</Link>
                <Link href="/products" className="border-b-2 border-white pb-1">Shop</Link>
                <Link href="/wholesale" className="hover:opacity-80">Wholesale</Link>
                <Link href="/retatrutide-buy" className="hover:opacity-80">Retatrutide Buy</Link>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-white">
              <div className="bg-[#BF5600] p-2 rounded-full"><Phone size={14} fill="white" /></div>
              <div className="text-right">
                <p className="text-[9px] uppercase font-bold opacity-80 leading-none">Order by phone</p>
                <p className="text-sm font-black tracking-tight">+1 800 555 5555</p>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* --- GRILLE DES PRODUITS FILTRÉE --- */}
      <main className="container mx-auto px-4 py-16 bg-white">
        <div className="flex flex-col items-center mb-12">
            <span className="bg-black text-white px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Collection</span>
            <h2 className="text-3xl md:text-4xl font-black text-center uppercase tracking-tighter text-gray-900">
              {filterPromo ? 'Exclusive Deals' : 'Featured Products'}
            </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {displayedProducts.map((product: any) => (
            <motion.div 
              key={product.id} 
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col"
            >
              <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-[#F9F9F9] flex items-center justify-center p-6">
                {product.on_sale && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white text-[9px] font-black px-2 py-1 rounded-md z-20 animate-pulse">
                    PROMO
                  </div>
                )}
                <img 
                  src={product.image_url || "/placeholder.png"} 
                  alt={product.name}
                  className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <h3 className="font-black text-gray-900 uppercase tracking-tighter text-lg mb-1">{product.name}</h3>
                <p className="text-gray-400 text-xs mb-4 line-clamp-2 h-8">{product.description}</p>
                
                <div className="mt-auto">
                  <p className="text-[#EF6C00] font-black text-2xl tracking-tighter mb-4">£{product.price}</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => addToCart(product)}
                      className="flex-grow bg-black text-white py-3 rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-[#EF6C00] transition-all duration-300"
                    >
                      Add to Cart
                    </button>
                    <button 
                       onClick={() => addToCart(product)}
                       className="bg-gray-100 text-black p-3 rounded-lg hover:bg-black hover:text-white transition-colors"
                    >
                      <ShoppingCart size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {displayedProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 font-bold uppercase tracking-widest">No products found for this search.</p>
          </div>
        )}
      </main>

      {/* --- MENU MOBILE --- */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              className="fixed inset-y-0 left-0 w-80 bg-white z-[210] p-10 flex flex-col shadow-2xl"
            >
              <button onClick={() => setIsMenuOpen(false)} className="self-end p-2 hover:bg-gray-100 rounded-full">
                <X size={24} className="text-gray-400" />
              </button>
              <div className="flex flex-col gap-8 mt-10 text-lg font-black uppercase tracking-widest">
                <Link href="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
                <Link href="/products" className="text-[#EF6C00]" onClick={() => setIsMenuOpen(false)}>Shop</Link>
                <Link href="/cart" onClick={() => setIsMenuOpen(false)}>My Cart ({cartCount})</Link>
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