"use client";
import { envConfig } from "@/config";
import { createContext, useEffect, useState } from "react";
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`${envConfig.API_USER}`, {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error verificando sesión:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  const login = async () => {
    await refreshUser();
  };

  const logout = async () => {
    try {
      await fetch(`${envConfig.API_LOGOUT}`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Error en logout:", err);
    }
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await fetch(`${envConfig.API_USER}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
