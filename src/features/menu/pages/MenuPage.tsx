import { ListFilter, Loader2, Package2, Search } from "lucide-react";
import OrderLists from "../components/OrderLists";
import ProductCard from "../components/ProductCard";
import VariantSelector from "../components/VariantSelector";
import { useCallback, useEffect, useState } from "react";
import { fetchMenuProducts } from "../service";
import type { ProductFull } from "../../products/types";
import type { CartItem, CartItemOption } from "../types";

const MenuPage = () => {
  // Products state
  const [products, setProducts] = useState<ProductFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  // Variant selector state
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductFull | null>(
    null,
  );

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // ==============================
  // Fetch products
  // ==============================

  const loadProducts = useCallback(async (search = "") => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMenuProducts(search);
      setProducts(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal memuat menu.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // ==============================
  // Search (debounced)
  // ==============================

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      loadProducts(value);
    }, 400);
    setSearchTimeout(timeout);
  };

  // ==============================
  // Add to cart flow
  // ==============================

  const handleAddClick = (product: ProductFull) => {
    const variants = product.product_variants ?? [];
    const options = product.product_options ?? [];

    // If no variants and no options, add directly with default values
    if (variants.length <= 1 && options.length === 0) {
      const variant = variants[0] ?? null;
      const basePrice =
        variant?.discount_price && variant.discount_price > 0 && variant.discount_price < variant.price
          ? variant.discount_price
          : variant?.price ?? 0;

      addToCart(
        product,
        variant?.id ?? null,
        variant?.name ?? "Default",
        basePrice,
        [],
        1,
      );
    } else {
      // Open variant selector
      setSelectedProduct(product);
      setSelectorOpen(true);
    }
  };

  const handleVariantSelected = (
    variantId: string | null,
    variantName: string,
    basePrice: number,
    options: CartItemOption[],
    qty: number,
  ) => {
    if (!selectedProduct) return;
    addToCart(selectedProduct, variantId, variantName, basePrice, options, qty);
  };

  const addToCart = (
    product: ProductFull,
    variantId: string | null,
    variantName: string,
    basePrice: number,
    options: CartItemOption[],
    qty: number,
  ) => {
    const newItem: CartItem = {
      id: crypto.randomUUID(),
      productId: product.id,
      productName: product.name,
      productImage: product.image_url ?? "",
      variantId,
      variantName,
      basePrice,
      options,
      qty,
    };

    setCartItems((prev) => [...prev, newItem]);
  };

  // ==============================
  // Cart management
  // ==============================

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateQty = (id: string, qty: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty } : item)),
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  return (
    <section className="">
      {/* header */}
      <div className="container max-w-3xl my-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-zinc-400">
          <ListFilter size={20} />
          <button className="border border-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-100 cursor-pointer text-sm transition">
            Semua
          </button>
        </div>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            className="border border-zinc-200 pl-9 pr-4 py-1.5 rounded-lg w-full max-w-80 focus:outline-0 focus:border-zinc-400 text-zinc-500 text-sm transition"
            type="text"
            placeholder="Cari menu..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400 pr-80">
          <Loader2 size={32} className="animate-spin mb-3" />
          <span className="text-sm">Memuat menu...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400 pr-80">
          <Package2 size={48} className="mb-3 text-zinc-300" />
          <p className="text-sm font-medium">
            {searchQuery
              ? "Tidak ada menu yang cocok."
              : "Belum ada menu tersedia."}
          </p>
        </div>
      ) : (
        <div className="grid flex-1 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pr-80 px-1">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddClick={handleAddClick}
            />
          ))}
        </div>
      )}

      {/* Order Sidebar */}
      <div className="fixed right-0 top-0 h-screen w-80 bg-white">
        <OrderLists
          cartItems={cartItems}
          onRemoveItem={handleRemoveItem}
          onUpdateQty={handleUpdateQty}
          onClearCart={handleClearCart}
        />
      </div>

      {/* Variant Selector */}
      {selectedProduct && (
        <VariantSelector
          isOpen={selectorOpen}
          onClose={() => {
            setSelectorOpen(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          onAddToCart={handleVariantSelected}
        />
      )}
    </section>
  );
};

export default MenuPage;
