import { type ChangeEvent, type FormEvent, useMemo, useState } from "react";
import { ShoppingBag, User, Phone, MapPin, Home, Package, Minus, Plus, Trash2 } from "lucide-react";
import { placeGroupedOrder } from "@/lib/api/orders";
import { CartItem, ProductType } from "@/lib/types";

type CheckoutSectionProps = {
  products: ProductType[];
  loadingProducts: boolean;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onOrderPlaced?: () => void;
};

export function CheckoutSection({
  products,
  loadingProducts,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderPlaced,
}: CheckoutSectionProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    address: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const cartTotal = useMemo(
    () =>
      cartItems.reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0),
    [cartItems]
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleQuantityChange = (productId: string, value: number) => {
    const product = cartItems.find((item) => item.product.id === productId)?.product
      || products.find((item) => item.id === productId);
    if (!product) return;

    const safeValue = Math.min(Math.max(1, value), product.stock_quantity || 1);
    onUpdateQuantity(productId, safeValue);
  };

  const validatePhone = (phone: string) => /^03\d{2}-?\d{7}$/.test(phone);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!cartItems.length) {
      setError("Add at least one product to your cart before checking out.");
      return;
    }

    const unavailable = cartItems.find(
      (item) => !item.product.is_active || !item.product.stock_quantity || item.product.stock_quantity < 1
    );

    if (unavailable) {
      setError(`${unavailable.product.name} is unavailable. Please remove it from your cart.`);
      return;
    }

    const overLimit = cartItems.find((item) => item.quantity > item.product.stock_quantity);
    if (overLimit) {
      setError(`Only ${overLimit.product.stock_quantity} unit(s) of ${overLimit.product.name} are available.`);
      onUpdateQuantity(overLimit.product.id, overLimit.product.stock_quantity);
      return;
    }

    if (!validatePhone(formData.phone.trim())) {
      setError("Enter a valid Pakistan mobile number (03XX-XXXXXXX).");
      return;
    }

    setSubmitting(true);

    try {
      const { error: placeError } = await placeGroupedOrder({
        customer_name: formData.name.trim(),
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        address: formData.address.trim(),
        items: cartItems.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
      });

      if (placeError) {
        throw placeError;
      }

      setSuccess("Order placed! You will receive a confirmation call soon.");
      setFormData({ name: "", phone: "", city: "", address: "" });
      onClearCart();
      onOrderPlaced?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unexpected error while placing the order. Please try again."
      );
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
              <span className="text-sm text-[#0F3D3E]">Cart & Checkout</span>
            </div>
            <h2 className="text-4xl lg:text-5xl text-[#0F3D3E] mb-4">
              Complete Your Order
            </h2>
            <p className="text-lg text-[#0F3D3E]/70">
              Add products to your cart, review quantities, and share your delivery details
            </p>
          </div>

          <div className="bg-[#FAF8F3] rounded-3xl p-8 lg:p-12 shadow-xl border border-[#C6A75E]/10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#0F3D3E]">
                  <Package className="w-5 h-5 text-[#C6A75E]" />
                  <span>Your Cart</span>
                </div>

                {!cartItems.length && (
                  <div className="p-4 rounded-xl border border-dashed border-[#C6A75E]/30 bg-white text-[#0F3D3E]/70">
                    Your cart is empty. Add a product from the list above to get started.
                  </div>
                )}

                {!!cartItems.length && (
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div
                        key={item.product.id}
                        className="bg-white rounded-xl border border-[#C6A75E]/20 p-4 flex flex-col gap-3"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="text-lg text-[#0F3D3E]">{item.product.name}</div>
                            <div className="text-sm text-[#0F3D3E]/60">
                              PKR {item.product.price.toLocaleString()} • {item.product.stock_quantity} in stock
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.product.id)}
                            className="text-[#0F3D3E]/60 hover:text-red-600 transition-colors"
                            aria-label={`Remove ${item.product.name}`}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                              className="p-2 rounded-lg border border-[#C6A75E]/30 text-[#C6A75E] hover:bg-[#F5E6C8]"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.product.id, Number(e.target.value))}
                              min={1}
                              max={item.product.stock_quantity}
                              className="w-20 text-center px-3 py-2 rounded-lg border border-[#C6A75E]/30 focus:border-[#C6A75E] outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                              className="p-2 rounded-lg border border-[#C6A75E]/30 text-[#C6A75E] hover:bg-[#F5E6C8]"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="text-right">
                            <div className="text-sm text-[#0F3D3E]/60">Line Total</div>
                            <div className="text-xl text-[#C6A75E]">
                              PKR {(item.product.price * item.quantity).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

              <div className="grid md:grid-cols-1 gap-6">
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
                  <span>PKR {cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#0F3D3E]/70">
                  <span>Delivery:</span>
                  <span className="text-green-600">FREE (Cash on Delivery)</span>
                </div>
                <div className="h-px bg-[#C6A75E]/20"></div>
                <div className="flex justify-between text-xl text-[#0F3D3E]">
                  <span>Total:</span>
                  <span className="text-[#C6A75E]">PKR {cartTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || loadingProducts || !products.length || !cartItems.length}
                className="w-full py-5 bg-[#C6A75E] text-white text-lg rounded-xl hover:bg-[#B89650] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting
                  ? "Placing Order..."
                  : cartItems.length
                    ? `Place Order for ${cartItems.length} item(s)`
                    : "Add items to cart"}
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
