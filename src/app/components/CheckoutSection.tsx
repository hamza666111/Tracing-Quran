import { useEffect, useMemo, useState } from "react";
import { ShoppingBag, User, Phone, MapPin, Home, Package } from "lucide-react";
import { placeOrder } from "@/lib/api/orders";
import { ProductType } from "@/lib/types";

type CheckoutSectionProps = {
  products: ProductType[];
  loadingProducts: boolean;
  selectedProductId: string | null;
  onSelectProductId: (id: string) => void;
  selectedQuantity: number;
  onQuantityChange: (value: number) => void;
  onOrderPlaced?: () => void;
};

export function CheckoutSection({
  products,
  loadingProducts,
  selectedProductId,
  onSelectProductId,
  selectedQuantity,
  onQuantityChange,
  onOrderPlaced,
}: CheckoutSectionProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    address: "",
  });
  const [quantity, setQuantity] = useState(selectedQuantity || 1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setQuantity(selectedQuantity || 1);
  }, [selectedQuantity]);

  useEffect(() => {
    if (!selectedProductId && products.length) {
      onSelectProductId(products[0].id);
    }
  }, [selectedProductId, products, onSelectProductId]);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) || null,
    [products, selectedProductId]
  );

  const totalPrice = selectedProduct ? selectedProduct.price * quantity : 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleQuantityChange = (value: number) => {
    const safeValue = Math.max(1, value);
    setQuantity(safeValue);
    onQuantityChange(safeValue);
  };

  const validatePhone = (phone: string) => /^03\d{2}-?\d{7}$/.test(phone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedProduct) {
      setError("Please select a product.");
      return;
    }

    if (quantity < 1) {
      setError("Quantity must be at least 1.");
      return;
    }

    if (!validatePhone(formData.phone.trim())) {
      setError("Enter a valid Pakistan mobile number (03XX-XXXXXXX).");
      return;
    }

    setSubmitting(true);

    const { error: insertError } = await placeOrder({
      customer_name: formData.name.trim(),
      phone: formData.phone.trim(),
      city: formData.city.trim(),
      address: formData.address.trim(),
      product_id: selectedProduct.id,
      quantity,
    });

    if (insertError) {
      setError(insertError.message || "Unable to place order. Please try again.");
    } else {
      setSuccess("Order placed! You will receive a confirmation call soon.");
      setFormData({ name: "", phone: "", city: "", address: "" });
      handleQuantityChange(1);
      onOrderPlaced?.();
    }

    setSubmitting(false);
  };

  return (
    <section id="checkout" className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F5E6C8] border border-[#C6A75E]/30 mb-6">
              <ShoppingBag className="w-4 h-4 text-[#C6A75E]" />
              <span className="text-sm text-[#0F3D3E]">Quick Order Form</span>
            </div>
            <h2 className="text-4xl lg:text-5xl text-[#0F3D3E] mb-4">
              Complete Your Order
            </h2>
            <p className="text-lg text-[#0F3D3E]/70">
              Fill in your details and we'll deliver to your doorstep
            </p>
          </div>

          <div className="bg-[#FAF8F3] rounded-3xl p-8 lg:p-12 shadow-xl border border-[#C6A75E]/10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[#0F3D3E]">
                  <Package className="w-5 h-5 text-[#C6A75E]" />
                  Select Product
                </label>
                <select
                  value={selectedProductId || ''}
                  onChange={(e) => onSelectProductId(e.target.value)}
                  disabled={loadingProducts || !products.length}
                  className="w-full px-6 py-4 rounded-xl border-2 border-[#C6A75E]/20 focus:border-[#C6A75E] outline-none transition-colors bg-white text-[#0F3D3E]"
                  required
                >
                  {loadingProducts && <option value="">Loading products...</option>}
                  {!loadingProducts && !products.length && <option value="">No products available</option>}
                  {!loadingProducts &&
                    products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} — PKR {product.price.toLocaleString()} ({product.stock_quantity} in stock)
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[#0F3D3E]">
                    <User className="w-5 h-5 text-[#C6A75E]" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    className="w-full px-6 py-4 rounded-xl border-2 border-[#C6A75E]/20 focus:border-[#C6A75E] outline-none transition-colors bg-white text-[#0F3D3E]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[#0F3D3E]">
                    <Phone className="w-5 h-5 text-[#C6A75E]" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="03XX-XXXXXXX"
                    className="w-full px-6 py-4 rounded-xl border-2 border-[#C6A75E]/20 focus:border-[#C6A75E] outline-none transition-colors bg-white text-[#0F3D3E]"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[#0F3D3E]">
                    <MapPin className="w-5 h-5 text-[#C6A75E]" />
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    placeholder="Karachi, Lahore, Islamabad..."
                    className="w-full px-6 py-4 rounded-xl border-2 border-[#C6A75E]/20 focus:border-[#C6A75E] outline-none transition-colors bg-white text-[#0F3D3E]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[#0F3D3E]">
                    <Package className="w-5 h-5 text-[#C6A75E]" />
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(Number(e.target.value))}
                    min="1"
                    required
                    className="w-full px-6 py-4 rounded-xl border-2 border-[#C6A75E]/20 focus:border-[#C6A75E] outline-none transition-colors bg-white text-[#0F3D3E]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[#0F3D3E]">
                  <Home className="w-5 h-5 text-[#C6A75E]" />
                  Complete Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="House/Flat #, Street, Area, Landmarks..."
                  className="w-full px-6 py-4 rounded-xl border-2 border-[#C6A75E]/20 focus:border-[#C6A75E] outline-none transition-colors bg-white text-[#0F3D3E] resize-none"
                />
              </div>

              {(error || success) && (
                <div
                  className={`p-4 rounded-xl border ${
                    error ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"
                  }`}
                >
                  {error || success}
                </div>
              )}

              <div className="h-px bg-[#C6A75E]/20 my-8"></div>

              <div className="bg-white rounded-xl p-6 space-y-3">
                <div className="flex justify-between text-[#0F3D3E]/70">
                  <span>Subtotal:</span>
                  <span>PKR {totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#0F3D3E]/70">
                  <span>Delivery:</span>
                  <span className="text-green-600">FREE (Cash on Delivery)</span>
                </div>
                <div className="h-px bg-[#C6A75E]/20"></div>
                <div className="flex justify-between text-xl text-[#0F3D3E]">
                  <span>Total:</span>
                  <span className="text-[#C6A75E]">PKR {totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || loadingProducts || !products.length}
                className="w-full py-5 bg-[#C6A75E] text-white text-lg rounded-xl hover:bg-[#B89650] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Placing Order..." : "Place Order - Cash on Delivery"}
              </button>

              <div className="text-center text-sm text-[#0F3D3E]/60 pt-4">
                <p>🔒 Your information is safe and secure</p>
                <p className="mt-2">💳 Pay when you receive the product</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
