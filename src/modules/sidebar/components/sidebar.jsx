"use client";
import { menuItems } from "@/modules/sidebar/libs/menu-items";
import { IconPin, IconPower } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import useAppContext from "@/context/use-app-context";
import { AuthContext } from "@/context/auth-context/auth-context";
import { SidebarContext } from "@/context/sidebar-context/sidebar-context";
import LinkSidebar from "../ui/link-sidebar";

export default function Sidebar() {
  const { expanded, setExpanded, setHovered, isOpen } =
    useAppContext(SidebarContext);
  const pathname = usePathname();
  const { user, logout } = useAppContext(AuthContext);

  return (
    <aside
      className={`fixed left-0 top-16 bg-neutral-950 text-gray-100 transition-all duration-300 z-20
        ${isOpen ? "w-72" : "w-16"} h-[calc(100vh-4rem)]`}
      onMouseEnter={() => !expanded && setHovered(true)}
      onMouseLeave={() => !expanded && setHovered(false)}
    >
      <button
        className={`absolute transition-all duration-300 hover:scale-110 cursor-pointer hover:shadow-[inset_0px_1px_5px_#f005] -right-3 top-6 w-6 h-6 flex items-center justify-center bg-neutral-900 rounded-full border border-neutral-800 z-30 ${
          expanded ? "rotate-12" : "-rotate-45"
        }`}
        aria-label={expanded ? "Desfijar sidebar" : "Fijar sidebar"}
        onClick={() => setExpanded(!expanded)}
      >
        <IconPin size={16} />
      </button>

      <div className="flex flex-col h-full p-2">
        <nav className="flex-1 space-y-2">
          {menuItems.map((item, idx) => {
            const isActive = pathname === item.href;

            return (
              <LinkSidebar
                item={item}
                key={idx}
                isActive={isActive}
                idx={idx}
                isOpen={isOpen}
              />
            );
          })}
        </nav>

        {user && (
          <button
            aria-label="Cerrar sesión"
            onClick={logout}
            className="space-y-2 border-t border-gray-800 pt-2 cursor-pointer"
          >
            <div className="flex items-center px-3 py-2 rounded-md bg-red-800/50 hover:bg-red-800/70 transition-colors duration-300">
              <div className="w-6 flex items-center justify-center">
                <IconPower size={20} />
              </div>
              <div
                className={`whitespace-nowrap  transition-all duration-300 ${
                  isOpen ? "opacity-100 ml-3" : "opacity-0 -ml-10"
                }`}
              >
                Cerrar sesión
              </div>
            </div>
          </button>
        )}
      </div>
    </aside>
  );
}
