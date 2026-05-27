import { useState } from "react";
import { Check, Minus, Plus, X } from "lucide-react";
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">{product.name}</h2>
            <p className="text-sm text-gray-500">Pilih variant & options</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto p-5 space-y-5">
          {/* Variants */}
          {variants.length > 0 && (
            <div>
              <h4 className="mb-3 text-sm font-medium text-gray-700">
                Variant
              </h4>
              <div className="flex flex-wrap gap-2">
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
                      onClick={() => setSelectedVariantIdx(idx)}
                      className={`rounded-lg border px-3 py-2 text-sm transition ${
                        isSelected
                          ? "border-black bg-black text-white"
                          : "border-gray-200 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      <span className="font-medium">{variant.name}</span>
                      <span className="ml-1.5 text-xs opacity-75">
                        Rp {formatPrice(showPrice)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Options */}
          {options.map((option) => (
            <div key={option.id}>
              <h4 className="mb-3 text-sm font-medium text-gray-700">
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
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition ${
                        isSelected
                          ? "border-black bg-black text-white"
                          : "border-gray-200 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      {isSelected && <Check size={14} />}
                      <span>{val.value}</span>
                      {val.extra_price > 0 && (
                        <span className="text-xs opacity-75">
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
          <div>
            <h4 className="mb-3 text-sm font-medium text-gray-700">
              Jumlah
            </h4>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                <Minus size={16} />
              </button>
              <span className="min-w-[2rem] text-center text-lg font-semibold">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-5 py-4">
          <button
            onClick={handleSubmit}
            className="w-full rounded-lg bg-green-600 py-3 text-sm font-medium text-white hover:bg-green-700 transition flex items-center justify-center gap-2"
          >
            <span>Tambah ke Pesanan</span>
            <span className="rounded-md bg-white/20 px-2 py-0.5 text-xs">
              Rp {formatPrice(totalPrice)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VariantSelector;
