import { Loader2, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createProduct, updateProduct } from "../service";
import type {
  ProductFull,
  ProductFormVariant,
  ProductFormOption,
  ProductFormOptionValue,
  ProductFormData,
} from "../types";

// Props
type DialogCreateProductType = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editProduct?: ProductFull | null;
};

const DialogProducts = ({
  isOpen,
  onClose,
  onSuccess,
  editProduct,
}: DialogCreateProductType) => {
  // Product State
  const [product, setProduct] = useState<ProductFormData>({
    name: "",
    description: "",
    image_url: "",
  });

  // Variants State
  const [variants, setVariants] = useState<ProductFormVariant[]>([]);

  // Options State
  const [options, setOptions] = useState<ProductFormOption[]>([]);

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!editProduct;

  // Pre-fill form when editing
  useEffect(() => {
    if (editProduct) {
      setProduct({
        name: editProduct.name,
        description: editProduct.description,
        image_url: editProduct.image_url ?? "",
      });

      setVariants(
        editProduct.product_variants.map((v) => ({
          id: crypto.randomUUID(),
          name: v.name,
          price: String(v.price),
          discount_price: String(v.discount_price),
          stock: v.stock,
        })),
      );

      setOptions(
        editProduct.product_options.map((opt) => ({
          id: crypto.randomUUID(),
          name: opt.name,
          values: opt.product_option_values.map((val) => ({
            id: crypto.randomUUID(),
            value: val.value,
            extra_price: String(val.extra_price),
          })),
        })),
      );
    } else {
      // Reset form for create mode
      setProduct({ name: "", description: "", image_url: "" });
      setVariants([]);
      setOptions([]);
    }
    setError(null);
  }, [editProduct, isOpen]);

  if (!isOpen) return null;

  // ==============================
  // Variant Handlers
  // ==============================

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        id: crypto.randomUUID(),
        name: "",
        price: "",
        discount_price: "",
        stock: 0,
      },
    ]);
  };

  const handleRemoveVariant = (variantId: string) => {
    setVariants(variants.filter((variant) => variant.id !== variantId));
  };

  const handleVariantChange = (
    variantId: string,
    field: keyof ProductFormVariant,
    value: string | number,
  ) => {
    setVariants(
      variants.map((variant) =>
        variant.id === variantId
          ? {
              ...variant,
              [field]: value,
            }
          : variant,
      ),
    );
  };

  // ==============================
  // Option Handlers
  // ==============================

  const handleAddOption = () => {
    setOptions([
      ...options,
      {
        id: crypto.randomUUID(),
        name: "",
        values: [],
      },
    ]);
  };

  const handleRemoveOption = (optionId: string) => {
    setOptions(options.filter((option) => option.id !== optionId));
  };

  const handleOptionNameChange = (optionId: string, value: string) => {
    setOptions(
      options.map((option) =>
        option.id === optionId
          ? {
              ...option,
              name: value,
            }
          : option,
      ),
    );
  };

  // ==============================
  // Option Value Handlers
  // ==============================

  const handleAddOptionValue = (optionId: string) => {
    setOptions(
      options.map((option) =>
        option.id === optionId
          ? {
              ...option,
              values: [
                ...option.values,
                {
                  id: crypto.randomUUID(),
                  value: "",
                  extra_price: "",
                },
              ],
            }
          : option,
      ),
    );
  };

  const handleRemoveOptionValue = (optionId: string, valueId: string) => {
    setOptions(
      options.map((option) =>
        option.id === optionId
          ? {
              ...option,
              values: option.values.filter((value) => value.id !== valueId),
            }
          : option,
      ),
    );
  };

  const handleOptionValueChange = (
    optionId: string,
    valueId: string,
    field: keyof ProductFormOptionValue,
    value: string,
  ) => {
    setOptions(
      options.map((option) =>
        option.id === optionId
          ? {
              ...option,
              values: option.values.map((val) =>
                val.id === valueId
                  ? {
                      ...val,
                      [field]: value,
                    }
                  : val,
              ),
            }
          : option,
      ),
    );
  };

  // ==============================
  // Submit
  // ==============================

  const handleSubmit = async () => {
    // Basic validation
    if (!product.name.trim()) {
      setError("Product name wajib diisi!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isEditMode && editProduct) {
        await updateProduct(editProduct.id, product, variants, options);
      } else {
        await createProduct(product, variants, options);
      }
      onSuccess();
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Terjadi kesalahan.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-300 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">
              {isEditMode ? "Edit Product" : "Add Product"}
            </h2>

            <p className="text-sm text-gray-500">Product details & variants</p>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[75vh] space-y-5 overflow-y-auto p-5">
          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Product Info */}
          <div className="space-y-4 rounded-xl border border-gray-200 p-4">
            <h3 className="font-medium">Product Information</h3>

            {/* Product Name */}
            <div>
              <label className="mb-2 block text-sm text-gray-600">
                Product Name
              </label>

              <input
                type="text"
                value={product.name}
                onChange={(e) =>
                  setProduct({
                    ...product,
                    name: e.target.value,
                  })
                }
                placeholder="Bakso Mercon"
                className="h-11 w-full rounded-lg border border-gray-300 px-3 outline-none focus:border-gray-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm text-gray-600">
                Description
              </label>

              <textarea
                rows={3}
                value={product.description}
                onChange={(e) =>
                  setProduct({
                    ...product,
                    description: e.target.value,
                  })
                }
                placeholder="Product description..."
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="mb-2 block text-sm text-gray-600">
                Image URL
              </label>

              <input
                type="url"
                value={product.image_url}
                onChange={(e) =>
                  setProduct({
                    ...product,
                    image_url: e.target.value,
                  })
                }
                placeholder="https://example.com/image.jpg"
                className="h-11 w-full rounded-lg border border-gray-300 px-3 outline-none focus:border-gray-500"
              />

              {product.image_url && (
                <div className="mt-2">
                  <img
                    src={product.image_url}
                    alt="Preview"
                    className="h-20 w-20 rounded-lg border border-gray-200 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Variants */}
          <div className="space-y-4 rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Variants</h3>

              <button
                onClick={handleAddVariant}
                className="flex items-center gap-2 rounded-lg bg-black px-3 py-2 text-sm text-white hover:opacity-90"
              >
                <Plus size={15} />
                Add
              </button>
            </div>

            {variants.length === 0 && (
              <p className="text-sm text-gray-400">
                Belum ada variant. Klik "Add" untuk menambah.
              </p>
            )}

            {variants.map((variant, index) => (
              <div
                key={variant.id}
                className="space-y-3 rounded-xl border border-gray-200 p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Variant {index + 1}
                  </span>

                  <button
                    onClick={() => handleRemoveVariant(variant.id)}
                    className="rounded p-1 hover:bg-gray-100"
                  >
                    <X size={18} />
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Variant name"
                  value={variant.name}
                  onChange={(e) =>
                    handleVariantChange(variant.id, "name", e.target.value)
                  }
                  className="h-10 w-full rounded-lg border border-gray-300 px-3 outline-none focus:border-gray-500"
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Price"
                    value={variant.price}
                    onChange={(e) =>
                      handleVariantChange(variant.id, "price", e.target.value)
                    }
                    className="h-10 rounded-lg border border-gray-300 px-3 outline-none focus:border-gray-500"
                  />

                  <input
                    type="number"
                    placeholder="Discount"
                    value={variant.discount_price}
                    onChange={(e) =>
                      handleVariantChange(
                        variant.id,
                        "discount_price",
                        e.target.value,
                      )
                    }
                    className="h-10 rounded-lg border border-gray-300 px-3 outline-none focus:border-gray-500"
                  />
                </div>

                <input
                  type="number"
                  placeholder="Stock"
                  value={variant.stock}
                  onChange={(e) =>
                    handleVariantChange(
                      variant.id,
                      "stock",
                      Number(e.target.value),
                    )
                  }
                  className="h-10 w-full rounded-lg border border-gray-300 px-3 outline-none focus:border-gray-500"
                />
              </div>
            ))}
          </div>

          {/* Options */}
          <div className="space-y-4 rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Options</h3>

              <button
                onClick={handleAddOption}
                className="flex items-center gap-2 rounded-lg bg-black px-3 py-2 text-sm text-white hover:opacity-90"
              >
                <Plus size={15} />
                Add
              </button>
            </div>

            {options.length === 0 && (
              <p className="text-sm text-gray-400">
                Belum ada option. Klik "Add" untuk menambah.
              </p>
            )}

            {options.map((option, index) => (
              <div
                key={option.id}
                className="space-y-3 rounded-xl border border-gray-200 p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Option {index + 1}
                  </span>

                  <button
                    onClick={() => handleRemoveOption(option.id)}
                    className="rounded p-1 hover:bg-gray-100"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Option Name */}
                <input
                  type="text"
                  value={option.name}
                  onChange={(e) =>
                    handleOptionNameChange(option.id, e.target.value)
                  }
                  placeholder="Option name (e.g. Level Pedas)"
                  className="h-10 w-full rounded-lg border border-gray-300 px-3 outline-none focus:border-gray-500"
                />

                {/* Option Values */}
                {option.values.map((value) => (
                  <div
                    key={value.id}
                    className="grid grid-cols-[40px_1fr_120px] items-center gap-3"
                  >
                    <button
                      onClick={() =>
                        handleRemoveOptionValue(option.id, value.id)
                      }
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50"
                    >
                      <X size={16} />
                    </button>

                    <input
                      type="text"
                      value={value.value}
                      onChange={(e) =>
                        handleOptionValueChange(
                          option.id,
                          value.id,
                          "value",
                          e.target.value,
                        )
                      }
                      placeholder="Option value"
                      className="h-10 rounded-lg border border-gray-300 px-3 outline-none focus:border-gray-500"
                    />

                    <input
                      type="number"
                      value={value.extra_price}
                      onChange={(e) =>
                        handleOptionValueChange(
                          option.id,
                          value.id,
                          "extra_price",
                          e.target.value,
                        )
                      }
                      placeholder="+ Price"
                      className="h-10 rounded-lg border border-gray-300 px-3 outline-none focus:border-gray-500"
                    />
                  </div>
                ))}

                <button
                  onClick={() => handleAddOptionValue(option.id)}
                  className="text-sm text-gray-500 hover:text-black"
                >
                  + Add Value
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-gray-300 px-5 py-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : isEditMode ? (
              "Update Product"
            ) : (
              "Save Product"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DialogProducts;
