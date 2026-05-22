"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import {
  IconGift,
  IconTicket,
  IconTrophy,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import { toast } from "sonner";
import SectionContainer from "@/modules/ui/section-container";
import { AuthContext } from "@/context/auth-context/auth-context";
import useAppContext from "@/context/use-app-context";
import {
  getGiveaways,
  joinGiveaway,
  normalizeGiveaway,
} from "@/modules/giveaways/libs/giveaway-api";
import coins from "@/assets/coins.webp";

function formatDate(value) {
  if (!value) return "Fecha abierta";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatNumber(value) {
  return new Intl.NumberFormat("es-AR").format(Number(value || 0));
}

function hasStarted(value) {
  if (!value) return true;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) || date <= new Date();
}

export default function GiftsPage() {
  const { refreshUser } = useAppContext(AuthContext);
  const [giveaways, setGiveaways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resultGiveaway, setResultGiveaway] = useState(null);
  const [isPending, startTransition] = useTransition();

  const normalizedGiveaways = useMemo(
    () => giveaways.map(normalizeGiveaway).filter((giveaway) => giveaway.id),
    [giveaways]
  );

  const loadGiveaways = useCallback(async ({ showLoading = true } = {}) => {
    try {
      if (showLoading) setLoading(true);
      setError("");
      const data = await getGiveaways();
      setGiveaways(data);
    } catch (err) {
      setError(err.message || "No se pudieron cargar los sorteos");
      setGiveaways([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGiveaways();
  }, [loadGiveaways]);

  function handleJoin(giveaway) {
    startTransition(async () => {
      try {
        const result = await joinGiveaway(giveaway.id);
        await refreshUser?.();
        await loadGiveaways({ showLoading: false });
        toast.success(
          result?.alreadyJoined
            ? "Ya estabas participando"
            : "Participacion registrada"
        );
      } catch (err) {
        toast.error(err.message || "No se pudo participar");
      }
    });
  }

  return (
    <SectionContainer className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase text-red-300/80">Sorteos</p>
        <h1 className="mt-2 text-4xl font-bold text-white">Premios activos</h1>
        <p className="mt-3 max-w-2xl text-neutral-400">
          Participá en sorteos activos y seguí el estado de los proximos premios.
        </p>
      </div>

      {loading ? (
        <div className="rounded-lg border border-white/10 bg-neutral-950/70 p-10 text-center text-neutral-400">
          Cargando sorteos...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-10 text-center text-red-200">
          {error}
        </div>
      ) : normalizedGiveaways.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-neutral-950/70 p-10 text-center text-neutral-400">
          No hay sorteos publicados.
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {normalizedGiveaways.map((giveaway) => (
            <GiveawayCard
              key={giveaway.id}
              giveaway={giveaway}
              onOpenResult={setResultGiveaway}
              isPending={isPending}
              onJoin={handleJoin}
            />
          ))}
        </div>
      )}

      {resultGiveaway ? (
        <GiveawayResultModal
          giveaway={resultGiveaway}
          onClose={() => setResultGiveaway(null)}
        />
      ) : null}
    </SectionContainer>
  );
}

function GiveawayCard({ giveaway, onOpenResult, isPending, onJoin }) {
  const started = hasStarted(giveaway.startsAt);
  const isFinalized = giveaway.status === "closed" || Boolean(giveaway.finalizedAt);
  const canJoin =
    giveaway.status === "active" && started && !isFinalized && !giveaway.hasJoined;
  const entryLabel =
    giveaway.entryCost > 0
      ? `${formatNumber(giveaway.entryCost)} creditos`
      : "Gratis";
  const statusLabel = !started
    ? "proximamente"
    : isFinalized
      ? "finalizado"
      : giveaway.status;

  return (
    <article className="grid overflow-hidden rounded-lg border border-white/10 bg-neutral-950/75 md:grid-cols-[220px_1fr]">
      <div className="aspect-[4/3] bg-neutral-900 md:aspect-auto">
        {giveaway.imageUrl ? (
          <img
            src={giveaway.imageUrl}
            alt={`Imagen del sorteo ${giveaway.title}`}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-full min-h-48 items-center justify-center text-red-300/70">
            <IconGift size={56} />
          </div>
        )}
      </div>
      <div className="flex flex-col justify-between gap-5 p-5">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl font-bold text-white">{giveaway.title}</h2>
            <span className="rounded-md border border-white/10 px-2 py-1 text-xs text-neutral-400">
              {statusLabel}
            </span>
          </div>
          <p className="mt-2 text-sm text-neutral-400">
            {giveaway.description || giveaway.prize}
          </p>
        </div>

        <div className="grid gap-3 text-sm text-neutral-400 sm:grid-cols-4">
          <span className="flex items-center gap-2">
            <IconTicket size={17} /> {giveaway.prize}
          </span>
          <span className="flex items-center gap-2">
            <IconUsers size={17} /> {giveaway.participants}
          </span>
          <span className="flex items-center gap-2 text-amber-200">
            <Image src={coins} alt="Creditos" className="size-5" />
            {entryLabel}
          </span>
          <span>
            {started ? formatDate(giveaway.endsAt) : formatDate(giveaway.startsAt)}
          </span>
        </div>

        <button
          disabled={isPending || !canJoin}
          onClick={() => onJoin(giveaway)}
          aria-label={`Participar en el sorteo ${giveaway.title}`}
          className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
        >
          <IconGift size={18} />
          {giveaway.hasJoined
            ? "Ya participando"
            : canJoin
              ? giveaway.entryCost > 0
                ? `Participar - ${entryLabel}`
                : "Participar gratis"
            : isFinalized
              ? "Sorteo finalizado"
              : "Todavia no disponible"}
        </button>

        <div className="border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={() => onOpenResult(giveaway)}
            aria-label={`Ver resultado del sorteo ${giveaway.title}`}
            className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm font-bold text-red-100 transition hover:border-red-300 hover:bg-red-500/20"
          >
            <IconTrophy size={17} />
            {isFinalized ? "Ver resultado" : "Resultado disponible al finalizar"}
          </button>
        </div>
      </div>
    </article>
  );
}

function GiveawayResultModal({ giveaway, onClose }) {
  const isFinalized = giveaway.status === "closed" || Boolean(giveaway.finalizedAt);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-lg border border-white/10 bg-neutral-950 p-5 shadow-2xl shadow-black"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase text-red-300/80">
              Resultado
            </p>
            <h2 className="mt-1 text-2xl font-bold text-white">{giveaway.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md border border-white/10 p-2 text-neutral-400 transition hover:text-white"
            aria-label="Cerrar resultado"
          >
            <IconX size={18} />
          </button>
        </div>

        <div className="mt-5 rounded-md border border-white/10 bg-neutral-900/70 p-4">
          {isFinalized ? (
            giveaway.winnerUsername ? (
              <p className="text-sm text-neutral-300">
                Ganador:{" "}
                <strong className="text-white">{giveaway.winnerUsername}</strong>
              </p>
            ) : (
              <p className="text-sm text-neutral-400">
                El sorteo finalizo sin participantes, no hay ganador.
              </p>
            )
          ) : (
            <p className="text-sm text-neutral-400">
              El ganador se sortea automaticamente cuando llega la fecha de fin.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
