import { NavLink } from "react-router";

type Props = {
  to: string;
  label: string;
};

const MenuList = ({ to, label }: Props) => {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `relative block ${
          isActive
            ? "text-gray-900 font-medium"
            : "text-gray-600 hover:text-gray-900"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute -left-4 top-0 h-full w-[2px] bg-black rounded"></span>
          )}
          {label}
        </>
      )}
    </NavLink>
  );
};

export default MenuList;
