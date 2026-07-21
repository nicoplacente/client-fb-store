"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useId,
  useRef,
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
import ConfirmationDialog from "@/modules/ui/confirmation-dialog";
import { AuthContext } from "@/context/auth-context/auth-context";
import useAppContext from "@/context/use-app-context";
import {
  getGiveaways,
  joinGiveaway,
  normalizeGiveaway,
} from "@/modules/giveaways/libs/giveaway-api";
import { getErrorMessage } from "@/modules/api/error-message";
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

function getGiveawayState(giveaway) {
  const started = hasStarted(giveaway.startsAt);
  const isFinalized =
    giveaway.status === "closed" || Boolean(giveaway.finalizedAt);
  const isActive = giveaway.status === "active" && started && !isFinalized;
  const canJoin = isActive && !giveaway.hasJoined;

  if (isFinalized) {
    return {
      started,
      isFinalized,
      isActive: false,
      canJoin: false,
      badgeLabel: "Finalizado",
      badgeClassName:
        "border-white/10 bg-white/5 text-neutral-200 shadow-inner shadow-black/20",
      participationLabel: giveaway.hasJoined ? "Participaste" : "Cerrado",
      participationClassName: giveaway.hasJoined
        ? "border-amber-300/25 bg-amber-400/10 text-amber-100 shadow-inner shadow-amber-950/20"
        : "border-white/10 bg-white/5 text-neutral-300 shadow-inner shadow-black/20",
      scheduleLabel: "Finalizó",
      scheduleDate: giveaway.finalizedAt || giveaway.endsAt,
     
      primaryActionLabel: "Sorteo finalizado",
    };
  }

  if (!started) {
    return {
      started,
      isFinalized: false,
      isActive: false,
      canJoin: false,
      badgeLabel: "Próximamente",
      badgeClassName:
        "border-sky-300/25 bg-sky-400/10 text-sky-100 shadow-inner shadow-sky-950/20",
      participationLabel: "Aún no abre",
      participationClassName:
        "border-sky-300/25 bg-sky-400/10 text-sky-100 shadow-inner shadow-sky-950/20",
      scheduleLabel: "Comienza",
      scheduleDate: giveaway.startsAt,
      primaryActionLabel: "Todavía no disponible",
    };
  }

  if (giveaway.hasJoined) {
    return {
      started,
      isFinalized: false,
      isActive: true,
      canJoin: false,
      badgeLabel: "Activo",
      badgeClassName:
        "border-green-300/25 bg-green-400/10 text-green-100 shadow-inner shadow-green-950/20",
      participationLabel: "Participando",
      participationClassName:
        "border-green-300/25 bg-green-400/10 text-green-200 shadow-inner shadow-green-950/20",
      scheduleLabel: "Cierra",
      scheduleDate: giveaway.endsAt,
      primaryActionLabel: "Ya participas",
    };
  }

  return {
    started,
    isFinalized: false,
    isActive: true,
    canJoin: true,
    badgeLabel: "Activo",
    badgeClassName:
      "border-green-300/25 bg-green-400/10 text-green-100 shadow-inner shadow-green-950/20",
    participationLabel: "Disponible",
    participationClassName:
      "border-emerald-300/25 bg-emerald-400/10 text-emerald-100 shadow-inner shadow-emerald-950/20",
    scheduleLabel: "Cierra",
    scheduleDate: giveaway.endsAt,
    primaryActionLabel:
      giveaway.entryCost > 0
        ? `Participar - ${formatNumber(giveaway.entryCost)} creditos`
        : "Participar gratis",
  };
}

export default function GiftsPage() {
  const { user, refreshUser } = useAppContext(AuthContext);
  const [giveaways, setGiveaways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resultGiveaway, setResultGiveaway] = useState(null);
  const [pendingGiveaway, setPendingGiveaway] = useState(null);
  const [isPending, startTransition] = useTransition();
  const availableCredits = Number(user?.credits || 0);

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

  function handleRequestJoin(giveaway) {
    if (isPending) return;
    setPendingGiveaway(giveaway);
  }

  function handleCancelJoin() {
    if (isPending) return;
    setPendingGiveaway(null);
  }

  function handleConfirmJoin() {
    const giveaway = pendingGiveaway;

    if (!giveaway) return;
    setPendingGiveaway(null);

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
      } catch (error) {
        toast.error(getErrorMessage(error, "No se pudo participar"));
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
              onJoin={handleRequestJoin}
            />
          ))}
        </SpotlightGroup>
      )}

      <ConfirmationDialog
        open={Boolean(pendingGiveaway)}
        title="Confirmar participacion"
        description={
          pendingGiveaway
            ? getJoinConfirmationDescription(pendingGiveaway, availableCredits)
            : ""
        }
        confirmLabel="Participar"
        confirmDisabled={!canJoinGiveaway(pendingGiveaway, availableCredits)}
        cancelDisabled={isPending}
        onConfirm={handleConfirmJoin}
        onCancel={handleCancelJoin}
        aside={
          pendingGiveaway ? <GiveawayDetail giveaway={pendingGiveaway} /> : null
        }
      >
        {pendingGiveaway ? (
          <GiveawayJoinSummary
            giveaway={pendingGiveaway}
            availableCredits={availableCredits}
          />
        ) : null}
      </ConfirmationDialog>

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
  const state = getGiveawayState(giveaway);
  const entryLabel =
    giveaway.entryCost > 0
      ? `${formatNumber(giveaway.entryCost)} creditos`
      : "Gratis";

  return (
    <SpotlightCard
      hue={CARD_HUES[index % CARD_HUES.length]}
      saturation={CARD_SATURATIONS[index % CARD_SATURATIONS.length]}
      lightness={CARD_LIGHTNESSES[index % CARD_LIGHTNESSES.length]}
      className="group flex min-h-[410px] flex-col items-center rounded-[15px] p-5 text-center"
    >
      <div className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-xl bg-black/20 sm:h-44">
        <span
          className={`absolute left-3 top-3 z-10 rounded-full border px-3 py-1 text-xs font-bold shadow-lg shadow-black/20 backdrop-blur ${state.badgeClassName}`}
        >
          {state.badgeLabel}
        </span>
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
            <span
              className={`rounded-full border px-3 py-1 text-xs font-bold ${state.participationClassName}`}
            >
              {state.participationLabel}
            </span>
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
              {state.scheduleLabel} {formatDate(state.scheduleDate)}
            </p>
          </div>
          <p className="flex items-center justify-center gap-2 text-2xl font-black text-amber-300">
            <Image src={coins} alt="Creditos" className="size-5" />
            {entryLabel}
          </p>
        </div>

        <div className="grid w-full gap-2">
          <button
            disabled={isPending || !state.canJoin}
            onClick={() => onJoin(giveaway)}
            aria-label={`Participar en el sorteo ${giveaway.title}`}
            data-spotlight-cta
            className="spotlight-cta inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-white/10 px-5 py-3 text-xs font-black focus:outline-none disabled:cursor-not-allowed disabled:bg-neutral-900 disabled:text-neutral-500 disabled:shadow-none"
          >
            <IconGift size={18} />
            {state.primaryActionLabel}
          </button>

          <button
            type="button"
            onClick={() => onOpenResult(giveaway)}
            aria-label={`Ver resultado del sorteo ${giveaway.title}`}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-white/15 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(13,13,13,0.72))] px-5 py-3 text-xs font-black text-neutral-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:-translate-y-0.5 hover:border-amber-200/45 hover:bg-[linear-gradient(135deg,rgba(251,191,36,0.18),rgba(13,13,13,0.78))] hover:text-white focus:outline-none"
          >
            <IconTrophy size={17} />
            {state.isFinalized ? "Ver resultado" : "Resultado pendiente"}
          </button>
        </div>
      </div>
    </SpotlightCard>
  );
}

function GiveawayDetail({ giveaway }) {
  return (
    <div className="grid gap-4">
      <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/20">
        {giveaway.imageUrl ? (
          <img
            src={giveaway.imageUrl}
            alt={`Imagen del sorteo ${giveaway.title}`}
            className="max-h-full max-w-full object-contain"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-red-300/70">
            <IconGift size={56} />
          </div>
        )}
      </div>

      <div className="grid gap-3 text-sm text-neutral-300">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-red-300/80">
            Sorteo
          </p>
          <h3 className="mt-2 text-xl font-black text-white">
            {giveaway.title}
          </h3>
        </div>
        {giveaway.description ? (
          <p className="leading-6 text-neutral-400">{giveaway.description}</p>
        ) : null}
      </div>
    </div>
  );
}

function GiveawayJoinSummary({ giveaway, availableCredits }) {
  const entryCost = Number(giveaway.entryCost || 0);
  const hasEnoughCredits = availableCredits >= entryCost;

  return (
    <div className="grid gap-3 text-sm text-neutral-300">
      <SummaryRow label="Sorteo" value={giveaway.title} />
      <SummaryRow
        label="Costo de participacion"
        value={entryCost > 0 ? formatNumber(entryCost) : "Gratis"}
        valueClassName={entryCost > 0 ? "text-amber-200" : "text-green-300"}
        icon={entryCost > 0 ? <CreditsIcon /> : null}
      />
      <SummaryRow
        label="Participantes actuales"
        value={formatNumber(giveaway.participants)}
      />
      <SummaryRow
        label="Tu saldo"
        value={formatNumber(availableCredits)}
        valueClassName={hasEnoughCredits ? "text-green-300" : "text-red-300"}
        icon={<CreditsIcon />}
      />
      <SummaryRow
        label="Estado"
        value={
          hasEnoughCredits
            ? entryCost > 0
              ? "Se descontaran creditos al confirmar"
              : "Participacion gratuita"
            : "Créditos insuficientes"
        }
        valueClassName={hasEnoughCredits ? "text-white" : "text-red-300"}
      />
    </div>
  );
}

function SummaryRow({ label, value, valueClassName = "text-white", icon }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-neutral-400">{label}</span>
      <span
        className={`inline-flex items-center gap-1.5 text-right font-black ${valueClassName}`}
      >
        {icon}
        <span>{value}</span>
      </span>
    </div>
  );
}

function CreditsIcon() {
  return <Image src={coins} alt="Creditos" className="size-4 shrink-0" />;
}

function canJoinGiveaway(giveaway, availableCredits) {
  if (!giveaway) return false;

  const started = hasStarted(giveaway.startsAt);
  const isFinalized =
    giveaway.status === "closed" || Boolean(giveaway.finalizedAt);

  if (
    giveaway.status !== "active" ||
    !started ||
    isFinalized ||
    giveaway.hasJoined
  ) {
    return false;
  }

  return availableCredits >= Number(giveaway.entryCost || 0);
}

function getJoinConfirmationDescription(giveaway, availableCredits) {
  const entryCost = Number(giveaway.entryCost || 0);

  if (!canJoinGiveaway(giveaway, availableCredits)) {
    if (giveaway?.hasJoined) {
      return "Ya estas participando en este sorteo.";
    }

    if (availableCredits < entryCost) {
      return "No tenes creditos suficientes para participar en este sorteo.";
    }

    return "Este sorteo no esta disponible para participar en este momento.";
  }

  if (entryCost > 0) {
    return `Se descontaran ${formatNumber(entryCost)} creditos de tu cuenta para registrar tu participacion.`;
  }

  return "Tu participacion se registrara al confirmar.";
}

function GiveawayResultModal({ giveaway, onClose }) {
  const titleId = useId();
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const isFinalized =
    giveaway.status === "closed" || Boolean(giveaway.finalizedAt);

  useEffect(() => {
    const previouslyFocusedElement = document.activeElement;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 shadow-2xl shadow-black/70 ring-1 ring-white/[0.03]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 bg-[linear-gradient(135deg,rgba(220,38,38,0.14),rgba(255,255,255,0.03))] p-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-red-300/80">
              Resultado
            </p>
            <h2 id={titleId} className="mt-1 text-2xl font-bold text-white">
              {giveaway.title}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md border border-white/10 bg-neutral-950/70 p-2 text-neutral-400 transition hover:border-red-300/35 hover:text-white focus:outline-none"
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
                  El sorteo finalizó sin participantes, no hay ganador.
                </p>
              )
            ) : (
              <p className="text-sm leading-6 text-neutral-400">
                El ganador se sortea automáticamente cuando llega la fecha de
                fin.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
