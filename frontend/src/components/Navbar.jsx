import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm border-b border-black/10 z-10">
      <ul className="flex space-x-4 px-6 py-3">
        <NavLink
          to="/menu"
          className={({ isActive }) =>
            "px-3 py-2 text-black/80 hover:text-[#FF0000] " +
            (isActive
              ? "border-b-2 border-[#FF0000]"
              : "border-b-2 border-transparent")
          }
        >
          Menu Management
        </NavLink>
        <NavLink
          to="/inventory"
          className={({ isActive }) =>
            "px-3 py-2 text-black/80 hover:text-[#FF0000] " +
            (isActive
              ? "border-b-2 border-[#FF0000]"
              : "border-b-2 border-transparent")
          }
        >
          Inventory Management
        </NavLink>
        {/* Add other links */}
      </ul>
    </nav>
  );
}

export default Navbar;
