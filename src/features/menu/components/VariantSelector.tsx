import { useState } from "react";
import { Check, Minus, Plus, X, Package2 } from "lucide-react";
import type { ProductFull } from "../../products/types";
import type { CartItemOption } from "../types";

type VariantSelectorProps = {
  isOpen: boolean;
  onClose: () => void;
  product: ProductFull;
  onAddToCart: (
    variantId: string | null,
    variantName: string,
    basePrice: number,
    options: CartItemOption[],
    qty: number,
  ) => void;
};

const VariantSelector = ({
  isOpen,
  onClose,
  product,
  onAddToCart,
}: VariantSelectorProps) => {
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, { valueId: string; valueName: string; extraPrice: number }>
  >({});
  const [qty, setQty] = useState(1);

  if (!isOpen) return null;

  const variants = product.product_variants ?? [];
  const options = product.product_options ?? [];
  const selectedVariant = variants[selectedVariantIdx] ?? null;

  // Calculate total price
  const basePrice = selectedVariant?.discount_price &&
    selectedVariant.discount_price > 0 &&
    selectedVariant.discount_price < selectedVariant.price
    ? selectedVariant.discount_price
    : selectedVariant?.price ?? 0;

  const optionsExtra = Object.values(selectedOptions).reduce(
    (sum, opt) => sum + opt.extraPrice,
    0,
  );
  const unitPrice = basePrice + optionsExtra;
  const totalPrice = unitPrice * qty;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID").format(price);

  const handleToggleOption = (
    optionId: string,
    valueId: string,
    valueName: string,
    extraPrice: number,
  ) => {
    setSelectedOptions((prev) => {
      const current = prev[optionId];
      if (current?.valueId === valueId) {
        // Deselect
        const next = { ...prev };
        delete next[optionId];
        return next;
      }
      return {
        ...prev,
        [optionId]: { valueId, valueName, extraPrice },
      };
    });
  };

  const handleSubmit = () => {
    const cartOptions: CartItemOption[] = Object.entries(selectedOptions).map(
      ([optionId, sel]) => {
        const opt = options.find((o) => o.id === optionId);
        return {
          optionName: opt?.name ?? "",
          valueName: sel.valueName,
          extraPrice: sel.extraPrice,
        };
      },
    );

    onAddToCart(
      selectedVariant?.id ?? null,
      selectedVariant?.name ?? "Default",
      unitPrice,
      cartOptions,
      qty,
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-white dark:bg-zinc-950 shadow-xl border-t sm:border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-4 py-3.5 sm:px-5 sm:py-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Tambah Pesanan</h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-light">Konfigurasi produk belanjaan</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Product Preview Block */}
        <div className="flex gap-4 p-4 bg-zinc-50/50 dark:bg-zinc-900/20 border-b border-zinc-100 dark:border-zinc-800/40">
          {product.image_url ? (
            <img
              className="w-16 h-16 object-cover rounded-xl border border-zinc-200 dark:border-zinc-800 shrink-0"
              src={product.image_url}
              alt={product.name}
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-300 dark:text-zinc-700 shrink-0 border border-zinc-200 dark:border-zinc-800">
              <Package2 size={24} />
            </div>
          )}
          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 capitalize leading-tight">
              {product.name}
            </h3>
            {product.description ? (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light line-clamp-2 mt-1">
                {product.description}
              </p>
            ) : (
              <p className="text-xs text-zinc-400 dark:text-zinc-600 font-light italic mt-1">
                Tidak ada deskripsi produk.
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Variants */}
          {variants.length > 0 && !(variants.length === 1 && (variants[0].name.toLowerCase() === "default" || variants[0].name === "")) && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Pilih Varian
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {variants.map((variant, idx) => {
                  const isSelected = idx === selectedVariantIdx;
                  const showPrice =
                    variant.discount_price > 0 &&
                    variant.discount_price < variant.price
                      ? variant.discount_price
                      : variant.price;

                  return (
                    <button
                      key={variant.id}
                      onClick={() => {
                        setSelectedVariantIdx(idx);
                        setQty(1);
                      }}
                      className={`rounded-xl border p-3 text-sm transition text-left flex flex-col gap-1 cursor-pointer ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-50/30 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 font-medium"
                          : "border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 w-full">
                        <span className="font-semibold text-zinc-850 dark:text-zinc-200">{variant.name}</span>
                        <span className="text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                          Rp {formatPrice(showPrice)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between w-full text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                        <span className="font-mono">
                          Stok: {variant.stock > 0 ? variant.stock : "Habis"}
                        </span>
                        {isSelected && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                            <Check size={10} strokeWidth={3} /> Terpilih
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Options */}
          {options.map((option) => (
            <div key={option.id} className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {option.name}
              </h4>
              <div className="flex flex-wrap gap-2">
                {option.product_option_values.map((val) => {
                  const isSelected =
                    selectedOptions[option.id]?.valueId === val.id;
                  return (
                    <button
                      key={val.id}
                      onClick={() =>
                        handleToggleOption(
                          option.id,
                          val.id,
                          val.value,
                          val.extra_price,
                        )
                      }
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition cursor-pointer ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-50/30 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 font-medium"
                          : "border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30"
                      }`}
                    >
                      {isSelected ? (
                        <div className="w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0">
                          <Check size={10} strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-zinc-300 dark:border-zinc-700 shrink-0" />
                      )}
                      <span>{val.value}</span>
                      {val.extra_price > 0 && (
                        <span className="text-xs opacity-75 font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                          +Rp {formatPrice(val.extra_price)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Qty */}
          <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/80 pt-4">
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Jumlah</h4>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-light">Tentukan kuantitas pembelian</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 cursor-pointer active:scale-95 transition"
              >
                <Minus size={16} />
              </button>
              <span className="min-w-[2rem] text-center text-lg font-bold font-mono text-zinc-800 dark:text-zinc-200">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => {
                  const limit = selectedVariant ? selectedVariant.stock : 99999;
                  if (q >= limit) {
                    alert(`Tidak bisa melebihi stok tersedia (${limit} item)!`);
                    return q;
                  }
                  return q + 1;
                })}
                disabled={qty >= (selectedVariant ? selectedVariant.stock : 99999)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 cursor-pointer active:scale-95 transition disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 px-4 py-3 sm:px-5 sm:py-4 bg-zinc-50/50 dark:bg-zinc-900/10 rounded-b-2xl">
          {selectedVariant && selectedVariant.stock > 0 ? (
            <button
              onClick={handleSubmit}
              className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-98 duration-100"
            >
              <span>Tambah ke Pesanan</span>
              <span className="rounded-md bg-white/20 px-2 py-0.5 text-xs font-mono font-bold">
                Rp {formatPrice(totalPrice)}
              </span>
            </button>
          ) : (
            <button
              disabled
              className="w-full rounded-xl bg-zinc-100 dark:bg-zinc-900 py-3 text-sm font-semibold text-zinc-400 dark:text-zinc-650 border border-zinc-200 dark:border-zinc-800 transition flex items-center justify-center gap-2 cursor-not-allowed"
            >
              <span>Stok Habis</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VariantSelector;
