"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import Image from "next/image";
import {
  IconCalendarDue,
  IconGift,
  IconTrophy,
  IconX,
} from "@tabler/icons-react";
import { toast } from "sonner";
import SectionContainer from "@/modules/ui/section-container";
import SpotlightCard, { SpotlightGroup } from "@/modules/ui/spotlight-card";
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
    [giveaways],
  );

  const loadGiveaways = useCallback(async ({ showLoading = true } = {}) => {
    try {
      if (showLoading) setLoading(true);
      setError("");
      const data = await getGiveaways();
      setGiveaways(data);
    } catch {
      setError("No se pudieron cargar los sorteos");
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
        toast.success(
          result?.alreadyJoined
            ? "Ya estabas participando"
            : "Participacion registrada",
        );
        await loadGiveaways({ showLoading: false });
        await Promise.resolve(refreshUser?.()).catch(() => {});
      } catch {
        toast.error(err.message || "No se pudo participar");
      }
    });
  }

  return (
    <SectionContainer className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(220,38,38,0.16),rgba(10,10,10,0.74)_40%,rgba(10,10,10,0.9))] p-4 shadow-2xl shadow-black/25 ring-1 ring-white/[0.03] sm:p-6">
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-red-200/45 to-transparent" />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-red-300/80">
              Sorteos
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
              Premios en juego
            </h1>
            <p className="mt-3 max-w-2xl text-neutral-400">
              Entra a los sorteos activos, revisa el costo de participacion y
              consulta ganadores desde el mismo lugar.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:flex">
            <HeroStat label="Publicados" value={normalizedGiveaways.length} />
            <HeroStat
              label="Activos"
              value={
                normalizedGiveaways.filter(
                  (giveaway) =>
                    giveaway.status === "active" &&
                    hasStarted(giveaway.startsAt) &&
                    !giveaway.finalizedAt,
                ).length
              }
            />
          </div>
        </div>
      </div>

      {loading ? (
        <StatePanel text="Cargando sorteos..." />
      ) : error ? (
        <StatePanel text={error} tone="error" />
      ) : normalizedGiveaways.length === 0 ? (
        <StatePanel text="No hay sorteos publicados por ahora." />
      ) : (
        <SpotlightGroup className="grid gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-4">
          {normalizedGiveaways.map((giveaway, index) => (
            <GiveawayCard
              key={giveaway.id}
              giveaway={giveaway}
              index={index}
              onOpenResult={setResultGiveaway}
              isPending={isPending}
              onJoin={handleJoin}
            />
          ))}
        </SpotlightGroup>
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

function HeroStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 shadow-inner shadow-black/20">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {label}
      </p>
      <strong className="mt-1 block text-2xl font-black text-white">
        {value}
      </strong>
    </div>
  );
}

function StatePanel({ text, tone = "default" }) {
  const classes =
    tone === "error"
      ? "border-red-500/30 bg-red-500/10 text-red-200"
      : "border-white/10 bg-neutral-950/70 text-neutral-400";

  return (
    <div
      className={`rounded-2xl border p-10 text-center shadow-xl shadow-black/15 ${classes}`}
    >
      {text}
    </div>
  );
}

const CARD_HUES = [165, 291.34, 338.69];
const CARD_SATURATIONS = ["82.26%", "95.9%", "100%"];
const CARD_LIGHTNESSES = ["51.37%", "61.76%", "48.04%"];

function GiveawayCard({
  giveaway,
  onOpenResult,
  isPending,
  onJoin,
  index = 0,
}) {
  const started = hasStarted(giveaway.startsAt);
  const isFinalized =
    giveaway.status === "closed" || Boolean(giveaway.finalizedAt);
  const canJoin =
    giveaway.status === "active" &&
    started &&
    !isFinalized &&
    !giveaway.hasJoined;
  const entryLabel =
    giveaway.entryCost > 0
      ? `${formatNumber(giveaway.entryCost)} creditos`
      : "Gratis";
  const statusLabel = !started
    ? "Proximamente"
    : isFinalized
      ? "Finalizado"
      : giveaway.status === "active"
        ? "Activo"
        : giveaway.status;

  return (
    <SpotlightCard
      hue={CARD_HUES[index % CARD_HUES.length]}
      saturation={CARD_SATURATIONS[index % CARD_SATURATIONS.length]}
      lightness={CARD_LIGHTNESSES[index % CARD_LIGHTNESSES.length]}
      className="group flex min-h-[410px] flex-col items-center rounded-[15px] p-5 text-center"
    >
      <div className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-xl bg-black/20 sm:h-44">
        {/* <span className="absolute left-3 top-3 z-10 rounded-full border border-white/10 bg-neutral-950/75 px-3 py-1 text-xs font-bold text-neutral-200 shadow-lg shadow-black/20 backdrop-blur">
          {statusLabel}
        </span> */}
        {giveaway.imageUrl ? (
          <img
            src={giveaway.imageUrl}
            alt={`Imagen del sorteo ${giveaway.title}`}
            className="max-h-full max-w-full object-contain drop-shadow-[0_18px_26px_rgba(0,0,0,0.45)] transition duration-700 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-full min-h-52 items-center justify-center text-red-300/70">
            <IconGift size={60} />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col items-center justify-between gap-4 pt-4">
        <div>
          <div className="grid justify-items-center gap-2">
            <h2 className="line-clamp-2 text-lg font-black leading-tight text-white">
              {giveaway.title}
            </h2>
            {giveaway.hasJoined ? (
              <span className="rounded-full border border-green-300/25 bg-green-400/10 px-3 py-1 text-xs font-bold text-green-200 shadow-inner shadow-green-950/20">
                Participando
              </span>
            ) : null}
          </div>
          <p className="mx-auto mt-3 line-clamp-2 min-h-10 max-w-[16rem] text-sm font-semibold leading-5 text-neutral-500">
            {giveaway.description}
          </p>
        </div>

        <div className="grid justify-items-center gap-4">
          <div className="grid gap-1 text-sm font-bold text-neutral-400">
            <p>
              Participantes:{" "}
              <span className="text-neutral-100">
                {formatNumber(giveaway.participants)}
              </span>
            </p>

            <p className="inline-flex items-center justify-center gap-2 text-xs text-neutral-600">
              <IconCalendarDue size={15} />
              {started
                ? formatDate(giveaway.endsAt)
                : formatDate(giveaway.startsAt)}
            </p>
          </div>
          <p className="flex items-center justify-center gap-2 text-2xl font-black text-amber-300">
            <Image src={coins} alt="Creditos" className="size-5" />
            {entryLabel}
          </p>
        </div>

        <div className="grid w-full gap-2">
          <button
            disabled={isPending || !canJoin}
            onClick={() => onJoin(giveaway)}
            aria-label={`Participar en el sorteo ${giveaway.title}`}
            data-spotlight-cta
            className="spotlight-cta inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-white/10 px-5 py-3 text-xs font-black focus:outline-none focus:ring-2 focus:ring-red-300/50 disabled:cursor-not-allowed disabled:bg-neutral-900 disabled:text-neutral-500 disabled:shadow-none"
          >
            <IconGift size={18} />
            {giveaway.hasJoined
              ? "Ya participas"
              : canJoin
                ? giveaway.entryCost > 0
                  ? `Participar - ${entryLabel}`
                  : "Participar gratis"
                : isFinalized
                  ? "Sorteo finalizado"
                  : "Todavia no disponible"}
          </button>

          <button
            type="button"
            onClick={() => onOpenResult(giveaway)}
            aria-label={`Ver resultado del sorteo ${giveaway.title}`}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-white/15 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(13,13,13,0.72))] px-5 py-3 text-xs font-black text-neutral-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:-translate-y-0.5 hover:border-amber-200/45 hover:bg-[linear-gradient(135deg,rgba(251,191,36,0.18),rgba(13,13,13,0.78))] hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-200/45"
          >
            <IconTrophy size={17} />
            {isFinalized ? "Ver resultado" : "Resultado pendiente"}
          </button>
        </div>
      </div>
    </SpotlightCard>
  );
}

function GiveawayResultModal({ giveaway, onClose }) {
  const isFinalized =
    giveaway.status === "closed" || Boolean(giveaway.finalizedAt);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 shadow-2xl shadow-black/70 ring-1 ring-white/[0.03]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 bg-[linear-gradient(135deg,rgba(220,38,38,0.14),rgba(255,255,255,0.03))] p-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-red-300/80">
              Resultado
            </p>
            <h2 className="mt-1 text-2xl font-bold text-white">
              {giveaway.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md border border-white/10 bg-neutral-950/70 p-2 text-neutral-400 transition hover:border-red-300/35 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-300/40"
            aria-label="Cerrar resultado"
          >
            <IconX size={18} />
          </button>
        </div>

        <div className="p-5">
          <div className="rounded-2xl border border-white/10 bg-neutral-900/70 p-5 shadow-inner shadow-black/20">
            {isFinalized ? (
              giveaway.winnerUsername ? (
                <div>
                  <p className="text-sm text-neutral-400">Ganador del sorteo</p>
                  <p className="mt-2 inline-flex items-center gap-2 text-lg font-black text-white">
                    <IconTrophy size={20} className="text-amber-200" />
                    {giveaway.winnerUsername}
                  </p>
                </div>
              ) : (
                <p className="text-sm leading-6 text-neutral-400">
                  El sorteo finalizo sin participantes, no hay ganador.
                </p>
              )
            ) : (
              <p className="text-sm leading-6 text-neutral-400">
                El ganador se sortea automaticamente cuando llega la fecha de
                fin.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
