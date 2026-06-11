"use client";

import { envConfig } from "@/config";
import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/modules/api/client";
import { toast } from "sonner";

export const AuthContext = createContext(null);

const kickAuthErrorMessages = {
  config: "Falta configurar OAuth de Kick",
  access_denied: "Kick denego la autorizacion de la aplicacion",
  session_expired: "La sesion de Kick expiro. Intenta iniciar sesion otra vez",
  state: "La validacion de seguridad de Kick fallo. Intenta iniciar sesion otra vez",
  scope: "Kick rechazo los permisos solicitados",
  redirect_uri: "La URL de retorno de Kick no coincide con la configurada",
  token_exchange: "Kick rechazo el codigo de autorizacion",
  kick_user: "Kick no devolvio los datos del usuario",
  unknown: "No se pudo iniciar sesion con Kick",
};

export function AuthProvider({ children, initialUser }) {
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(!initialUser);
  const linkedViewerIdRef = useRef(null);
  const router = useRouter();

  const linkExtensionViewer = useCallback(async (viewerId) => {
    const safeViewerId = String(viewerId || "").trim();

    if (!safeViewerId || linkedViewerIdRef.current === safeViewerId) {
      return;
    }

    try {
      await apiRequest(envConfig.API_LINK_EXTENSION_VIEWER, {
        method: "POST",
        body: {
          viewerId: safeViewerId,
        },
      });

      linkedViewerIdRef.current = safeViewerId;
    } catch {
      console.error("Error vinculando extension");
    }
  }, []);

  useEffect(() => {
    if (initialUser) {
      setLoading(false);
      return;
    }

    async function fetchUser() {
      try {
        const data = await apiRequest(envConfig.API_USER);
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [initialUser]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get("auth");
    const authReason = params.get("reason");
    const moderationStatus = params.get("moderation");

    if (!authStatus && !moderationStatus) return;

    if (authStatus === "kick_success") {
      toast.success("Sesion iniciada con Kick");
    }

    if (authStatus === "kick_error") {
      toast.error(
        kickAuthErrorMessages[authReason] ||
          kickAuthErrorMessages.unknown,
      );
    }

    if (moderationStatus === "success") {
      toast.success("Moderación de Kick habilitada");
    }

    if (moderationStatus === "error") {
      toast.error(
        authReason === "scope"
          ? "Kick no concedió el permiso de moderación"
          : "No se pudo habilitar la moderación de Kick",
      );
    }

    params.delete("auth");
    params.delete("moderation");
    params.delete("reason");

    const nextSearch = params.toString();
    const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}${window.location.hash}`;

    window.history.replaceState(null, "", nextUrl);
  }, []);

  useEffect(() => {
    if (!user) return;

    const storedViewerId = localStorage.getItem("kickBridgeViewerId");

    if (storedViewerId) {
      linkExtensionViewer(storedViewerId);
    }

    function handleViewerIdReady(event) {
      linkExtensionViewer(event.detail?.viewerId);
    }

    window.addEventListener("kickBridgeViewerIdReady", handleViewerIdReady);

    return () => {
      window.removeEventListener(
        "kickBridgeViewerIdReady",
        handleViewerIdReady,
      );
    };
  }, [linkExtensionViewer, user]);

  const login = async () => {
    await refreshUser();
  };

  const logout = async () => {
    try {
      await apiRequest(envConfig.API_LOGOUT, {
        method: "POST",
        skipRefresh: true,
      });
    } catch {
      console.error("Error en logout");
    } finally {
      setUser(null);
      router.replace("/");
    }
  };

  const refreshUser = async () => {
    try {
      const data = await apiRequest(envConfig.API_USER);
      setUser(data.user);
    } catch {
      console.error("Error refrescando usuario");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, login, logout, refreshUser, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}
