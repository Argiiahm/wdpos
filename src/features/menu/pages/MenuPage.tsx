import { ListFilter, Loader2, Package2, Search, ShoppingCart, X } from "lucide-react";
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
  const [isCartOpen, setIsCartOpen] = useState(false);

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
    setSelectedProduct(product);
    setSelectorOpen(true);
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
    const variant = product.product_variants?.find((v) => v.id === variantId);
    const stockLimit = variant ? variant.stock : 99999;

    const existingQty = cartItems
      .filter((item) => item.variantId === variantId)
      .reduce((sum, item) => sum + item.qty, 0);

    if (existingQty + qty > stockLimit) {
      alert(`Stok tidak mencukupi! Stok tersedia: ${stockLimit}, di keranjang: ${existingQty}`);
      return;
    }

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
    const item = cartItems.find((x) => x.id === id);
    if (!item) return;

    const product = products.find((p) => p.id === item.productId);
    const variant = product?.product_variants?.find((v) => v.id === item.variantId);
    const stockLimit = variant ? variant.stock : 99999;

    const otherQty = cartItems
      .filter((x) => x.id !== id && x.variantId === item.variantId)
      .reduce((sum, x) => sum + x.qty, 0);

    if (otherQty + qty > stockLimit) {
      alert(`Gagal menambah! Total di keranjang melebihi batas stok (${stockLimit} item).`);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty } : item)),
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <section className="relative">
      {/* header */}
      <div className="flex justify-between items-center gap-4 flex-wrap mb-6 xl:pr-80">
        <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
          <ListFilter size={20} />
          <button className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/80 cursor-pointer text-sm transition font-medium">
            Semua
          </button>
        </div>
        <div className="relative flex-1 max-w-80 min-w-[200px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
          />
          <input
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 pl-9 pr-4 py-1.5 rounded-lg w-full focus:outline-0 focus:border-zinc-400 dark:focus:border-zinc-700 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 text-sm transition"
            type="text"
            placeholder="Cari menu..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400 dark:text-zinc-600 xl:pr-80">
          <Loader2 size={32} className="animate-spin mb-3" />
          <span className="text-sm">Memuat menu...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400 dark:text-zinc-600 xl:pr-80">
          <Package2 size={48} className="mb-3 text-zinc-300 dark:text-zinc-700" />
          <p className="text-sm font-medium">
            {searchQuery
              ? "Tidak ada menu yang cocok."
              : "Belum ada menu tersedia."}
          </p>
        </div>
      ) : (
        <div className="grid flex-1 grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 xl:pr-80">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddClick={handleAddClick}
            />
          ))}
        </div>
      )}

      {/* Desktop Order Sidebar */}
      <div className="hidden xl:block fixed right-0 top-0 h-screen w-80 bg-white border-l border-gray-200">
        <OrderLists
          cartItems={cartItems}
          onRemoveItem={handleRemoveItem}
          onUpdateQty={handleUpdateQty}
          onClearCart={handleClearCart}
        />
      </div>

      {/* Floating Cart Button (mobile/tablet only) */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="xl:hidden fixed bottom-6 right-6 z-40 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full border border-indigo-700 transition-all flex items-center justify-center cursor-pointer active:scale-95 duration-150"
      >
        <div className="relative">
          <ShoppingCart className="h-6 w-6" />
          {totalItems > 0 && (
            <span className="absolute -top-3.5 -right-3.5 bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-indigo-600">
              {totalItems}
            </span>
          )}
        </div>
      </button>

      {/* Mobile Cart Drawer Backdrop */}
      {isCartOpen && (
        <div
          onClick={() => setIsCartOpen(false)}
          className="xl:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity duration-300"
        />
      )}

      {/* Mobile Cart Drawer */}
      <div
        className={`xl:hidden fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white z-50 border-l border-gray-200 transform transition-transform duration-300 ease-in-out ${isCartOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-indigo-600" />
            Detail Pesanan
          </h3>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="h-[calc(100%-60px)] overflow-y-auto">
          <OrderLists
            cartItems={cartItems}
            onRemoveItem={handleRemoveItem}
            onUpdateQty={handleUpdateQty}
            onClearCart={handleClearCart}
          />
        </div>
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
