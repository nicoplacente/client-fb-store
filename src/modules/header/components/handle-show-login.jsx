"use client";

import { useState } from "react";
import { IconBrandKick } from "@tabler/icons-react";
import { envConfig } from "@/config";

export default function HandleShowLogin({ variant = "default" }) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  function handleKickLogin() {
    setIsRedirecting(true);

    const returnTo = `${window.location.pathname}${window.location.search}`;
    const loginUrl = new URL(envConfig.API_KICK_AUTH);
    loginUrl.searchParams.set("frontendOrigin", window.location.origin);
    loginUrl.searchParams.set("returnTo", returnTo);

    window.location.href = loginUrl.toString();
  }

  const isCompact = variant === "compact";

  return (
    <button
      onClick={handleKickLogin}
      disabled={isRedirecting}
      aria-label="Iniciar sesion con Kick"
      className={
        isCompact
          ? "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-green-500 bg-gradient-to-br from-green-900/50 to-green-500/30 px-4 py-1.5 font-mono text-sm text-green-500 shadow-[4px_4px_10px_rgba(0,0,0,0.4)] saturate-150 transition-all duration-300 hover:translate-y-0.5 hover:saturate-200 disabled:cursor-wait disabled:opacity-70"
          : "flex cursor-pointer items-center gap-2 rounded-lg border border-green-500 bg-gradient-to-br from-green-900/50 to-green-500/30 px-3 py-1.5 font-mono text-sm text-green-500 shadow-[4px_4px_10px_rgba(0,0,0,0.4)] saturate-150 transition-all duration-300 hover:translate-y-0.5 hover:saturate-200 disabled:cursor-wait disabled:opacity-70 sm:px-6 sm:text-base"
      }
    >
      <IconBrandKick size={isCompact ? 20 : 20} />
      <span>{isRedirecting ? "Redirigiendo..." : "Iniciar sesion"}</span>
    </button>
  );
}
