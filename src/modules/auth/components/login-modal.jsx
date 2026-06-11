"use client";

import { useEffect, useId, useRef } from "react";
import {
  IconCheck,
  IconCopy,
  IconExternalLink,
  IconX,
} from "@tabler/icons-react";
import { envConfig } from "@/config";
import useVerifyToken from "../hooks/use-verify-token";
import useVerifyListener from "../hooks/use-verify-listener";
import Loader from "@/modules/ui/loader";
import useCopy from "@/modules/hooks/use-copy";

export default function LoginModal({ onClose }) {
  const { token, error } = useVerifyToken();
  const { copied, copy } = useCopy();
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);

  useVerifyListener(onClose);

  useEffect(() => {
    const previouslyFocusedElement = document.activeElement;

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();

      if (event.key === "Tab") {
        const focusableElements = dialogRef.current?.querySelectorAll(
          'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        );
        const firstElement = focusableElements?.[0];
        const lastElement = focusableElements?.[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    }

    closeButtonRef.current?.focus();
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedElement?.focus?.();
    };
  }, [onClose]);

  function handleCopy() {
    if (!token) return;
    copy(`!verify ${token}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="w-full max-w-md rounded-lg border border-zinc-700 bg-zinc-950 p-6 text-white shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-xl font-semibold">Verificación Kick</h2>
            <p id={descriptionId} className="mt-2 text-sm text-zinc-400">
              Entra al chat y envía el comando para vincular tu cuenta.
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal de login"
            className="rounded-md border border-white/10 p-2 text-zinc-400 transition hover:text-white"
          >
            <IconX size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm leading-6 text-zinc-300">
            Para completar el proceso debes ingresar al siguiente{" "}
            <a
              href={envConfig.CHAT_POPUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:underline"
            >
              canal de Kick
            </a>{" "}
            y enviar el texto de debajo en el chat.
          </p>

          <p className="rounded-md border border-yellow-400/20 bg-yellow-400/10 px-3 py-2 text-sm text-yellow-200">
            El código se renueva cada 3 minutos.
          </p>

          {error ? (
            <p className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
              {error}
            </p>
          ) : (
            <div className="relative flex items-center justify-between rounded-lg border border-white/10 bg-zinc-900 p-3">
              {token ? (
                <code className="break-all font-mono text-sm text-green-400">
                  !verify {token}
                </code>
              ) : (
                <span className="text-sm italic text-gray-400">
                  Generando código...
                </span>
              )}

              {token ? (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="ml-2 cursor-pointer text-white transition hover:text-green-400"
                  title="Copiar comando"
                  aria-label="Copiar comando"
                >
                  {copied ? <IconCheck /> : <IconCopy />}
                </button>
              ) : (
                <Loader />
              )}
            </div>
          )}

          <a
            href={envConfig.CHAT_POPUP_URL}
            target="_blank"
            rel="noopener noreferrer nofollow"
            aria-label="Abrir chat de Kick"
            className="flex w-full items-center justify-center gap-2 rounded-md bg-green-600 py-2.5 font-semibold text-white transition hover:bg-green-500"
          >
            <IconExternalLink size={18} /> Abrir chat
          </a>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cancelar login"
            className="w-full cursor-pointer rounded-md bg-zinc-800 py-2.5 text-white transition hover:bg-zinc-700"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
