import { ListFilter } from "lucide-react";
import OrderLists from "../components/OrderLists";
import ProductCard from "../components/ProductCard";

const MenuPage = () => {
  return (
    <section className="">
      {/* header */}
      <div className="container max-w-3xl my-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-zinc-400">
          <ListFilter />
          <button className="border border-zinc-100 px-2 py-1 rounded-md hover:bg-zinc-100 cursor-pointer">
            Makanan
          </button>
          <button className="border border-zinc-100 px-2 py-1 rounded-md hover:bg-zinc-100 cursor-pointer">
            Minuman
          </button>
          <button className="border border-zinc-100 px-2 py-1 rounded-md hover:bg-zinc-100 cursor-pointer">
            Cemilan
          </button>
        </div>
        <input
          className="border border-zinc-100 px-2 py-2 w-full max-w-80 focus:outline-0 text-zinc-400"
          type="text"
          placeholder="Cari menu..."
        />
      </div>

      {/* Menus */}
      <div className="grid flex-1 grid-cols-4 gap-2 pr-80">
        <ProductCard
          menuImage="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxESeAnXYtnsOxOKeEi8fw-YultJNLmdUMSw&s"
          menuName="Mie ayam"
          menuDescription="aneka mie ayam raos"
          menuPrice="10.000"
        />
        <ProductCard
          menuImage="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxESeAnXYtnsOxOKeEi8fw-YultJNLmdUMSw&s"
          menuName="Bakso"
          menuDescription="aneka mie ayam raos"
          menuDiscount="18.000"
          menuPrice="10.000"
        />
        <ProductCard
          menuImage="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxESeAnXYtnsOxOKeEi8fw-YultJNLmdUMSw&s"
          menuName="Bakso"
          menuDescription="aneka mie ayam raos"
          menuDiscount="18.000"
          menuPrice="10.000"
        />
        <ProductCard
          menuImage="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxESeAnXYtnsOxOKeEi8fw-YultJNLmdUMSw&s"
          menuName="Bakso"
          menuDescription="aneka mie ayam raos"
          menuDiscount="18.000"
          menuPrice="10.000"
        />
        <ProductCard
          menuImage="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxESeAnXYtnsOxOKeEi8fw-YultJNLmdUMSw&s"
          menuName="Bakso"
          menuDescription="aneka mie ayam raos"
          menuDiscount="18.000"
          menuPrice="10.000"
        />
        <ProductCard
          menuImage="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxESeAnXYtnsOxOKeEi8fw-YultJNLmdUMSw&s"
          menuName="Bakso"
          menuDescription="aneka mie ayam raos"
          menuDiscount="18.000"
          menuPrice="10.000"
        />
        <ProductCard
          menuImage="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxESeAnXYtnsOxOKeEi8fw-YultJNLmdUMSw&s"
          menuName="Bakso"
          menuDescription="aneka mie ayam raos"
          menuDiscount="18.000"
          menuPrice="10.000"
        />
      </div>
      <div className="fixed right-0 top-0 h-screen w-80 bg-white">
        <OrderLists />
      </div>
    </section>
  );
};

export default MenuPage;
