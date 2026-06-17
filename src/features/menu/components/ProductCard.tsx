import { Package2, ShoppingCart } from "lucide-react";
import type { ProductFull } from "../../products/types";

type ProductCardProps = {
  product: ProductFull;
  onAddClick: (product: ProductFull) => void;
};

const ProductCard = ({ product, onAddClick }: ProductCardProps) => {
  const firstVariant = product.product_variants?.[0] ?? null;
  const variantCount = product.product_variants?.length ?? 0;

  const price = firstVariant?.price ?? 0;
  const discountPrice = firstVariant?.discount_price ?? 0;
  const hasDiscount = discountPrice > 0 && discountPrice < price;
  const showPrice = hasDiscount ? discountPrice : price;

  const totalStock = product.product_variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0;

  const formatPrice = (p: number) => new Intl.NumberFormat("id-ID").format(p);

  return (
    <div className="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 flex flex-col bg-white dark:bg-zinc-900/50">
      {/* Image */}
      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center border border-zinc-100 dark:border-zinc-800/50">
        {product.image_url ? (
          <img
            loading="lazy"
            className="w-full h-full object-cover"
            src={product.image_url}
            alt={product.name}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove(
                "hidden",
              );
            }}
          />
        ) : null}
        <div className={`flex items-center justify-center text-zinc-400 dark:text-zinc-600 ${product.image_url ? "hidden" : ""}`}>
          <Package2 size={32} />
        </div>
      </div>

      {/* Info */}
      <div className="mt-2.5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold capitalize text-sm leading-snug text-zinc-900 dark:text-zinc-100 line-clamp-1">
            {product.name}
          </h3>
          {product.description ? (
            <p className="text-zinc-500 dark:text-zinc-400 lowercase text-xs line-clamp-2 mt-0.5 leading-normal">
              {product.description}
            </p>
          ) : (
            <p className="text-zinc-400 dark:text-zinc-600 text-xs italic mt-0.5">
              Tidak ada deskripsi
            </p>
          )}
        </div>
        
        <div className="mt-2 flex items-center">
          {totalStock > 0 ? (
            <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 rounded px-2 py-0.5 font-medium font-mono border border-zinc-200/50 dark:border-zinc-700/50">
              Stok: {totalStock}
            </span>
          ) : (
            <span className="text-[10px] bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded px-2 py-0.5 font-medium">
              Stok: Habis
            </span>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="mt-3 flex items-baseline gap-1 text-zinc-900 dark:text-zinc-100">
        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Rp</span>
        <span className="font-bold font-mono text-base tracking-tight">{formatPrice(showPrice)}</span>
        {hasDiscount && (
          <s className="text-xs text-zinc-400 dark:text-zinc-500 font-mono ml-1">{formatPrice(price)}</s>
        )}
        {variantCount > 1 && (
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 ml-auto bg-zinc-100 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded font-medium">
            +{variantCount - 1} opsi
          </span>
        )}
      </div>

      {/* Add to Cart */}
      {totalStock <= 0 ? (
        <button
          disabled
          className="flex items-center justify-center gap-2 mt-3 bg-zinc-100 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800/60 text-zinc-400 dark:text-zinc-600 px-2 py-2 w-full rounded-lg text-xs font-medium h-9 cursor-not-allowed"
        >
          <span>Stok Habis</span>
        </button>
      ) : (
        <button
          onClick={() => onAddClick(product)}
          className="flex items-center justify-center gap-2 mt-3 bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-700 dark:hover:bg-emerald-600 transition-all duration-200 px-2 py-2 w-full cursor-pointer text-white rounded-lg text-xs font-semibold h-9 shadow-sm active:scale-[0.98]"
        >
          <ShoppingCart size={14} />
          <span>Tambah</span>
        </button>
      )}
    </div>
  );
};

export default ProductCard;
