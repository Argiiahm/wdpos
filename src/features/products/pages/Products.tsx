import {
  Loader2,
  Package2,
  PackagePlus,
  PenBox,
  Search,
  Trash2,
} from "lucide-react";
import DialogProducts from "../components/Dialog";
import ConfirmDialog from "../components/ConfirmDialog";
import { useCallback, useEffect, useState } from "react";
import { deleteProduct, fetchProducts } from "../service";
import type { ProductFull } from "../types";

const Products = () => {
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductFull | null>(
    null,
  );

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<ProductFull | null>(
    null,
  );
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Data state
  const [products, setProducts] = useState<ProductFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  // ==============================
  // Fetch products
  // ==============================

  const loadProducts = useCallback(async (search = "") => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts(search);
      setProducts(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal memuat data products.";
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
  // Create
  // ==============================

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setDialogOpen(true);
  };

  // ==============================
  // Edit
  // ==============================

  const handleOpenEdit = (product: ProductFull) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  // ==============================
  // Delete
  // ==============================

  const handleOpenDelete = (product: ProductFull) => {
    setDeletingProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setDeleteLoading(true);
    setError(null);
    try {
      await deleteProduct(deletingProduct.id);
      setDeleteDialogOpen(false);
      setDeletingProduct(null);
      loadProducts(searchQuery);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal menghapus product.";
      setError(message);
      setDeleteDialogOpen(false);
      setDeletingProduct(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ==============================
  // Success callback
  // ==============================

  const handleSuccess = () => {
    loadProducts(searchQuery);
  };

  // ==============================
  // Helpers
  // ==============================

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID").format(price);
  };

  const getFirstVariant = (product: ProductFull) => {
    return product.product_variants?.[0] ?? null;
  };

  return (
    <div className="px-4 md:px-8 mt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 text-zinc-400">
          <Package2 />
          <span className="font-semibold">Data Products</span>
          {!loading && (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 font-mono">
              {products.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          {/* btn Open Dialog */}
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 text-zinc-600 cursor-pointer border border-gray-200 p-2 rounded-lg hover:bg-zinc-100 transition"
            title="Tambah Product"
          >
            <PackagePlus size={20} />
          </button>
          <div className="relative flex-1 max-w-80 min-w-[200px]">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              className="border border-gray-200 pl-9 pr-4 py-1.5 rounded-lg focus:outline-0 focus:border-zinc-400 text-zinc-500 transition w-full text-sm"
              type="text"
              placeholder="Cari products..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="my-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
          <Loader2 size={32} className="animate-spin mb-3" />
          <span className="text-sm">Memuat data products...</span>
        </div>
      ) : products.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
          <Package2 size={48} className="mb-3 text-zinc-300" />
          <p className="text-sm font-medium">
            {searchQuery
              ? "Tidak ada product yang cocok."
              : "Belum ada product."}
          </p>
          {!searchQuery && (
            <button
              onClick={handleOpenCreate}
              className="mt-3 flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm text-white hover:opacity-90"
            >
              <PackagePlus size={16} />
              Tambah Product Pertama
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-xl bg-white">
            <table className="w-full max-w-7xl mx-auto">
              <thead className="text-slate-900 text-left text-sm font-semibold border-b border-gray-200 bg-slate-50/50 whitespace-nowrap">
                <tr>
                  <th scope="col" className="px-4 py-3.5">
                    Image
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Product Name
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Description
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Variants
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Price
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Stock
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="text-sm divide-y divide-gray-200">
                {products.map((product) => {
                  const firstVariant = getFirstVariant(product);
                  const variantCount = product.product_variants?.length ?? 0;

                  return (
                    <tr key={product.id} className="hover:bg-zinc-50/50 transition">
                      <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                        {product.image_url ? (
                          <img
                            className="w-10 h-10 aspect-square object-cover rounded-lg"
                            src={product.image_url}
                            alt={product.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect fill='%23f4f4f5' width='40' height='40' rx='8'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23a1a1aa' font-size='14'%3E?%3C/text%3E%3C/svg%3E";
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400">
                            <Package2 size={18} />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium">
                        {product.name}
                      </td>
                      <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">
                        {product.description || "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {variantCount > 0 ? (
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                            {variantCount} variant{variantCount > 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className="text-zinc-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono">
                        {firstVariant ? (
                          <div className="flex flex-col">
                            {firstVariant.discount_price > 0 &&
                            firstVariant.discount_price < firstVariant.price ? (
                              <>
                                <span className="text-xs text-zinc-400 line-through">
                                  Rp {formatPrice(firstVariant.price)}
                                </span>
                                <span className="text-green-600 font-medium">
                                  Rp {formatPrice(firstVariant.discount_price)}
                                </span>
                              </>
                            ) : (
                              <span>Rp {formatPrice(firstVariant.price)}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-zinc-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono">
                        {firstVariant ? firstVariant.stock : "-"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(product)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                            title="Edit"
                          >
                            <PenBox size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(product)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {products.map((product) => {
              const firstVariant = getFirstVariant(product);
              const variantCount = product.product_variants?.length ?? 0;

              return (
                <div
                  key={product.id}
                  className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col gap-4"
                >
                  <div className="flex items-center gap-3">
                    {product.image_url ? (
                      <img
                        className="w-14 h-14 aspect-square object-cover rounded-lg shrink-0"
                        src={product.image_url}
                        alt={product.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 40 40'%3E%3Crect fill='%23f4f4f5' width='40' height='40' rx='8'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23a1a1aa' font-size='14'%3E?%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 shrink-0">
                        <Package2 size={20} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-slate-800 text-sm truncate">{product.name}</h4>
                      <p className="text-xs text-slate-400 font-light truncate mt-0.5">
                        {product.description || "-"}
                      </p>
                      {variantCount > 0 ? (
                        <span className="inline-block rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600 mt-1">
                          {variantCount} variant{variantCount > 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-xs">-</span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-gray-200 pt-3 text-xs">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-slate-400 font-light">Price</span>
                      {firstVariant ? (
                        <div className="font-semibold font-mono text-slate-700">
                          {firstVariant.discount_price > 0 &&
                          firstVariant.discount_price < firstVariant.price ? (
                            <div className="flex flex-col">
                              <span className="text-[10px] text-zinc-400 line-through">
                                Rp {formatPrice(firstVariant.price)}
                              </span>
                              <span className="text-green-600 font-semibold">
                                Rp {formatPrice(firstVariant.discount_price)}
                              </span>
                            </div>
                          ) : (
                            <span>Rp {formatPrice(firstVariant.price)}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-zinc-400 text-xs">-</span>
                      )}
                    </div>

                    <div className="flex flex-col gap-0.5 items-center">
                      <span className="text-[10px] text-slate-400 font-light">Stock</span>
                      <span className="font-semibold font-mono text-slate-700">
                        {firstVariant ? firstVariant.stock : "-"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(product)}
                        className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 border border-gray-200 transition cursor-pointer"
                        title="Edit"
                      >
                        <PenBox size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenDelete(product)}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 border border-gray-200 transition cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Dialog Create/Edit */}
      <DialogProducts
        isOpen={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingProduct(null);
        }}
        onSuccess={handleSuccess}
        editProduct={editingProduct}
      />

      {/* Dialog Delete Confirm */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeletingProduct(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Hapus Product?"
        message={`Product "${deletingProduct?.name ?? ""}" akan dihapus beserta semua variant dan option-nya. Tindakan ini tidak bisa dibatalkan.`}
        loading={deleteLoading}
      />
    </div>
  );
};

export default Products;
