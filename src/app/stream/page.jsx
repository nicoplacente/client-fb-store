"use client";

import { io } from "socket.io-client";
import { envConfig } from "@/config";
import { useEffect } from "react";
import SectionContainer from "@/modules/ui/section-container";

export default function useWatchtime(userId) {
  useEffect(() => {
    const socket = io(envConfig.SERVER_URL, {
      query: { userId },
    });

    socket.on("connect", () => {
      console.log("✅ Watchtime conectado", userId);
    });

    socket.on("disconnect", () => {
      console.log("❌ Watchtime desconectado");
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);
  return (
    <SectionContainer>
      <h1>Hola</h1>
    </SectionContainer>
  );
}
