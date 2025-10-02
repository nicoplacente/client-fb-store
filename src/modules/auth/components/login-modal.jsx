"use client";

import { useEffect, useState } from "react";
import { FaRegCopy } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import { socket } from "../libs/socket";
import { envConfig } from "@/config";
import { useRef } from "react";
import { handleLogin } from "../hooks/login";
import { AuthContext } from "@/context/auth-context/auth-context";
import useAppContext from "@/context/use-app-context";

export default function LoginModal({ onClose }) {
  const [token, setToken] = useState("");
  const [copied, setCopied] = useState(false);

  const { setUsername } = useAppContext(AuthContext);

  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    generateAndJoinToken();
    const interval = setInterval(generateAndJoinToken, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    socket.on("verified", ({ username }) => {
      handleLogin(username, setUsername);
      onClose();
    });

    return () => {
      socket.off("verified");
    };
  }, [onClose]);

  async function generateAndJoinToken() {
    try {
      const res = await fetch(`${envConfig.SERVER_URL}/api/request-token`, {
        method: "POST",
      });

      const data = await res.json();
      const newToken = data.token;

      setToken(newToken);
      socket.emit("join", newToken);
    } catch (err) {
      console.error("Error generando token:", err);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(`!verify ${token}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-zinc-900 text-white p-6 rounded-xl shadow-lg w-full max-w-sm space-y-4 border border-zinc-700">
        <h2 className="text-lg font-semibold">Verificación Kick</h2>
        <p>
          Para completar el proceso debes ingresar al siguiente{" "}
          <a
            href={envConfig.CHAT_POPUOT}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 hover:underline"
          >
            canal de Kick
          </a>{" "}
          y enviar el texto de debajo en el chat.
        </p>
        <p className="text-yellow-400 text-sm">
          ⚠️ El código se renueva cada 3 minutos
        </p>

        <div className="relative bg-zinc-800 p-2 rounded-lg flex items-center justify-between">
          <code className="text-green-400 text-sm font-mono">
            !verify {token}
          </code>
          <button
            onClick={handleCopy}
            className="text-white hover:text-green-400 transition ml-2 cursor-pointer"
            title="Copiar comando"
          >
            <FaRegCopy />
          </button>
        </div>

        <a
          href={envConfig.CHAT_POPUOT}
          target="_blank"
          rel="noopener noreferrer nofollow"
          aria-label="Abrir chat de Kick"
          className="w-full bg-green-400 hover:bg-green-600 text-white font-medium py-2 rounded-md flex items-center justify-center gap-2 transition"
        >
          <FiExternalLink /> Abrir chat
        </a>

        <button
          onClick={onClose}
          aria-label="Cerrar modal de login"
          className="w-full py-2 bg-zinc-700 cursor-pointer hover:bg-zinc-500 text-white rounded-md transition"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
