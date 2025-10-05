"use client";

import { FaRegCopy } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import { envConfig } from "@/config";
import useVerifyToken from "../hooks/use-verify-token";
import useVerifyListener from "../hooks/use-verify-listener";
import Loader from "@/modules/ui/loader";
import useCopy from "@/modules/hooks/use-copy";
import { IconCheck } from "@tabler/icons-react";

export default function LoginModal({ onClose }) {
  const { token, error } = useVerifyToken();
  useVerifyListener(onClose);

  const { copied, copy } = useCopy();

  const handleCopy = () => {
    if (!token) return;
    copy(`!verify ${token}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md bg-opacity-70 flex items-center justify-center z-50">
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

        {error ? (
          <p className="text-red-400 text-sm">{error}</p>
        ) : (
          <div className="relative bg-zinc-800 p-2 rounded-lg flex items-center justify-between">
            {token ? (
              <code className="text-green-400 text-sm font-mono">
                !verify {token}
              </code>
            ) : (
              <span className="text-gray-400 text-sm italic">
                Generando código...
              </span>
            )}

            {token ? (
              <button
                onClick={handleCopy}
                className="text-white hover:text-green-400 transition ml-2 cursor-pointer"
                title="Copiar comando"
              >
                {copied ? <IconCheck /> : <FaRegCopy />}
              </button>
            ) : (
              <Loader />
            )}
          </div>
        )}

        <a
          href={envConfig.CHAT_POPUOT}
          target="_blank"
          rel="noopener noreferrer nofollow"
          aria-label="Abrir chat de Kick"
          className="w-full bg-green-600 hover:bg-green-500 text-white font-medium py-2 rounded-md flex items-center justify-center gap-2 transition"
        >
          <FiExternalLink /> Abrir chat
        </a>

        <button
          onClick={onClose}
          aria-label="Cerrar modal de login"
          className="w-full py-2 bg-zinc-700 cursor-pointer hover:bg-zinc-600 text-white rounded-md transition"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
