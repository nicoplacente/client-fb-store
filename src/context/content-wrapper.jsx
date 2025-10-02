"use client";
import useAppContext from "@/context/use-app-context";
import { SidebarContext } from "@/context/sidebar-context/sidebar-context";

export default function ContentWrapper({ children }) {
  const { isOpen } = useAppContext(SidebarContext);

  return (
    <main
      className={`transition-all duration-300 pt-20 ${
        isOpen ? "ml-72" : "ml-16"
      } p-6`}
    >
      {children}
    </main>
  );
}