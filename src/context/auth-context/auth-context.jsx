"use client";
import { envConfig } from "@/config";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children, initialUser }) {
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(!initialUser);

  useEffect(() => {
    if (initialUser) {
      setLoading(false);
      return;
    }

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
  }, [initialUser]);

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
    } catch (err) {
      console.error("Error refrescando usuario:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
