"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { socket } from "@/modules/auth/libs/socket";
import useAppContext from "@/context/use-app-context";
import { AuthContext } from "@/context/auth-context/auth-context";
import { envConfig } from "@/config";
import { apiRequest } from "@/modules/api/client";

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
          toast.error("No se pudo completar la verificacion");
          return;
        }

        const data = await apiRequest(envConfig.API_USER);
        setUser(data.user);

        toast.success("Sesion iniciada");
        if (onClose) onClose();
      } catch (err) {
        console.error("Error en complete-verify:", err);
        toast.error("No se pudo iniciar sesion");
      }
    };

    socket.on("verified", handler);
    return () => {
      socket.off("verified", handler);
    };
  }, [onClose, setUser]);
}
