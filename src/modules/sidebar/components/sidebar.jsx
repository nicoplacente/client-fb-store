"use client";
import { menuItems } from "@/modules/sidebar/libs/menu-items";
import { IconLogout, IconPin } from "@tabler/icons-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Header from "../../header/components/header";
import Link from "next/link";
import { handleLogout } from "@/modules/auth/hooks/logout";
import useUsername from "@/modules/auth/hooks/use-username";

export default function Sidebar({ children }) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const pathname = usePathname();
  const { username, setUsername } = useUsername();

  const isOpen = expanded || hovered;

  return (
    <aside
      className={`fixed left-0 top-16 bg-neutral-950 text-gray-100 transition-all duration-300 z-20
        ${isOpen ? "w-72" : "w-16"} h-[calc(100vh-4rem)]`}
      onMouseEnter={() => !expanded && setHovered(true)}
      onMouseLeave={() => !expanded && setHovered(false)}
    >
      <button
        className={`absolute transition-all duration-300 hover:scale-110 hover:shadow-[inset_0px_1px_5px_#f005] -right-3 top-6 w-6 h-6 flex items-center justify-center bg-neutral-900 rounded-full border border-neutral-800 z-30 ${
          expanded ? "rotate-12" : "-rotate-45"
        }`}
        aria-label={expanded ? "Cerrar sidebar" : "Abrir sidebar"}
        onClick={() => setExpanded(!expanded)}
      >
        <IconPin size={16} />
      </button>

      <div className="flex flex-col h-full p-2">
        <nav className="flex-1 space-y-2">
          {menuItems.map((item, idx) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={idx}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md transition-colors
                    ${
                      isActive
                        ? "bg-gradient-to-br from-neutral-800 via-neutral-900 to-primary text-white"
                        : "hover:bg-neutral-900"
                    }`}
              >
                <div className="w-6 flex items-center justify-center">
                  {item.icon}
                </div>
                <span
                  className={`whitespace-nowrap transition-all duration-300 ${
                    isOpen ? "opacity-100 ml-3" : "opacity-0 -ml-10"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {username && (
          <button
            aria-label="Cerrar sesión"
            onClick={() => handleLogout(setUsername)}
            className="space-y-2 border-t border-gray-800 pt-2 cursor-pointer"
          >
            <div className="flex items-center px-3 py-2 rounded-md bg-red-800/50 hover:bg-red-800/70 transition-colors duration-300">
              <div className="w-6 flex items-center justify-center">
                <IconLogout size={20} />
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
