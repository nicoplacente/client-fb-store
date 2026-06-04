"use client";
import { legalMenuItems, menuItems } from "@/modules/sidebar/libs/menu-items";
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
      className={`fixed left-0 top-16 z-20 hidden h-[calc(100vh-4rem)] border-r border-white/10 bg-neutral-950/95 text-gray-100 shadow-2xl shadow-black/20 backdrop-blur transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:block
        ${isOpen ? "lg:w-72" : "lg:w-20"}`}
      onMouseEnter={() => !expanded && setHovered(true)}
      onMouseLeave={() => !expanded && setHovered(false)}
    >
      <button
        className={`absolute -right-3 top-6 z-30 hidden size-6 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-neutral-900 text-neutral-300 shadow-lg shadow-black/30 transition-[opacity,transform,background,color] duration-300 ease-out hover:scale-110 hover:bg-red-500/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-300/40 lg:flex ${
          expanded ? "rotate-12 text-red-100" : "-rotate-45"
        } ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        aria-label={expanded ? "Desfijar sidebar" : "Fijar sidebar"}
        onClick={() => setExpanded(!expanded)}
      >
        <IconPin size={14} />
      </button>

      <div className="flex h-full flex-col p-3">
        <nav className="flex flex-1 flex-col items-stretch gap-1.5" aria-label="Navegacion principal">
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

        <div className="mt-3 border-t border-white/10 pt-3">
          <div
            className={`mb-2 overflow-hidden whitespace-nowrap px-3 text-[10px] font-black uppercase text-neutral-600 transition-[max-height,opacity] duration-300 ${
              isOpen ? "max-h-5 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            Legal
          </div>
          <nav className="grid gap-1.5" aria-label="Enlaces legales">
            {legalMenuItems.map((item) => (
              <LinkSidebar
                key={item.href}
                item={item}
                isActive={pathname === item.href}
                isOpen={isOpen}
                compact
              />
            ))}
          </nav>
        </div>

        {user && (
          <button
            aria-label="Cerrar sesión"
            onClick={logout}
            className="mt-3 shrink-0 cursor-pointer border-t border-white/10 pt-3"
          >
            <div
              className={`flex items-center rounded-lg border border-red-400/15 bg-red-500/10 text-red-100 transition-[background,border-color,color] duration-200 hover:border-red-300/35 hover:bg-red-500/16 ${
                isOpen ? "h-11 justify-start px-3" : "h-11 w-full justify-center p-0"
              }`}
            >
              <div className="flex size-7 items-center justify-center rounded-md bg-red-400/10">
                <IconPower size={isOpen ? 18 : 20} />
              </div>
              <div
                className={`overflow-hidden whitespace-nowrap text-sm font-bold transition-[max-width,opacity,transform,margin] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isOpen
                    ? "ml-3 max-w-44 translate-x-0 opacity-100"
                    : "ml-0 max-w-0 -translate-x-2 opacity-0"
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
