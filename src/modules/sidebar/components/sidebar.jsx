"use client";
import { menuItems } from "@/modules/sidebar/libs/menu-items";
import { IconPin, IconPower } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import useAppContext from "@/context/use-app-context";
import { AuthContext } from "@/context/auth-context/auth-context";
import { SidebarContext } from "@/context/sidebar-context/sidebar-context";
import { hasDashboardAccess } from "@/modules/auth/libs/permissions";
import LinkSidebar from "../ui/link-sidebar";

export default function Sidebar() {
  const { expanded, setExpanded, setHovered, isOpen } =
    useAppContext(SidebarContext);
  const pathname = usePathname();
  const { user, logout } = useAppContext(AuthContext);

  return (
    <aside
      className={`fixed left-0 top-16 z-20 hidden h-[calc(100vh-4rem)] border-r border-neutral-800 bg-neutral-950 text-gray-100 transition-all duration-300 lg:block
        ${isOpen ? "lg:w-72" : "lg:w-20"}`}
      onMouseEnter={() => !expanded && setHovered(true)}
      onMouseLeave={() => !expanded && setHovered(false)}
    >
      <button
        className={`absolute -right-3 top-6 z-30 hidden h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 transition-all duration-300 hover:scale-110 hover:shadow-[inset_0px_1px_5px_#f005] lg:flex ${
          expanded ? "rotate-12" : "-rotate-45"
        } ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        aria-label={expanded ? "Desfijar sidebar" : "Fijar sidebar"}
        onClick={() => setExpanded(!expanded)}
      >
        <IconPin size={14} />
      </button>

      <div className="flex h-full flex-col p-2">
        <nav className="flex flex-1 flex-col items-stretch gap-2">
          {menuItems.map((item, idx) => {
            if (item.requiresAuth && !user) return null;
            if (item.requiresDashboardAccess && !hasDashboardAccess(user)) {
              return null;
            }

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
            className="shrink-0 cursor-pointer border-t border-gray-800 pt-2"
          >
            <div
              className={`flex items-center rounded-lg bg-red-800/50 transition-colors duration-300 hover:bg-red-800/70 ${
                isOpen ? "h-11 justify-start px-3" : "mx-auto size-11 justify-center p-0"
              }`}
            >
              <div className="flex size-6 items-center justify-center">
                <IconPower size={isOpen ? 18 : 20} />
              </div>
              <div
                className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                  isOpen ? "ml-3 max-w-44 opacity-100" : "ml-0 max-w-0 opacity-0"
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
