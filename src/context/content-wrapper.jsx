"use client";
import useAppContext from "@/context/use-app-context";
import { SidebarContext } from "@/context/sidebar-context/sidebar-context";
import Link from "next/link";

export default function ContentWrapper({ children }) {
  const { isOpen } = useAppContext(SidebarContext);

  return (
    <div
      className={`flex min-h-screen flex-col transition-[margin] duration-300 ${
        isOpen ? "lg:ml-72" : "lg:ml-20"
      }`}
    >
      <main className="flex-1 px-4 pb-8 pt-20 sm:px-6">{children}</main>
      <footer className="border-t border-white/10 bg-black/55 px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-xs font-semibold text-neutral-500 sm:flex-row">
          <p>FrancoBertello74 Store &copy; 2026</p>
          <nav
            aria-label="Enlaces legales"
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
          >
            <Link
              href="/terms"
              className="transition hover:text-red-200 focus:outline-none focus:ring-2 focus:ring-red-300/40"
            >
              Terminos y condiciones
            </Link>
            <Link
              href="/privacy"
              className="transition hover:text-red-200 focus:outline-none focus:ring-2 focus:ring-red-300/40"
            >
              Politica de privacidad
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
