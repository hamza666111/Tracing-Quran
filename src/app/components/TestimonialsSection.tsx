import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Aisha Rahman",
    location: "Karachi",
    image: "https://images.unsplash.com/photo-1736342181249-9e81c11737b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMG11c2xpbSUyMHdvbWFuJTIwaGVhZHNjYXJmfGVufDF8fHx8MTc3MjAxNjUxOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    text: "My 7-year-old daughter now reads and writes Quran with so much love. This book transformed her connection with Allah's words. Highly recommended!",
    rating: 5
  },
  {
    name: "Ahmed Malik",
    location: "Lahore",
    image: "https://images.unsplash.com/photo-1623743638010-fbe8192568ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNsaW0lMjBmYXRoZXIlMjBmYW1pbHklMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzIwMTY1MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    text: "Perfect gift for my children. The quality is exceptional and the tracing helps them learn proper Arabic writing. Worth every rupee!",
    rating: 5
  },
  {
    name: "Fatima Siddiqui",
    location: "Islamabad",
    image: "https://images.unsplash.com/photo-1622218696604-f019ca840922?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYWtpc3RhbmklMjBtb3RoZXIlMjBjaGlsZCUyMHNtaWxpbmd8ZW58MXx8fHwxNzcyMDE2NTE1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    text: "Beautiful, premium quality book. My kids love spending time with this instead of screens. Best Islamic educational product I've purchased.",
    rating: 5
  }
];

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-[#F5E6C8]">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-4 py-2 rounded-full bg-white border border-[#C6A75E]/30 mb-6">
            <span className="text-sm text-[#0F3D3E]">Loved by Muslim Families</span>
          </div>
          <h2 className="text-4xl lg:text-5xl text-[#0F3D3E] mb-6">
            What Parents Are Saying
          </h2>
          <div className="w-24 h-1 bg-[#C6A75E] mx-auto rounded-full"></div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#C6A75E] text-[#C6A75E]" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-[#0F3D3E]/80 leading-relaxed mb-8 min-h-[120px]">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 pt-6 border-t border-[#C6A75E]/20">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#C6A75E]/30">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-[#0F3D3E] font-medium">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-[#0F3D3E]/60">
                    {testimonial.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
