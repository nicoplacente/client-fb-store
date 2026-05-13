"use client";

import { useEffect, useRef, useState } from "react";
import { socket } from "@/modules/auth/libs/socket";
import { envConfig } from "@/config";

function getSyncedViewerId() {
  if (typeof window === "undefined") return null;

  return localStorage.getItem("kickBridgeViewerId");
}

function waitForKickBridgeViewerId(timeoutMs = 3000) {
  return new Promise((resolve) => {
    const existingViewerId = getSyncedViewerId();

    if (existingViewerId) {
      resolve(existingViewerId);
      return;
    }

    const timeout = setTimeout(() => {
      window.removeEventListener("kickBridgeViewerIdReady", handler);
      resolve(null);
    }, timeoutMs);

    function handler(event) {
      clearTimeout(timeout);
      window.removeEventListener("kickBridgeViewerIdReady", handler);
      resolve(event.detail?.viewerId || getSyncedViewerId());
    }

    window.addEventListener("kickBridgeViewerIdReady", handler);
  });
}

export default function useVerifyToken() {
  const [token, setToken] = useState("");
  const [error, setError] = useState(null);
  const hasRun = useRef(false);

  async function generateAndJoinToken() {
    try {
      setError(null);

      const viewerId = await waitForKickBridgeViewerId();

      if (!viewerId) {
        setError("No se encontró el viewerId de la extensión. Instalá o recargá la extensión.");
        return;
      }

      console.log("[VerifyToken] Usando viewerId:", viewerId);

      const res = await fetch(`${envConfig.API_REQUEST_TOKEN}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          viewerId,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Error generando token");
        return;
      }

      const newToken = data.token;

      setToken(newToken);

      socket.emit("join", newToken);
    } catch (err) {
      console.error("Error generando token:", err);
      setError("Error generando token");
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