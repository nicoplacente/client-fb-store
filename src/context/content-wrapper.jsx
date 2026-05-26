"use client";
import useAppContext from "@/context/use-app-context";
import { SidebarContext } from "@/context/sidebar-context/sidebar-context";

export default function ContentWrapper({ children }) {
  const { isOpen } = useAppContext(SidebarContext);

  return (
    <main
      className={`min-h-screen px-4 pb-8 pt-20 transition-[margin] duration-300 sm:px-6 ${
        isOpen ? "lg:ml-72" : "lg:ml-20"
      }`}
    >
      {children}
    </main>
  );
}
