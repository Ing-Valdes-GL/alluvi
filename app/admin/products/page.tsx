'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Plus, Edit3, Trash2, Eye, EyeOff, Upload, X, ImageIcon, Loader2 } from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  
  const [form, setForm] = useState({
    id: null,
    name: '',
    price: '',
    description: '',
    stock: 0, 
    status: 'visible', // On utilise 'visible' ou 'hidden' pour correspondre aux contraintes
    image_url: ''
  })

  // 1. CHARGEMENT
  const fetchData = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) console.error("Erreur:", error.message)
    else setProducts(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // 2. FONCTION UPLOAD IMAGE (SUPABASE STORAGE)
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      if (!e.target.files || e.target.files.length === 0) return

      const file = e.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `product-images/${fileName}`

      // Upload vers le bucket 'products' (vérifie que tu as créé ce bucket dans Supabase)
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath)

      setForm({ ...form, image_url: publicUrl })
      alert("Image téléchargée avec succès !")
    } catch (error: any) {
      alert("Erreur upload: " + error.message)
    } finally {
      setUploading(false)
    }
  }

  // 3. SOUMISSION (AJOUT / MODIF)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // IMPORTANT : On prépare l'objet pour correspondre EXACTEMENT aux colonnes Supabase
    const payload = {
      name: form.name,
      price: parseFloat(form.price),
      description: form.description,
      stock: form.stock,
      // Vérifie si ta colonne s'appelle 'status' ou 'is_visible'
      // Si c'est 'is_visible' (booléen), utilise : is_visible: form.status === 'visible'
      status: form.status, 
      image_url: form.image_url // Assure-toi que la colonne existe !
    }

    let result;
    if (form.id) {
      result = await supabase.from('products').update(payload).eq('id', form.id)
    } else {
      result = await supabase.from('products').insert([payload])
    }

    if (result.error) {
      alert("ERREUR : " + result.error.message)
    } else {
      setShowModal(false)
      resetForm()
      fetchData()
    }
  }

  // 4. MASQUAGE RAPIDE
  const toggleVisibility = async (product: any) => {
    const newStatus = product.status === 'visible' ? 'hidden' : 'visible'
    const { error } = await supabase
      .from('products')
      .update({ status: newStatus })
      .eq('id', product.id)
    
    if (error) alert(error.message)
    else fetchData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) alert(error.message)
    else fetchData()
  }

  const resetForm = () => {
    setForm({ id: null, name: '', price: '', description: '', stock: 0, status: 'visible', image_url: '' })
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-6 py-32 max-w-7xl">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">
            Gestion des <span className="text-[#FFA52F]">Produits</span>
          </h1>
          <button 
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-[#2563eb] text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus size={20} /> Ajouter un Produit
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#FFA52F]" size={40} /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-[#1e293b] rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
                <div className="aspect-video bg-slate-900 relative">
                  {product.image_url ? (
                    <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700"><ImageIcon size={48} /></div>
                  )}
                  <button 
                    onClick={() => toggleVisibility(product)}
                    className="absolute top-3 right-3 p-2 bg-black/60 rounded-full text-white hover:text-[#FFA52F] transition-colors"
                  >
                    {product.status === 'visible' ? <Eye size={18} /> : <EyeOff size={18} className="text-red-400" />}
                  </button>
                </div>
                
                <div className="p-6 text-white">
                  <h3 className="text-lg font-bold truncate">{product.name}</h3>
                  <div className="flex justify-between items-center my-4">
                    <span className="text-2xl font-black text-white">${Number(product.price).toFixed(2)}</span>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Stock: {product.stock}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <button 
                      onClick={() => { setForm({...product, price: product.price.toString()}); setShowModal(true); }}
                      className="col-span-3 bg-[#2563eb] py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600"
                    >
                      <Edit3 size={16} /> Modifier
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="bg-[#ef4444] py-3 rounded-xl flex items-center justify-center hover:bg-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL AJOUT/MODIF */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">{form.id ? 'Modifier' : 'Ajouter un Produit'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6 text-white">
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Nom du Produit *" className="bg-[#334155] p-3 rounded-lg border-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                <input required placeholder="Prix ($) *" type="number" step="0.01" className="bg-[#334155] p-3 rounded-lg border-none" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
              </div>

              <textarea placeholder="Description" rows={3} className="w-full bg-[#334155] p-3 rounded-lg border-none" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />

              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Stock" type="number" className="bg-[#334155] p-3 rounded-lg border-none" value={form.stock} onChange={e => setForm({...form, stock: parseInt(e.target.value)})} />
                <select className="bg-[#334155] p-3 rounded-lg border-none" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  <option value="visible">Actif (Visible)</option>
                  <option value="hidden">Masqué</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase opacity-50">Image du Produit</label>
                <div className="flex gap-2">
                  <input placeholder="URL de l'image..." className="flex-1 bg-[#334155] p-3 rounded-lg border-none text-sm" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} />
                  <input type="file" hidden ref={fileInputRef} onChange={handleUpload} accept="image/*" />
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="bg-[#2563eb] px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold disabled:opacity-50"
                  >
                    {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />} 
                    Upload
                  </button>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="submit" className="flex-1 bg-[#2563eb] py-4 rounded-xl font-black uppercase tracking-widest hover:scale-[1.02] transition-transform">
                  {form.id ? 'Mettre à jour' : 'Créer le Produit'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-8 bg-slate-700 rounded-xl font-bold">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}