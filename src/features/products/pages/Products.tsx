import { ListCheck, Package2, PackagePlus, PenBox, Trash2 } from "lucide-react";

const Products = () => {
  const menus = [
    {
      id: 1,
      menuImage:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxESeAnXYtnsOxOKeEi8fw-YultJNLmdUMSw&s",
      menuName: "Mie ayam",
      menuDescription: "Aneka Mie ayam solaja",
      menuDiscount: "10.000",
      menuPrice: "8.000",
      status: "tersedia",
    },
    {
      id: 2,
      menuImage:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxESeAnXYtnsOxOKeEi8fw-YultJNLmdUMSw&s",
      menuName: "Bakso",
      menuDescription: "Aneka Mie ayam solaja",
      menuDiscount: "10.000",
      menuPrice: "8.000",
      status: "tersedia",
    },
  ];

  return (
    <div className="overflow-x-auto px-4 md:px-8 mt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 mb-3 text-zinc-400">
          <Package2 />
          <span className="font-semibold">Data Products</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-zinc-600 cursor-pointer border border-zinc-200 p-1 hover:bg-zinc-100 transition duration-300 ease-in-out">
            <PackagePlus />
          </button>
          <input
            className="border border-zinc-100 px-4 py-1 focus:outline-0 text-zinc-400"
            type="text"
            placeholder="Cari products..."
          />
        </div>
      </div>
      <table className="w-full max-w-7xl mx-auto">
        <thead className="text-slate-900 text-left text-sm font-semibold border-b border-zinc-200 whitespace-nowrap">
          <tr>
            <th scope="col" className="px-3 py-3.5">
              Menu Image
            </th>
            <th scope="col" className="pl-0 px-3 py-3.5">
              Menu Name
            </th>
            <th scope="col" className="px-3 py-3.5">
              Menu Description
            </th>
            <th scope="col" className="px-3 py-3.5">
              Menu Discount
            </th>
            <th scope="col" className="pr-0 px-3 py-3.5">
              Menu Price
            </th>
            <th scope="col" className="pr-0 px-3 py-3.5">
              Status
            </th>
            <th scope="col" className="pr-0 px-3 py-3.5">
              Action
            </th>
          </tr>
        </thead>

        <tbody className="text-sm divide-y divide-slate-200">
          {menus.map((menu) => (
            <tr key={menu.id}>
              <td className="pl-0 px-3 py-2 font-medium text-slate-900 whitespace-nowrap">
                <img
                  className="w-10 aspect-square object-cover"
                  src={menu.menuImage}
                  alt=""
                />
              </td>
              <td className="px-3 py-2 text-slate-500">{menu.menuName}</td>
              <td className="px-3 py-2 text-slate-500">
                {menu.menuDescription}
              </td>
              <td className="px-3 py-2 text-slate-500">{menu.menuDiscount}</td>
              <td className="px-3 py-2 text-slate-500">{menu.menuPrice}</td>
              <td className="px-3 py-2 text-slate-500">{menu.status}</td>
              <td className="pr-0 px-3 py-2 flex gap-3">
                <button
                  type="button"
                  className="text-sm text-green-700 cursor-pointer hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded"
                >
                  <ListCheck />
                </button>
                <button
                  type="button"
                  className="text-sm text-blue-700 cursor-pointer hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                >
                  <PenBox />
                </button>
                <button
                  type="button"
                  className="text-sm text-red-700 cursor-pointer hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded"
                >
                  <Trash2 />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Products;
