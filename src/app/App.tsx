import { useCallback, useEffect, useState } from "react";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { BenefitsSection } from "./components/BenefitsSection";
import { ProductsSection } from "./components/ProductsSection";
import { TestimonialsSection } from "./components/TestimonialsSection";
import { OfferSection } from "./components/OfferSection";
import { CheckoutSection } from "./components/CheckoutSection";
import { Footer } from "./components/Footer";
import { fetchActiveProducts } from "@/lib/api/products";
import { CartItem, ProductType } from "@/lib/types";

export default function App() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    const { data, error } = await fetchActiveProducts();

    if (error) {
      setProductsError(error.message);
      setProducts([]);
    } else {
      setProductsError(null);
      setProducts(data);
    }

    setProductsLoading(false);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (!products.length) return;

    setCartItems((previous) =>
      previous
        .map((item) => {
          const updatedProduct = products.find((product) => product.id === item.product.id);
          if (!updatedProduct || !updatedProduct.is_active || updatedProduct.stock_quantity < 1) {
            return null;
          }

          const safeQuantity = Math.min(Math.max(1, item.quantity), updatedProduct.stock_quantity);
          return { product: updatedProduct, quantity: safeQuantity } as CartItem;
        })
        .filter(Boolean) as CartItem[]
    );
  }, [products]);

  const handleAddToCart = (productId: string, quantity: number) => {
    const product = products.find((item) => item.id === productId);
    if (!product || !product.is_active || product.stock_quantity < 1) {
      return;
    }

    const safeQuantity = Math.max(1, quantity);

    setCartItems((previous) => {
      const existing = previous.find((item) => item.product.id === productId);
      const maxQuantity = product.stock_quantity;
      const nextQuantity = Math.min(
        safeQuantity + (existing ? existing.quantity : 0),
        maxQuantity
      );

      if (existing) {
        return previous.map((item) =>
          item.product.id === productId ? { product, quantity: nextQuantity } : item
        );
      }

      return [...previous, { product, quantity: Math.min(safeQuantity, maxQuantity) }];
    });

    document.getElementById("checkout")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    const product = products.find((item) => item.id === productId);
    if (!product) return;

    const safeQuantity = Math.min(Math.max(1, quantity), product.stock_quantity || 1);
    setCartItems((previous) =>
      previous.map((item) =>
        item.product.id === productId ? { product, quantity: safeQuantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((previous) => previous.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => setCartItems([]);

  return (
    <div className="min-h-screen bg-white">
      <Header cartCount={cartItems.length} />
      <main>
        <HeroSection />
        <BenefitsSection />
        <ProductsSection
          products={products}
          loading={productsLoading}
          error={productsError}
          onAddToCart={handleAddToCart}
        />
        <TestimonialsSection />
        <OfferSection />
        <CheckoutSection
          products={products}
          loadingProducts={productsLoading}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveFromCart}
          onClearCart={handleClearCart}
          onOrderPlaced={loadProducts}
        />
      </main>
      <Footer />
    </div>
  );
}
