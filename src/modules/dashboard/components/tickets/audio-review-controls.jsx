import { useEffect, useState } from "react";
import {
  IconAlertCircle,
  IconCircleCheck,
  IconClock,
  IconHeadphones,
  IconMicrophone,
  IconPlayerPlay,
  IconX,
} from "@tabler/icons-react";
import { getRedemptionAudioBlob } from "@/modules/products/libs/product-api";
import { getErrorMessage } from "@/modules/api/error-message";

export default function AudioReviewControls({
  redemption,
  isPending,
  onApprove,
  onReject,
}) {
  const [audioUrl, setAudioUrl] = useState("");
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const status = redemption?.audioStatus || "not_applicable";
  const isReviewable = status === "pending_review";

  useEffect(
    () => () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    },
    [audioUrl],
  );

  async function loadAudio() {
    if (!redemption?.id || loadingAudio || audioUrl) return;

    try {
      setLoadingAudio(true);
      setAudioError("");
      const blob = await getRedemptionAudioBlob(redemption.id);
      setAudioUrl(URL.createObjectURL(blob));
    } catch (error) {
      setAudioError(
        getErrorMessage(error, "No se pudo cargar el audio para revisión."),
      );
    } finally {
      setLoadingAudio(false);
    }
  }

  function rejectAudio() {
    const reason = rejectionReason.trim();

    if (!reason) {
      setAudioError("Escribí el motivo del rechazo.");
      return;
    }

    setAudioError("");
    onReject(redemption, reason);
  }

  const statusCopy = getAudioReviewStatus(status);

  return (
    <section className="mt-4 rounded-2xl border border-sky-300/20 bg-sky-400/[0.06] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-black text-sky-100">
            <IconMicrophone size={18} />
            Canje de audio
          </p>
          <p className="mt-1 text-sm leading-6 text-neutral-400">
            {statusCopy.description}
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-black ${statusCopy.className}`}
        >
          {statusCopy.label}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-neutral-400">
        <span className="rounded-lg border border-white/10 bg-neutral-950/70 px-2.5 py-1.5">
          Intentos: {redemption.audioAttemptsUsed || 0} de 2
        </span>
        {redemption.audioSubmission?.durationSeconds ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-neutral-950/70 px-2.5 py-1.5">
            <IconClock size={14} />
            {redemption.audioSubmission.durationSeconds.toFixed(1)} s
          </span>
        ) : null}
      </div>

      {redemption.audioRejectionReason ? (
        <p className="mt-3 rounded-xl border border-red-300/20 bg-red-500/10 p-3 text-sm leading-6 text-red-100">
          <strong>Motivo:</strong> {redemption.audioRejectionReason}
        </p>
      ) : null}

      {isReviewable ? (
        <div className="mt-4 grid gap-3">
          {audioUrl ? (
            <audio
              controls
              preload="metadata"
              src={audioUrl}
              className="w-full"
            >
              Tu navegador no puede reproducir este audio.
            </audio>
          ) : (
            <button
              type="button"
              onClick={loadAudio}
              disabled={loadingAudio}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-sky-300/30 bg-sky-400/10 px-4 text-sm font-black text-sky-100 transition hover:bg-sky-400/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingAudio ? (
                <IconHeadphones size={18} />
              ) : (
                <IconPlayerPlay size={18} />
              )}
              {loadingAudio ? "Cargando audio..." : "Cargar y escuchar"}
            </button>
          )}

          <label className="grid gap-2 text-sm font-bold text-neutral-300">
            Motivo del rechazo
            <textarea
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Explicá qué debe corregir el usuario."
              className="resize-none rounded-xl border border-white/10 bg-neutral-950/80 p-3 text-sm font-medium leading-6 text-white outline-none transition placeholder:text-neutral-600 focus:border-red-300/50"
            />
          </label>

          {audioError ? (
            <p
              role="alert"
              className="flex items-start gap-2 text-sm leading-6 text-red-100"
            >
              <IconAlertCircle size={17} className="mt-0.5 shrink-0" />
              {audioError}
            </p>
          ) : null}

          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onApprove(redemption)}
              disabled={isPending || !audioUrl}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-green-300/30 bg-green-400/10 px-4 text-sm font-black text-green-100 transition hover:bg-green-400/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <IconCircleCheck size={18} />
              Aprobar audio
            </button>
            <button
              type="button"
              onClick={rejectAudio}
              disabled={isPending}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-300/30 bg-red-500/10 px-4 text-sm font-black text-red-100 transition hover:bg-red-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <IconX size={18} />
              Rechazar audio
            </button>
          </div>
        </div>
      ) : audioError ? (
        <p className="mt-3 text-sm text-red-100">{audioError}</p>
      ) : null}
    </section>
  );
}

function getAudioReviewStatus(status) {
  if (status === "pending_review") {
    return {
      label: "Pendiente de revisión",
      description: "Escuchá la toma antes de aprobarla o rechazarla.",
      className: "border-amber-300/25 bg-amber-400/10 text-amber-100",
    };
  }

  if (status === "retry_allowed") {
    return {
      label: "Puede regrabar",
      description: "El primer intento fue rechazado y espera una nueva toma.",
      className: "border-amber-300/25 bg-amber-400/10 text-amber-100",
    };
  }

  if (status === "approved") {
    return {
      label: "Aprobado, en cola",
      description: "OBS lo reproducirá cuando terminen los audios anteriores.",
      className: "border-green-300/25 bg-green-400/10 text-green-100",
    };
  }

  if (status === "playing") {
    return {
      label: "En reproducción",
      description: "El overlay de OBS reclamó este audio.",
      className: "border-sky-300/25 bg-sky-400/10 text-sky-100",
    };
  }

  if (status === "played") {
    return {
      label: "Reproducido",
      description: "El archivo temporal fue eliminado después de reproducirse.",
      className: "border-green-300/25 bg-green-400/10 text-green-100",
    };
  }

  if (status === "rejected") {
    return {
      label: "Rechazado definitivo",
      description: "Los dos intentos fueron rechazados y el canje se cerró.",
      className: "border-red-300/25 bg-red-500/10 text-red-100",
    };
  }

  return {
    label: "Esperando audio",
    description: "El usuario todavía no envió una grabación.",
    className: "border-white/10 bg-white/[0.04] text-neutral-300",
  };
}
