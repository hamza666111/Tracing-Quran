import { Sparkles, Book } from "lucide-react";

export function HeroSection() {
  const scrollToCheckout = () => {
    document.getElementById('checkout')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden bg-[#FAF8F3] min-h-[90vh] flex items-center">
      {/* Subtle Islamic Pattern Background */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="islamic-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="50" cy="50" r="30" fill="none" stroke="#0F3D3E" strokeWidth="1"/>
              <circle cx="50" cy="50" r="20" fill="none" stroke="#0F3D3E" strokeWidth="1"/>
              <path d="M 50 20 L 50 80 M 20 50 L 80 50" stroke="#0F3D3E" strokeWidth="1"/>
              <circle cx="50" cy="20" r="3" fill="#0F3D3E"/>
              <circle cx="50" cy="80" r="3" fill="#0F3D3E"/>
              <circle cx="20" cy="50" r="3" fill="#0F3D3E"/>
              <circle cx="80" cy="50" r="3" fill="#0F3D3E"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic-pattern)"/>
        </svg>
      </div>

      <div className="container mx-auto px-6 lg:px-12 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F5E6C8] border border-[#C6A75E]/30">
              <Sparkles className="w-4 h-4 text-[#C6A75E]" />
              <span className="text-sm text-[#0F3D3E]">Premium Educational Series</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl lg:text-7xl leading-[1.1] text-[#0F3D3E] tracking-tight">
              Help Your Child
              <span className="block mt-2 text-[#C6A75E] italic">Write the Quran</span>
              <span className="block mt-2">with Their Own Hands</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg lg:text-xl text-[#0F3D3E]/70 leading-relaxed max-w-xl">
              A beautiful tracing experience that builds handwriting skills, strengthens Islamic connection, and creates a lifelong love for the Holy Quran. Perfect for ages 4–12.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={scrollToCheckout}
                className="px-8 py-4 bg-[#C6A75E] text-white rounded-2xl hover:bg-[#B89650] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Order Full Quran Set
              </button>
              <button 
                onClick={scrollToProducts}
                className="px-8 py-4 bg-white text-[#0F3D3E] rounded-2xl border-2 border-[#C6A75E]/30 hover:border-[#C6A75E] transition-all duration-300"
              >
                Explore Individual Paras
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-8 pt-8 border-t border-[#C6A75E]/20">
              <div className="flex items-center gap-2">
                <Book className="w-5 h-5 text-[#C6A75E]" />
                <span className="text-sm text-[#0F3D3E]/60">Authentic Uthmani Script</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 text-[#C6A75E]">✓</div>
                <span className="text-sm text-[#0F3D3E]/60">Cash on Delivery</span>
              </div>
            </div>
          </div>

          {/* Right Product Image */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
              <img 
                src="https://images.unsplash.com/photo-1771051027743-b09f223f64ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpc2xhbWljJTIwcXVyYW4lMjBib29rJTIwY2hpbGRyZW4lMjBsZWFybmluZ3xlbnwxfHx8fDE3NzIwMTY1MTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
                alt="Tracing Quran Book Set"
                className="w-full h-auto object-cover"
              />
            </div>
            
            {/* Decorative Gold Circle */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#C6A75E]/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#F5E6C8]/50 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
