// app/category/[slug]/page.tsx
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  // Correction : Attendre que les paramètres soient résolus
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // Requête Supabase filtrant par le slug de la catégorie et le stock disponible
  const { data: products } = await supabase
    .from('products')
    .select('*, categories!inner(*)')
    .eq('categories.slug', slug)
    .gt('stock_quantity', 0); // Filtre pour n'afficher que les produits en stock

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* SECTION BANNIÈRE (Style image_2e82e0.png) */}
      <div className="bg-[#FFF5EB] py-20 text-center">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">
           {/* Correction : Sécurisation de la chaîne de caractères */}
           {slug ? slug.replace(/-/g, ' & ') : 'Category'}
        </h1>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
           Shop / {slug}
        </p>
      </div>

      <div className="container mx-auto px-4 py-20">
        {/* Affichage "Nothing Found" si aucun produit n'est en stock (image_2e82e0.png) */}
        {(!products || products.length === 0) ? (
          <div className="text-center py-20">
            <h2 className="text-6xl font-black tracking-tighter text-gray-900 mb-4 uppercase">Nothing Found</h2>
            <p className="text-gray-400 font-medium">No products available in this category for now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id} className="group border border-gray-100 rounded-xl overflow-hidden hover:shadow-xl transition-all">
                <div className="aspect-square bg-[#F5F5F5] p-8 flex items-center justify-center">
                  <img 
                    src={product.main_image_url} 
                    alt={product.name} 
                    className="w-full h-full object-contain mix-blend-multiply" 
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-sm mb-3 group-hover:text-orange-600 transition-colors uppercase">
                    {product.name}
                  </h3>
                  <p className="text-[#9C27B0] font-black text-lg mb-4">
                    £{product.price}
                  </p>
                  <button className="w-full border border-gray-200 py-3 rounded-md text-[11px] font-black uppercase flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all">
                    Add To Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}