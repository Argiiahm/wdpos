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
        `relative block transition-colors duration-150 ${
          isActive
            ? "text-slate-900 dark:text-zinc-100 font-semibold"
            : "text-slate-500 dark:text-zinc-500 hover:text-slate-950 dark:hover:text-zinc-200"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute -left-4 top-0 h-full w-[2px] bg-slate-900 dark:bg-zinc-100 rounded"></span>
          )}
          {label}
        </>
      )}
    </NavLink>
  );
};

export default MenuList;
