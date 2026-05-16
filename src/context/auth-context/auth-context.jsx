"use client";

import { envConfig } from "@/config";
import { createContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/modules/api/client";
import { toast } from "sonner";

export const AuthContext = createContext(null);

export function AuthProvider({ children, initialUser }) {
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(!initialUser);
  const router = useRouter();

  useEffect(() => {
    if (initialUser) {
      setLoading(false);
      return;
    }

    async function fetchUser() {
      try {
        const data = await apiRequest(envConfig.API_USER);
        setUser(data.user);
      } catch (err) {
        console.error("Error verificando sesion:", err);
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

    if (!authStatus) return;

    if (authStatus === "kick_success") {
      toast.success("Sesion iniciada con Kick");
    }

    if (authStatus === "kick_error") {
      toast.error("No se pudo iniciar sesion con Kick");
    }

    params.delete("auth");
    params.delete("reason");

    const nextSearch = params.toString();
    const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}${window.location.hash}`;

    window.history.replaceState(null, "", nextUrl);
  }, []);

  const login = async () => {
    await refreshUser();
  };

  const logout = async () => {
    try {
      await apiRequest(envConfig.API_LOGOUT, {
        method: "POST",
        skipRefresh: true,
      });
    } catch (err) {
      console.error("Error en logout:", err);
    } finally {
      setUser(null);
      router.replace("/");
    }
  };

  const refreshUser = async () => {
    try {
      const data = await apiRequest(envConfig.API_USER);
      setUser(data.user);
    } catch (err) {
      console.error("Error refrescando usuario:", err);
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
