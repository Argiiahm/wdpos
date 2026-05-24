import { ShoppingCart } from "lucide-react";

type Menus = {
  menuImage: string;
  menuName: string;
  menuDescription?: string;
  menuDiscount?: string;
  menuPrice: string;
};

const ProductCard = ({
  menuImage,
  menuName,
  menuDescription,
  menuDiscount,
  menuPrice,
}: Menus) => {
  return (
    <div className="w-full max-w-48 border border-zinc-100 p-2 hover:border-zinc-200">
      <img
        loading="lazy"
        className="w-full aspect-square object-cover rounded-md"
        src={menuImage}
        alt="menu product"
      />
      <div className="mt-2">
        <h1 className="font-semibold capitalize">{menuName}</h1>
        <span className="text-zinc-400 lowercase text-[14px]">
          {menuDescription}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-1">
        <span>Rp. </span>
        <s className="text-[12px] text-zinc-400">{menuDiscount}</s>
        <span className="font-semibold">{menuPrice}</span>
      </div>
      <button
        className="flex items-center justify-center gap-2 mt-2 bg-green-600 hover:bg-green-500 transition
       duration-300 ease-in-out px-2 py-2 w-full cursor-pointer text-white"
      >
        <ShoppingCart />
        <span>Tambah</span>
      </button>
    </div>
  );
};

export default ProductCard;
