"use client";
import { useEffect } from "react";
import { socket } from "@/modules/auth/libs/socket";
import useAppContext from "@/context/use-app-context";
import { AuthContext } from "@/context/auth-context/auth-context";
import { envConfig } from "@/config";

export default function useVerifyListener(onClose) {
  const { setUser } = useAppContext(AuthContext);

  useEffect(() => {
    const handler = async ({ token }) => {
      try {
        const res = await fetch(envConfig.API_COMPLETE_VERIFY, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          console.error("Error en complete-verify", await res.json());
          return;
        }

        // 🔥 importante: refrescar user
        const userRes = await fetch(envConfig.API_USER, {
          credentials: "include",
        });

        if (userRes.ok) {
          const data = await userRes.json();
          setUser(data.user); // guarda en AuthContext
        }

        if (onClose) onClose();
      } catch (err) {
        console.error("Error en complete-verify:", err);
      }
    };

    socket.on("verified", handler);
    return () => {
      socket.off("verified", handler);
    };
  }, [onClose, setUser]);
}
