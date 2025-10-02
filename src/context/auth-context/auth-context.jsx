"use client";
import { createContext,  useEffect, useState } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("kickUsername");
    if (storedUser) setUsername(storedUser);
  }, []);

  return (
    <AuthContext.Provider value={{ username, setUsername }}>
      {children}
    </AuthContext.Provider>
  );
}

