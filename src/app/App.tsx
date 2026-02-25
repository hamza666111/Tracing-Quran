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
import { ProductType } from "@/lib/types";

export default function App() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    const { data, error } = await fetchActiveProducts();

    if (error) {
      setProductsError(error.message);
      setProducts([]);
    } else {
      setProductsError(null);
      setProducts(data);
      if (data.length) {
        setSelectedProductId((previous) => previous || data[0].id);
      }
    }

    setProductsLoading(false);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSelectProduct = (productId: string, quantity: number) => {
    setSelectedProductId(productId);
    setSelectedQuantity(quantity);
    document.getElementById("checkout")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <BenefitsSection />
        <ProductsSection
          products={products}
          loading={productsLoading}
          error={productsError}
          onSelectProduct={handleSelectProduct}
        />
        <TestimonialsSection />
        <OfferSection />
        <CheckoutSection
          products={products}
          loadingProducts={productsLoading}
          selectedProductId={selectedProductId}
          onSelectProductId={setSelectedProductId}
          selectedQuantity={selectedQuantity}
          onQuantityChange={setSelectedQuantity}
          onOrderPlaced={loadProducts}
        />
      </main>
      <Footer />
    </div>
  );
}
