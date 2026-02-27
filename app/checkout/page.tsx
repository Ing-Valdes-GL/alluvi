'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { User, CreditCard, Apple, Banknote, Bitcoin, X, Mail } from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  
  // États pour le Modal d'Authentification
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authMessage, setAuthMessage] = useState('')

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', companyName: '',
    country: 'United Kingdom (UK)', streetAddress: '',
    apartment: '', townCity: '', county: '',
    postcode: '', phone: '', email: '',
    paymentMethod: 'bank_transfer'
  })

  useEffect(() => {
    // Restaurer le panier
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCartItems(savedCart)

    // Restaurer le formulaire si l'utilisateur revient du Magic Link
    const savedForm = localStorage.getItem('checkout_form')
    if (savedForm) {
      setFormData(JSON.parse(savedForm))
    }
  }, [])

  const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.price) * Number(item.quantity)), 0)
  const discount = 30.90 
  const shipping = 30.00
  const total = Math.max(0, subtotal - discount + shipping)

  const validate = () => {
    const newErrors: Record<string, boolean> = {}
    const required = ['firstName', 'lastName', 'streetAddress', 'townCity', 'postcode', 'phone', 'email']
    required.forEach(field => {
      if (!formData[field as keyof typeof formData]) newErrors[field] = true
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePlaceOrder = async () => {
    if (!validate()) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true)

    try {
      // 1. Vérifier si l'utilisateur est connecté
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // NON CONNECTÉ -> Sauvegarde et Popup
        localStorage.setItem('checkout_form', JSON.stringify(formData))
        setShowAuthModal(true)
        setIsSubmitting(false)
        return
      }

      // 2. CONNECTÉ -> INSERTION COMMANDE
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          company_name: formData.companyName,
          country: formData.country,
          street_address: formData.streetAddress,
          apartment_suite: formData.apartment,
          town_city: formData.townCity,
          county: formData.county,
          postcode: formData.postcode,
          phone: formData.phone,
          email_address: formData.email,
          payment_method: formData.paymentMethod,
          subtotal: subtotal,
          discount_amount: discount,
          shipping_fee: shipping,
          total_amount: total,
          status: 'on_hold'
        })
        .select().single()

      if (orderErr) throw orderErr

      // 3. ARTICLES DU PANIER
      const itemsToInsert = cartItems.map(item => ({
        order_id: order.id,
        product_name: item.name,
        quantity: parseInt(item.quantity),
        unit_price: parseFloat(item.price)
      }))

      const { error: itemsErr } = await supabase.from('order_items').insert(itemsToInsert)
      if (itemsErr) throw itemsErr

      // 4. ENVOI DE L'EMAIL (API Route)
      fetch('/api/send-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          orderRef: order.reference_code || order.id.slice(0, 8).toUpperCase(),
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          items: cartItems,
          subtotal, discount, shipping, total,
          paymentMethod: formData.paymentMethod,
          address: formData
        })
      }).catch(e => console.error("Email API Error:", e))
      
      // 5. NETTOYAGE ET REDIRECTION VERS CHECKOUT2
      localStorage.removeItem('cart')
      localStorage.removeItem('checkout_form')
      router.push(`/checkout2?orderId=${order.id}`)

    } catch (error: any) {
      alert("Error processing order: " + error.message)
      setIsSubmitting(false)
    }
  }

  const handleRequestMagicLink = async () => {
    setAuthLoading(true)
    setAuthMessage('')
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: { emailRedirectTo: `${window.location.origin}/checkout` }
      })
      if (error) throw error
      setAuthMessage('A secure login link has been sent to your email. Click it to continue.')
    } catch (err: any) {
      setAuthMessage('Error: ' + err.message)
    } finally {
      setAuthLoading(false)
    }
  }

  return (
    <div className="bg-white min-h-screen font-sans text-slate-900 relative">
      <Header />
      
      <div className="bg-[#FFEDD5] py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Your Checkout</h1>
      </div>

      <main className="container mx-auto px-6 py-12 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold mb-8 border-b pb-4">Billing Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="First name *" error={errors.firstName} value={formData.firstName} onChange={(v:any) => setFormData({...formData, firstName: v})} />
            <InputField label="Last name *" error={errors.lastName} value={formData.lastName} onChange={(v:any) => setFormData({...formData, lastName: v})} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Company (optional)" value={formData.companyName} onChange={(v:any) => setFormData({...formData, companyName: v})} />
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-800">Country *</label>
              <select className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-orange-300">
                <option>United Kingdom (UK)</option>
              </select>
            </div>
          </div>

          <InputField label="Street address *" placeholder="House number and street name" error={errors.streetAddress} value={formData.streetAddress} onChange={(v:any) => setFormData({...formData, streetAddress: v})} />
          <InputField label="Apartment, suite, etc. (optional)" value={formData.apartment} onChange={(v:any) => setFormData({...formData, apartment: v})} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField label="Town / City *" error={errors.townCity} value={formData.townCity} onChange={(v:any) => setFormData({...formData, townCity: v})} />
            <InputField label="County/Region" value={formData.county} onChange={(v:any) => setFormData({...formData, county: v})} />
            <InputField label="Postcode *" error={errors.postcode} value={formData.postcode} onChange={(v:any) => setFormData({...formData, postcode: v})} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Phone *" error={errors.phone} value={formData.phone} onChange={(v:any) => setFormData({...formData, phone: v})} />
            <InputField label="Email address *" error={errors.email} value={formData.email} onChange={(v:any) => setFormData({...formData, email: v})} />
          </div>
        </div>

        <aside>
          <div className="bg-[#FFFBF7] p-8 rounded-3xl border border-orange-100 shadow-sm sticky top-24">
            <h3 className="text-lg font-bold mb-6">Review Your Order</h3>
            
            <div className="space-y-4 mb-8">
               {cartItems.map(item => (
                 <div key={item.id} className="flex justify-between items-start text-sm">
                   <div className="flex items-center gap-3">
                     <img src={item.image_url} className="w-12 h-12 object-contain bg-white rounded-lg border border-slate-100" alt="" />
                     <div>
                       <p className="text-slate-700 font-medium leading-tight">{item.name}</p>
                       <p className="font-bold text-slate-900 mt-1">× {item.quantity}</p>
                     </div>
                   </div>
                   <span className="font-bold">£{(Number(item.price) * Number(item.quantity)).toFixed(2)}</span>
                 </div>
               ))}
            </div>

            <div className="space-y-3 pt-4 border-t border-orange-100 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span className="font-bold">£{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-orange-600 font-medium italic"><span>Discount</span><span>-£{discount.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span className="font-bold">£{shipping.toFixed(2)}</span></div>
              <div className="flex justify-between text-lg font-black pt-4 border-t border-orange-100">
                <span>Total</span><span className="text-[#EF6C00] text-2xl">£{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <p className="text-sm font-bold text-slate-800 mb-2">Payment Method</p>
              <PaymentOption id="bank_transfer" label="Bank Transfer" icon={<Banknote size={18}/>} current={formData.paymentMethod} set={(v:any) => setFormData({...formData, paymentMethod: v})} />
              <PaymentOption id="zelle" label="Zelle" icon={<CreditCard size={18} className="text-purple-600"/>} current={formData.paymentMethod} set={(v:any) => setFormData({...formData, paymentMethod: v})} />
              <PaymentOption id="apple_pay" label="ApplePay" icon={<Apple size={18} className="text-black fill-current"/>} current={formData.paymentMethod} set={(v:any) => setFormData({...formData, paymentMethod: v})} />
              <PaymentOption id="crypto" label="Crypto" icon={<Bitcoin size={18} className="text-orange-500"/>} current={formData.paymentMethod} set={(v:any) => setFormData({...formData, paymentMethod: v})} />
            </div>

            <button 
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full bg-[#FFA52F] text-white py-4 rounded-2xl font-bold mt-8 hover:bg-orange-600 transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </aside>
      </main>
      <Footer />

      {/* POPUP AUTH */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full relative shadow-2xl">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900">
              <X size={20} />
            </button>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-6 text-[#FFA52F]">
              <Mail size={24} />
            </div>
            <h3 className="text-2xl font-black mb-2">Secure Your Order</h3>
            <p className="text-slate-500 text-sm mb-6">Verify your identity via email to complete your purchase.</p>
            <div className="space-y-4">
              <input type="email" readOnly value={formData.email} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-500" />
              {authMessage && <div className="p-4 rounded-xl bg-green-50 text-green-700 text-sm border border-green-200">{authMessage}</div>}
              <button onClick={handleRequestMagicLink} disabled={authLoading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-[#FFA52F] transition-all disabled:opacity-50">
                {authLoading ? 'Sending...' : 'Request login link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InputField({ label, placeholder, error, value, onChange }: any) {
  return (
    <div className="space-y-1 flex-1">
      <label className="text-sm font-bold text-slate-800">{label}</label>
      <input 
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-3 rounded-xl border transition-all text-sm outline-none ${error ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white focus:border-orange-300'}`}
      />
    </div>
  )
}

function PaymentOption({ id, label, icon, current, set }: any) {
  const active = current === id;
  return (
    <label onClick={() => set(id)} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${active ? 'border-orange-500 bg-orange-50' : 'border-slate-100 hover:border-slate-300'}`}>
      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${active ? 'border-orange-500' : 'border-slate-300'}`}>
        {active && <div className="w-2 h-2 bg-orange-500 rounded-full" />}
      </div>
      {icon}
      <span className="text-xs font-bold text-slate-700">{label}</span>
    </label>
  )
}
