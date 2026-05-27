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

  const formatPrice = (p: number) => new Intl.NumberFormat("id-ID").format(p);

  return (
    <div className="w-full border border-zinc-100 rounded-xl p-2 hover:border-zinc-300 hover:shadow-sm transition duration-200 flex flex-col">
      {/* Image */}
      {product.image_url ? (
        <img
          loading="lazy"
          className="w-full aspect-square object-cover rounded-lg"
          src={product.image_url}
          alt={product.name}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
            (e.target as HTMLImageElement).nextElementSibling?.classList.remove(
              "hidden",
            );
          }}
        />
      ) : (
        <div className="w-full aspect-square rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-300">
          <Package2 size={32} />
        </div>
      )}

      {/* Info */}
      <div className="mt-2 flex-1">
        <h3 className="font-semibold capitalize text-sm leading-tight">
          {product.name}
        </h3>
        {product.description && (
          <span className="text-zinc-400 lowercase text-xs line-clamp-2">
            {product.description}
          </span>
        )}
      </div>

      {/* Price */}
      <div className="mt-2 flex items-center gap-1.5 text-sm">
        <span className="text-zinc-500">Rp</span>
        {hasDiscount && (
          <s className="text-xs text-zinc-400">{formatPrice(price)}</s>
        )}
        <span className="font-semibold">{formatPrice(showPrice)}</span>
        {variantCount > 1 && (
          <span className="text-xs text-zinc-400 ml-auto">
            +{variantCount - 1} lainnya
          </span>
        )}
      </div>

      {/* Add to Cart */}
      <button
        onClick={() => onAddClick(product)}
        className="flex items-center justify-center gap-2 mt-2 bg-green-600 hover:bg-green-500 transition
         duration-300 ease-in-out px-2 py-2 w-full cursor-pointer text-white rounded-lg text-sm"
      >
        <ShoppingCart size={16} />
        <span>Tambah</span>
      </button>
    </div>
  );
};

export default ProductCard;
