"use client";

import { useEffect, useId } from "react";
import { IconAlertTriangle, IconCheck, IconX } from "@tabler/icons-react";

export default function ConfirmationDialog({
  open = false,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  children,
  onConfirm = () => {},
  onCancel = () => {},
}) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-neutral-950 p-6 shadow-2xl shadow-black/60"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="inline-flex size-11 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10 text-amber-200">
              <IconAlertTriangle size={22} />
            </div>
            <div className="space-y-2">
              <h2 id={titleId} className="text-xl font-bold text-white">
                {title}
              </h2>
              {description ? (
                <p
                  id={descriptionId}
                  className="max-w-md text-sm leading-6 text-neutral-400"
                >
                  {description}
                </p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-white/10 p-2 text-neutral-400 transition hover:text-white"
            aria-label="Cerrar confirmación"
          >
            <IconX size={18} />
          </button>
        </div>

        {children ? (
          <div className="mt-5 rounded-xl border border-white/10 bg-neutral-900/80 p-4">
            {children}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-md border border-white/10 bg-transparent px-4 py-2.5 text-sm font-semibold text-neutral-200 transition hover:border-white/20 hover:bg-white/5"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-500 px-4 py-2.5 text-sm font-bold text-neutral-950 transition hover:bg-amber-400"
          >
            <IconCheck size={18} />
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
