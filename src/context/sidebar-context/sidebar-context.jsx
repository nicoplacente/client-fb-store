"use client";
import { createContext, useState } from "react";

export const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const isOpen = expanded || hovered;

  return (
    <SidebarContext.Provider value={{ expanded, setExpanded, hovered, setHovered, isOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}
