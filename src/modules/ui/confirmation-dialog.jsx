"use client";

import { useEffect, useId } from "react";
import { IconAlertTriangle, IconCheck, IconX } from "@tabler/icons-react";

export default function ConfirmationDialog({
  open = false,
  variant = "warning",
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  confirmDisabled = false,
  children,
  onConfirm = () => {},
  onCancel = () => {},
}) {
  const titleId = useId();
  const descriptionId = useId();
  const isDanger = variant === "danger";
  const iconClassName = isDanger
    ? "border-red-300/25 bg-red-500/10 text-red-100"
    : "border-amber-300/25 bg-amber-300/10 text-amber-200";
  const focusClassName = isDanger
    ? "focus:ring-red-300/40"
    : "focus:ring-amber-300/40";
  const confirmClassName = isDanger
    ? "border border-red-300/40 bg-red-500 text-white shadow-[0_14px_36px_rgba(239,68,68,0.16)] hover:border-red-300/25 hover:bg-red-950/35 hover:text-red-100 focus:ring-red-200/70"
    : "border border-amber-200/55 bg-amber-300/12 text-white shadow-[0_14px_36px_rgba(251,191,36,0.12)] hover:border-amber-200/30 hover:bg-black/35 hover:text-amber-100 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] focus:ring-amber-200/70";

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
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
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 shadow-2xl shadow-black/70 [contain:layout_paint]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 bg-white/[0.03] p-5 sm:p-6">
          <div className="space-y-3">
            <div className={`inline-flex size-11 items-center justify-center rounded-xl border ${iconClassName}`}>
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
            className={`rounded-md border border-white/10 bg-neutral-950/70 p-2 text-neutral-400 transition hover:border-white/20 hover:text-white focus:outline-none focus:ring-2 ${focusClassName}`}
            aria-label="Cerrar confirmacion"
          >
            <IconX size={18} />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {children ? (
            <div className="rounded-xl border border-white/10 bg-neutral-900/80 p-4">
              {children}
            </div>
          ) : null}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex cursor-pointer items-center justify-center rounded-md border border-white/10 bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-neutral-200 transition hover:border-white/20 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={confirmDisabled}
              className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-black transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${confirmClassName}`}
            >
              <IconCheck size={18} />
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
