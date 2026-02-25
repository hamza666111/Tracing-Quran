import { ShoppingBag } from "lucide-react";

type HeaderProps = {
  cartCount?: number;
};

export function Header({ cartCount = 0 }: HeaderProps) {
  const scrollToCheckout = () => {
    document.getElementById('checkout')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#C6A75E]/10 shadow-sm">
      <div className="container mx-auto px-6 lg:px-12 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C6A75E] to-[#0F3D3E] flex items-center justify-center text-white text-xl">
              ق
            </div>
            <div>
              <div className="text-xl text-[#0F3D3E]">
                Tracing Quran
              </div>
              <div className="text-xs text-[#0F3D3E]/60">
                Learn to Write
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#products" className="text-[#0F3D3E] hover:text-[#C6A75E] transition-colors">
              Products
            </a>
            <a href="#checkout" className="text-[#0F3D3E] hover:text-[#C6A75E] transition-colors">
              Order
            </a>
          </nav>

          {/* CTA Button */}
          <button 
            onClick={scrollToCheckout}
            className="flex items-center gap-3 px-6 py-3 bg-[#C6A75E] text-white rounded-xl hover:bg-[#B89650] transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="hidden sm:inline">Order Now</span>
            {cartCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[1.5rem] px-2 py-1 text-xs font-semibold bg-white text-[#0F3D3E] rounded-full">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
