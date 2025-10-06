"use client";
import { useEffect, useRef, useState } from "react";
import { socket } from "@/modules/auth/libs/socket";
import { envConfig } from "@/config";

export default function useVerifyToken() {
  const [token, setToken] = useState("");
  const [error, setError] = useState(null);
  const hasRun = useRef(false);

  async function generateAndJoinToken() {
    try {
      const res = await fetch(`${envConfig.API_REQUEST_TOKEN}`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      const newToken = data.token;
      setToken(newToken);

      socket.emit("join", newToken);
    } catch (err) {
      console.error("Error generando token:", err);
    }
  }

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    generateAndJoinToken();
    const interval = setInterval(generateAndJoinToken, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { token, error };
}
