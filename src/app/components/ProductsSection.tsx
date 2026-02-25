import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { ProductType } from "@/lib/types";

type ProductsSectionProps = {
  products: ProductType[];
  loading: boolean;
  error?: string | null;
  onAddToCart: (productId: string, quantity: number) => void;
};

type ProductCardProps = {
  product: ProductType;
  onAddToCart: (quantity: number) => void;
};

function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const outOfStock = product.stock_quantity <= 0;
  const unavailable = outOfStock || !product.is_active;

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-[#C6A75E]/10">
      <div className="relative h-64 overflow-hidden bg-[#FAF8F3]">
        <img
          src={product.image_url || "https://images.unsplash.com/photo-1596522681657-8e9057309a7e?auto=format&fit=crop&w=1200&q=80"}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
        {!product.is_active && (
          <div className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white text-xs rounded-full">
            Inactive
          </div>
        )}
      </div>

      <div className="p-6 space-y-4">
        <h3 className="text-xl text-[#0F3D3E] min-h-[3rem]">
          {product.name}
        </h3>

        <div className="text-sm text-[#0F3D3E]/60">
          {outOfStock ? "Out of stock" : `${product.stock_quantity} in stock`}
        </div>

        <div className="text-3xl text-[#C6A75E]">
          PKR {product.price.toLocaleString()}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-[#0F3D3E]/60">Quantity:</span>
          <div className="flex items-center gap-3 border border-[#C6A75E]/30 rounded-xl px-4 py-2">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="text-[#C6A75E] hover:text-[#B89650]"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-[#0F3D3E]">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="text-[#C6A75E] hover:text-[#B89650]"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button
          type="button"
          disabled={unavailable}
          onClick={() => onAddToCart(quantity)}
          className={`w-full py-4 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 ${
            unavailable
              ? "bg-[#C6A75E]/60 text-white cursor-not-allowed"
              : "bg-[#C6A75E] text-white hover:bg-[#B89650]"
          }`}
        >
          {unavailable ? "Unavailable" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

export function ProductsSection({ products, loading, error, onAddToCart }: ProductsSectionProps) {
  const [activeTab, setActiveTab] = useState<'full' | 'para' | 'surah'>('full');

  const grouped = useMemo(
    () => ({
      full: products.filter((product) => product.type === 'full'),
      para: products.filter((product) => product.type === 'para'),
      surah: products.filter((product) => product.type === 'surah'),
    }),
    [products]
  );

  const tabContent = {
    full: grouped.full,
    para: grouped.para,
    surah: grouped.surah,
  } as const;

  const currentProducts = tabContent[activeTab] || [];

  return (
    <section id="products" className="py-24 bg-[#FAF8F3]">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl lg:text-5xl text-[#0F3D3E] mb-6">
            Choose Your Journey
          </h2>
          <p className="text-lg text-[#0F3D3E]/70">
            Select from our complete set or individual paras to begin your child's Quranic writing journey
          </p>
          {error && (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          )}
        </div>

        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-white rounded-2xl p-2 shadow-lg border border-[#C6A75E]/10">
            <button
              onClick={() => setActiveTab('full')}
              className={`px-8 py-3 rounded-xl transition-all duration-300 ${
                activeTab === 'full'
                  ? 'bg-[#C6A75E] text-white shadow-md'
                  : 'text-[#0F3D3E] hover:bg-[#F5E6C8]'
              }`}
            >
              Full Quran
            </button>
            <button
              onClick={() => setActiveTab('para')}
              className={`px-8 py-3 rounded-xl transition-all duration-300 ${
                activeTab === 'para'
                  ? 'bg-[#C6A75E] text-white shadow-md'
                  : 'text-[#0F3D3E] hover:bg-[#F5E6C8]'
              }`}
            >
              30 Paras
            </button>
            <button
              onClick={() => setActiveTab('surah')}
              className={`px-8 py-3 rounded-xl transition-all duration-300 ${
                activeTab === 'surah'
                  ? 'bg-[#C6A75E] text-white shadow-md'
                  : 'text-[#0F3D3E] hover:bg-[#F5E6C8]'
              }`}
            >
              Individual Surahs
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {loading && Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={`skeleton-${idx}`}
              className="h-96 bg-white rounded-3xl border border-[#C6A75E]/10 shadow animate-pulse"
            />
          ))}

          {!loading && currentProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={(quantity) => onAddToCart(product.id, quantity)}
            />
          ))}
        </div>

        {!loading && currentProducts.length === 0 && (
          <div className="text-center text-[#0F3D3E]/60 mt-8">
            No products available in this category yet.
          </div>
        )}
      </div>
    </section>
  );
}
