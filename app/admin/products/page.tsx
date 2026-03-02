'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Plus, Edit3, Trash2, Eye, EyeOff, Upload, X, ImageIcon, Loader2, ChevronDown } from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  
  // Structure du formulaire alignée sur la base de données
  const [form, setForm] = useState({
    id: null,
    name: '',
    price: '',
    category_name: 'Vegan Food & Drinks', // Valeur par défaut de ta maquette
    description: '',
    stock: 0, 
    is_active: true, 
    main_image_url: '' // Correction du nom de la colonne image ici
  })

  // 1. CHARGEMENT DES PRODUITS (Correction de l'appel ici aussi pour être sûr)
  const fetchData = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, description, stock, is_active, category_name, main_image_url, created_at')
      .order('created_at', { ascending: false })
    
    if (error) console.error("Erreur:", error.message)
    else setProducts(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // 2. UPLOAD IMAGE VERS SUPABASE STORAGE
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      if (!e.target.files || e.target.files.length === 0) return

      const file = e.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `product-images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('products') // Assure-toi que ce bucket est "Public" dans Supabase
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath)

      // On met à jour le champ main_image_url avec l'URL publique
      setForm({ ...form, main_image_url: publicUrl })
    } catch (error: any) {
      alert("Erreur upload: " + error.message)
    } finally {
      setUploading(false)
    }
  }

  // 3. SOUMISSION DU FORMULAIRE (INSERT / UPDATE)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Payload aligné sur le schéma de la base de données
    const payload = {
      name: form.name,
      price: parseFloat(form.price),
      category_name: form.category_name,
      description: form.description,
      stock: form.stock,
      is_active: form.is_active, 
      main_image_url: form.main_image_url // Correction ici
    }

    let result;
    if (form.id) {
      result = await supabase.from('products').update(payload).eq('id', form.id)
    } else {
      result = await supabase.from('products').insert([payload])
    }

    if (result.error) {
      // Affichage de l'erreur SQL exacte pour le débogage
      alert("ERREUR SQL : " + result.error.message + "\nCode: " + result.error.code)
    } else {
      setShowModal(false)
      resetForm()
      fetchData()
    }
  }

  // 4. ACTIONS RAPIDES
  const toggleVisibility = async (product: any) => {
    const { error } = await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id)
    
    if (error) alert(error.message)
    else fetchData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer définitivement ce produit ?")) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) alert(error.message)
    else fetchData()
  }

  const resetForm = () => {
    setForm({ 
      id: null, name: '', price: '', category_name: 'Vegan Food & Drinks', 
      description: '', stock: 0, is_active: true, main_image_url: '' 
    })
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-6 py-32 max-w-7xl">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-black uppercase tracking-tighter italic text-black">
            ADMIN <span className="text-[#EF6C00]">PANEL</span>
          </h1>
          <button 
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-[#EF6C00] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold hover:bg-black transition-all shadow-lg text-sm"
          >
            <Plus size={18} /> Ajouter un Produit
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#EF6C00]" size={40} /></div>
        ) : (
          // MODIFICATION : Grille passée à 4 colonnes (md:grid-cols-4) pour réduire la taille des conteneurs
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 group flex flex-col">
                {/* MODIFICATION : aspect-square et padding p-6 pour une image plus petite */}
                <div className="aspect-square bg-[#F7F7F7] relative flex items-center justify-center p-6">
                  {/* CORRECTION : Utilisation de product.main_image_url */}
                  {product.main_image_url ? (
                    <img src={product.main_image_url} alt={product.name} className="max-w-full max-h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={40} /></div>
                  )}
                  <button 
                    onClick={() => toggleVisibility(product)}
                    className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur shadow-sm rounded-full text-black hover:text-[#EF6C00] transition-colors"
                  >
                    {product.is_active ? <Eye size={16} /> : <EyeOff size={16} className="text-red-400" />}
                  </button>
                </div>
                
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <p className="text-[#EF6C00] text-[9px] font-bold uppercase mb-1 tracking-wider">{product.category_name}</p>
                    <h3 className="text-sm font-bold text-black line-clamp-2 h-10 mb-3">{product.name}</h3>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      {/* MODIFICATION : Prix réduit à text-xl */}
                      <span className="text-xl font-black text-black">£{Number(product.price).toFixed(2)}</span>
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Stock: {product.stock}</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <button 
                        onClick={() => { 
                          // CORRECTION : On s'assure de passer main_image_url lors de la modification
                          setForm({...product, price: product.price.toString()}); 
                          setShowModal(true); 
                        }}
                        className="col-span-3 bg-black text-white py-2.5 rounded-lg font-bold text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-[#EF6C00] transition-colors"
                      >
                        <Edit3 size={12} /> Modifier
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="bg-gray-100 text-gray-400 py-2.5 rounded-lg flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL D'AJOUT ET MODIFICATION */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-black uppercase tracking-tighter text-black">{form.id ? 'Modifier le Produit' : 'Nouveau Produit'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black transition-colors"><X /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">Product Name *</label>
                  <input required className="w-full bg-gray-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-[#EF6C00] text-black text-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">Price (£) *</label>
                  <input required type="number" step="0.01" className="w-full bg-gray-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-[#EF6C00] text-black text-sm" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Category *</label>
                <div className="relative">
                  <select 
                    className="w-full bg-gray-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-[#EF6C00] appearance-none text-black text-sm font-medium" 
                    value={form.category_name} 
                    onChange={e => setForm({...form, category_name: e.target.value})}
                  >
                    <option value="Compound">Compound</option>
                    <option value="Retatrutide">Retatrutide</option>
                    
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Description</label>
                <textarea rows={3} className="w-full bg-gray-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-[#EF6C00] text-black text-sm" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">Initial Stock</label>
                  <input type="number" className="w-full bg-gray-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-[#EF6C00] text-black text-sm" value={form.stock} onChange={e => setForm({...form, stock: parseInt(e.target.value) || 0})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">Status</label>
                  <select className="w-full bg-gray-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-[#EF6C00] text-black text-sm font-medium" value={form.is_active ? 'true' : 'false'} onChange={e => setForm({...form, is_active: e.target.value === 'true'})}>
                    <option value="true">Active (Visible)</option>
                    <option value="false">Masqué</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-black uppercase text-gray-400">Image du Produit</label>
                <div className="flex gap-2">
                  {/* CORRECTION : Liaison avec form.main_image_url */}
                  <input placeholder="URL de l'image..." className="flex-1 bg-gray-50 p-3 rounded-xl border-none text-xs text-black" value={form.main_image_url} onChange={e => setForm({...form, main_image_url: e.target.value})} />
                  <input type="file" hidden ref={fileInputRef} onChange={handleUpload} accept="image/*" />
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="bg-black text-white px-4 py-2 rounded-xl flex items-center gap-2 text-[9px] font-black uppercase tracking-widest disabled:opacity-50 transition-all hover:bg-[#EF6C00]"
                  >
                    {uploading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />} 
                    Upload
                  </button>
                </div>
                {form.main_image_url && (
                    <div className="mt-2 text-xs text-green-600 font-medium flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        Image prête
                    </div>
                )}
              </div>

              <div className="flex gap-4 pt-8">
                <button type="submit" className="flex-1 bg-[#EF6C00] text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-black transition-all shadow-xl shadow-orange-100">
                  {form.id ? 'Mettre à jour' : 'Créer le Produit'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-8 bg-gray-100 text-gray-500 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-colors">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}