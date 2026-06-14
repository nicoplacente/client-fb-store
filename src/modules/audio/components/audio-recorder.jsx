"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  IconAlertCircle,
  IconCircleCheck,
  IconClock,
  IconMicrophone,
  IconPlayerStop,
  IconRefresh,
  IconTrash,
  IconUpload,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
  normalizeProductRedemption,
  uploadRedemptionAudio,
} from "@/modules/products/libs/product-api";
import { getErrorMessage } from "@/modules/api/error-message";

const MAX_ATTEMPTS = 2;
const RECORDABLE_STATUSES = new Set([
  "awaiting_audio",
  "retry_allowed",
]);
const MIME_TYPE_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/ogg;codecs=opus",
  "audio/mp4",
  "audio/webm",
];

export default function AudioRecorder({
  redemption,
  locked = false,
  onUpdated = () => {},
}) {
  const normalizedRedemption = useMemo(
    () => normalizeProductRedemption(redemption || {}),
    [redemption],
  );
  const status = normalizedRedemption.audioStatus;
  const attemptsUsed = normalizedRedemption.audioAttemptsUsed;
  const maxDurationSeconds =
    normalizedRedemption.product.audioMaxDurationSeconds || 15;
  const canRecord =
    !locked &&
    RECORDABLE_STATUSES.has(status) &&
    attemptsUsed < MAX_ATTEMPTS;
  const [recording, setRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const startedAtRef = useRef(0);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!audioBlob) {
      setPreviewUrl("");
      return undefined;
    }

    const url = URL.createObjectURL(audioBlob);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [audioBlob]);

  useEffect(
    () => () => {
      stopMediaTracks(streamRef.current);
      window.clearInterval(intervalRef.current);
      window.clearTimeout(timeoutRef.current);

      if (recorderRef.current?.state === "recording") {
        recorderRef.current.stop();
      }
    },
    [],
  );

  async function startRecording() {
    if (!canRecord || recording || uploading) return;

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setError("Este navegador no permite grabar audio.");
      return;
    }

    try {
      setError("");
      setAudioBlob(null);
      setElapsedSeconds(0);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      const mimeType = getSupportedMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      streamRef.current = stream;
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || mimeType || "audio/webm",
        });

        window.clearInterval(intervalRef.current);
        window.clearTimeout(timeoutRef.current);
        stopMediaTracks(streamRef.current);
        streamRef.current = null;
        recorderRef.current = null;
        setRecording(false);

        if (blob.size > 0) {
          setAudioBlob(blob);
        } else {
          setError("No se pudo generar la grabación.");
        }
      };
      recorder.onerror = () => {
        setError("La grabación se interrumpió.");
        stopRecording();
      };
      recorder.start(250);
      startedAtRef.current = performance.now();
      setRecording(true);
      intervalRef.current = window.setInterval(() => {
        const elapsed = (performance.now() - startedAtRef.current) / 1000;
        setElapsedSeconds(Math.min(maxDurationSeconds, elapsed));
      }, 100);
      timeoutRef.current = window.setTimeout(
        stopRecording,
        maxDurationSeconds * 1000,
      );
    } catch {
      stopMediaTracks(streamRef.current);
      streamRef.current = null;
      setError(
        "No se pudo acceder al micrófono. Revisá los permisos del navegador.",
      );
    }
  }

  function stopRecording() {
    window.clearInterval(intervalRef.current);
    window.clearTimeout(timeoutRef.current);
    const recorder = recorderRef.current;

    if (recorder?.state === "recording") {
      recorder.stop();
    }
  }

  function discardRecording() {
    if (recording || uploading) return;

    setAudioBlob(null);
    setElapsedSeconds(0);
    setError("");
  }

  async function submitRecording() {
    if (!audioBlob || uploading || !canRecord) return;

    try {
      setUploading(true);
      setError("");
      const result = await uploadRedemptionAudio(
        normalizedRedemption.id,
        audioBlob,
      );
      const updated = normalizeProductRedemption(result.redemption || {});

      setAudioBlob(null);
      setElapsedSeconds(0);
      onUpdated(updated);
      toast.success("Audio enviado para revisión");
    } catch (submissionError) {
      const message = getErrorMessage(
        submissionError,
        "No se pudo enviar el audio.",
      );

      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  }

  if (locked) {
    return (
      <AudioStateCard
        icon={<IconMicrophone size={22} />}
        title="Grabación bloqueada"
        description="Confirmá el canje para habilitar el micrófono y grabar tu audio."
        tone="muted"
      />
    );
  }

  if (!canRecord) {
    return (
      <AudioStatus
        redemption={normalizedRedemption}
        maxDurationSeconds={maxDurationSeconds}
      />
    );
  }

  const nextAttempt = attemptsUsed + 1;

  return (
    <section
      aria-labelledby={`audio-recorder-${normalizedRedemption.id}`}
      className="grid gap-4"
    >
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-sky-200">
          Toma {nextAttempt} de {MAX_ATTEMPTS}
        </p>
        <h3
          id={`audio-recorder-${normalizedRedemption.id}`}
          className="mt-1 text-lg font-black text-white"
        >
          Grabá tu audio
        </h3>
        <p className="mt-2 text-sm leading-6 text-neutral-400">
          Tenés hasta {maxDurationSeconds} segundos. Podés escucharlo y
          descartarlo antes de enviarlo.
        </p>
      </div>

      {normalizedRedemption.audioRejectionReason ? (
        <div className="rounded-xl border border-amber-300/25 bg-amber-400/10 p-3 text-sm leading-6 text-amber-100">
          <strong>Motivo del rechazo anterior:</strong>{" "}
          {normalizedRedemption.audioRejectionReason}
        </div>
      ) : null}

      <div className="rounded-2xl border border-sky-300/20 bg-neutral-950/70 p-4">
        <div className="flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-2 text-sm font-black text-white">
            <span
              className={`size-2.5 rounded-full ${
                recording ? "animate-pulse bg-red-400" : "bg-sky-300"
              }`}
            />
            {recording ? "Grabando" : audioBlob ? "Vista previa" : "Preparado"}
          </span>
          <span className="inline-flex items-center gap-1.5 font-mono text-sm font-bold tabular-nums text-sky-100">
            <IconClock size={16} />
            {formatDuration(elapsedSeconds)} /{" "}
            {formatDuration(maxDurationSeconds)}
          </span>
        </div>

        <progress
          value={elapsedSeconds}
          max={maxDurationSeconds}
          className={`mt-4 h-2 w-full overflow-hidden rounded-full bg-neutral-800 ${
            recording ? "accent-red-400" : "accent-sky-400"
          }`}
          aria-label="Progreso de la grabación"
        />

        {previewUrl ? (
          <audio
            className="mt-4 w-full"
            controls
            preload="metadata"
            src={previewUrl}
          >
            Tu navegador no puede reproducir esta grabación.
          </audio>
        ) : null}
      </div>

      {error ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-red-300/25 bg-red-500/10 p-3 text-sm leading-6 text-red-100"
        >
          <IconAlertCircle size={18} className="mt-0.5 shrink-0" />
          {error}
        </p>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2">
        {recording ? (
          <button
            type="button"
            onClick={stopRecording}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-300/35 bg-red-500/15 px-4 text-sm font-black text-red-100 transition hover:bg-red-500/25 focus:outline-none"
          >
            <IconPlayerStop size={18} />
            Detener
          </button>
        ) : (
          <button
            type="button"
            onClick={startRecording}
            disabled={uploading}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-sky-300/35 bg-sky-400/12 px-4 text-sm font-black text-sky-100 transition hover:bg-sky-400/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {audioBlob ? <IconRefresh size={18} /> : <IconMicrophone size={18} />}
            {audioBlob ? "Grabar de nuevo" : "Comenzar grabación"}
          </button>
        )}

        {audioBlob && !recording ? (
          <button
            type="button"
            onClick={submitRecording}
            disabled={uploading}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-green-300/35 bg-green-400/12 px-4 text-sm font-black text-green-100 transition hover:bg-green-400/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IconUpload size={18} />
            {uploading ? "Enviando..." : "Enviar a revisión"}
          </button>
        ) : null}
      </div>

      {audioBlob && !recording ? (
        <button
          type="button"
          onClick={discardRecording}
          disabled={uploading}
          className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-neutral-900 px-4 text-sm font-bold text-neutral-400 transition hover:border-white/20 hover:text-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <IconTrash size={17} />
          Descartar esta toma
        </button>
      ) : null}
    </section>
  );
}

function AudioStatus({ redemption, maxDurationSeconds }) {
  const statusCopy = getStatusCopy(redemption.audioStatus);

  return (
    <AudioStateCard
      icon={
        redemption.audioStatus === "played" ? (
          <IconCircleCheck size={22} />
        ) : (
          <IconMicrophone size={22} />
        )
      }
      title={statusCopy.title}
      description={statusCopy.description}
      tone={statusCopy.tone}
    >
      <div className="grid gap-2 text-sm text-neutral-400">
        <p>
          Intentos utilizados:{" "}
          <strong className="text-white">
            {redemption.audioAttemptsUsed} de {MAX_ATTEMPTS}
          </strong>
        </p>
        <p>
          Duración máxima:{" "}
          <strong className="text-white">{maxDurationSeconds} segundos</strong>
        </p>
        {redemption.audioRejectionReason ? (
          <p className="rounded-xl border border-red-300/20 bg-red-500/10 p-3 leading-6 text-red-100">
            <strong>Motivo:</strong> {redemption.audioRejectionReason}
          </p>
        ) : null}
      </div>
    </AudioStateCard>
  );
}

function AudioStateCard({
  icon,
  title,
  description,
  tone = "sky",
  children,
}) {
  const toneClass =
    tone === "success"
      ? "border-green-300/20 bg-green-400/[0.08] text-green-100"
      : tone === "danger"
        ? "border-red-300/20 bg-red-500/[0.08] text-red-100"
        : tone === "warning"
          ? "border-amber-300/20 bg-amber-400/[0.08] text-amber-100"
          : tone === "muted"
            ? "border-white/10 bg-white/[0.03] text-neutral-300"
            : "border-sky-300/20 bg-sky-400/[0.08] text-sky-100";

  return (
    <section className={`rounded-2xl border p-4 ${toneClass}`}>
      <span className="grid size-11 place-items-center rounded-xl border border-current/20 bg-black/15">
        {icon}
      </span>
      <h3 className="mt-4 text-base font-black text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 opacity-90">{description}</p>
      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}

function getStatusCopy(status) {
  if (status === "pending_review") {
    return {
      title: "Pendiente de revisión",
      description:
        "El audio fue enviado. Un moderador debe aprobarlo antes de que ingrese al stream.",
      tone: "warning",
    };
  }

  if (status === "approved") {
    return {
      title: "Aprobado y en cola",
      description:
        "El audio fue aprobado y se reproducirá cuando terminen los audios anteriores.",
      tone: "success",
    };
  }

  if (status === "playing") {
    return {
      title: "Reproduciendo en el stream",
      description: "OBS reclamó este audio y está procesando su reproducción.",
      tone: "success",
    };
  }

  if (status === "played") {
    return {
      title: "Audio reproducido",
      description:
        "La reproducción terminó y el archivo temporal fue eliminado.",
      tone: "success",
    };
  }

  if (status === "rejected") {
    return {
      title: "Audio rechazado definitivamente",
      description:
        "Los dos intentos fueron rechazados. El canje queda registrado y no admite otra grabación.",
      tone: "danger",
    };
  }

  return {
    title: "Preparando grabación",
    description: "Actualizá la página para consultar el estado del canje.",
    tone: "muted",
  };
}

function getSupportedMimeType() {
  return (
    MIME_TYPE_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type)) ||
    ""
  );
}

function stopMediaTracks(stream) {
  stream?.getTracks().forEach((track) => track.stop());
}

function formatDuration(value) {
  const totalSeconds = Math.max(0, Math.ceil(Number(value || 0)));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
