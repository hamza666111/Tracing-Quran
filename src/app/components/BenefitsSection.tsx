import { Pen, Heart, Monitor, Gift, Users } from "lucide-react";

const benefits = [
  {
    icon: Pen,
    title: "Improves Handwriting",
    description: "Develop beautiful Arabic script through guided tracing exercises"
  },
  {
    icon: Heart,
    title: "Strengthens Love for Quran",
    description: "Build a deep, personal connection with Allah's words"
  },
  {
    icon: Monitor,
    title: "Screen-Free Learning",
    description: "Healthy, focused learning away from digital distractions"
  },
  {
    icon: Gift,
    title: "Perfect Islamic Gift",
    description: "A meaningful present that keeps giving for years"
  },
  {
    icon: Users,
    title: "Ages 4–12",
    description: "Carefully designed progression for all learning levels"
  }
];

export function BenefitsSection() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-4 py-2 rounded-full bg-[#F5E6C8] border border-[#C6A75E]/30 mb-6">
            <span className="text-sm text-[#0F3D3E]">Why Parents Choose Us</span>
          </div>
          <h2 className="text-4xl lg:text-5xl text-[#0F3D3E] mb-6">
            More Than Just a Book
          </h2>
          <div className="w-24 h-1 bg-[#C6A75E] mx-auto rounded-full"></div>
        </div>

        {/* Benefits Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="bg-[#FAF8F3] rounded-3xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-[#C6A75E]/10"
            >
              {/* Icon Circle */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F5E6C8] to-[#C6A75E]/30 flex items-center justify-center mb-6">
                <benefit.icon className="w-7 h-7 text-[#C6A75E]" />
              </div>

              {/* Content */}
              <h3 className="text-xl text-[#0F3D3E] mb-3">
                {benefit.title}
              </h3>
              <p className="text-[#0F3D3E]/60 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
