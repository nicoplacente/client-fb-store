"use client";
import { IconBrandKick } from "@tabler/icons-react";

export default function HandleShowLogin({ setShowLogin }) {
  return (
    <button
      onClick={() => setShowLogin(true)}
      aria-label="Abrir modal de login"
      className="flex items-center font-mono gap-2 px-6 py-1.5 ml-auto rounded-lg border cursor-pointer text-green-500 bg-gradient-to-br from-green-900/50 to-green-500/30 border-green-500 hover:translate-y-0.5 transition-all duration-300 shadow-[4px_4px_10px_rgba(0,0,0,0.4)] saturate-150 hover:saturate-200"
    >
      <IconBrandKick size={20} />
      Iniciar sesión
    </button>
  );
}
