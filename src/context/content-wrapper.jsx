"use client";
import useAppContext from "@/context/use-app-context";
import { SidebarContext } from "@/context/sidebar-context/sidebar-context";

export default function ContentWrapper({ children }) {
  const { isOpen } = useAppContext(SidebarContext);

  return (
    <div
      className={`flex min-h-screen flex-col transition-[margin] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isOpen ? "lg:ml-72" : "lg:ml-20"
      }`}
    >
      <main className="flex-1 px-4 pb-8 pt-20 sm:px-6">{children}</main>
    </div>
  );
}
