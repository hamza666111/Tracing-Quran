import { Clock, Gift } from "lucide-react";

export function OfferSection() {
  const scrollToCheckout = () => {
    document.getElementById('checkout')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-20 bg-[#0F3D3E]">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          {/* Decorative Border */}
          <div className="border-2 border-[#C6A75E] rounded-3xl p-12 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="offer-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                    <circle cx="30" cy="30" r="20" fill="none" stroke="#C6A75E" strokeWidth="1"/>
                    <circle cx="30" cy="30" r="10" fill="none" stroke="#C6A75E" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#offer-pattern)"/>
              </svg>
            </div>

            <div className="relative z-10 text-center space-y-8">
              {/* Icon Badge */}
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#C6A75E]/20 border border-[#C6A75E]">
                <Clock className="w-5 h-5 text-[#C6A75E]" />
                <span className="text-[#F5E6C8]">Limited Time Offer</span>
              </div>

              {/* Heading */}
              <h2 className="text-4xl lg:text-5xl text-white leading-tight">
                Special Launch Discount
                <span className="block mt-2 text-[#C6A75E]">Save 25% on Complete Set</span>
              </h2>

              {/* Description */}
              <p className="text-xl text-[#F5E6C8]/80 max-w-2xl mx-auto">
                Get the full 30-Para Quran tracing set at a special introductory price. Plus, receive a FREE bonus gift with every order!
              </p>

              {/* Price Display */}
              <div className="flex items-center justify-center gap-6 py-6">
                <div className="text-[#F5E6C8]/60 text-2xl line-through">
                  PKR 6,999
                </div>
                <div className="text-5xl text-[#C6A75E]">
                  PKR 4,999
                </div>
              </div>

              {/* CTA Button */}
              <button 
                onClick={scrollToCheckout}
                className="px-12 py-5 bg-[#C6A75E] text-white text-lg rounded-2xl hover:bg-[#B89650] transition-all duration-300 shadow-2xl transform hover:-translate-y-1 inline-flex items-center gap-3"
              >
                <Gift className="w-6 h-6" />
                Claim Your Discount Now
              </button>

              {/* Trust Line */}
              <div className="pt-6 text-[#F5E6C8]/60 text-sm">
                ✓ Cash on Delivery Available  •  ✓ Free Shipping Across Pakistan
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
