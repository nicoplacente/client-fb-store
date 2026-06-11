"use client";

import { io } from "socket.io-client";
import { useEffect } from "react";
import { envConfig } from "@/config";
import { AuthContext } from "@/context/auth-context/auth-context";
import useAppContext from "@/context/use-app-context";
import SectionContainer from "@/modules/ui/section-container";

export default function StreamPage() {
  const { user } = useAppContext(AuthContext);
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return undefined;

    const socket = io(envConfig.SOCKET_URL, {
      query: { userId },
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  return (
    <SectionContainer className="space-y-6">
      <div className="rounded-lg border border-white/10 bg-neutral-950/75 p-5 sm:p-8">
        <p className="text-sm font-semibold uppercase text-red-300/80">
          Stream
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
          Watchtime activo
        </h1>
        <p className="mt-3 max-w-2xl text-neutral-400">
          Mantené esta página abierta mientras ves el directo para sincronizar
          tu actividad.
        </p>
      </div>
    </SectionContainer>
  );
}
