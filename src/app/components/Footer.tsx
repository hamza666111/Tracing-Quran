import { Heart, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0F3D3E] text-white py-16">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Top Divider */}
        <div className="h-px bg-[#C6A75E] mb-12"></div>

        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl text-[#C6A75E]">
              Tracing Quran
            </h3>
            <p className="text-[#F5E6C8]/70 leading-relaxed">
              Helping children build a beautiful connection with the Holy Quran through elegant handwriting practice.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg text-[#C6A75E]">
              Quick Links
            </h4>
            <ul className="space-y-2 text-[#F5E6C8]/70">
              <li>
                <a href="#products" className="hover:text-[#C6A75E] transition-colors">
                  Our Products
                </a>
              </li>
              <li>
                <a href="#checkout" className="hover:text-[#C6A75E] transition-colors">
                  Order Now
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#C6A75E] transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#C6A75E] transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg text-[#C6A75E]">
              Contact Us
            </h4>
            <ul className="space-y-3 text-[#F5E6C8]/70">
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#C6A75E]" />
                <span>+92 300 1234567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#C6A75E]" />
                <span>info@tracingquran.pk</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#C6A75E]" />
                <span>Pakistan</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-[#C6A75E]/30">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[#F5E6C8]/60 text-sm">
            <p>© 2026 Tracing Quran. All rights reserved.</p>
            <p className="flex items-center gap-2">
              Made with <Heart className="w-4 h-4 text-[#C6A75E] fill-[#C6A75E]" /> for Muslim families
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
