import { useState } from "react";
import {
  IconAlertTriangle,
  IconBolt,
  IconBox,
  IconClockCog,
  IconMessageCircle,
  IconPower,
  IconRefreshAlert,
  IconSparkles,
} from "@tabler/icons-react";

const hourStyles = {
  happy: "border-yellow-300/30 bg-yellow-400/10 text-yellow-100",
  opening: "border-sky-300/30 bg-sky-400/10 text-sky-100",
  bertello_snack: "border-red-300/30 bg-red-500/10 text-red-100",
};

function formatMultiplier(value) {
  const multiplier = Number(value || 1);
  return `x${multiplier.toLocaleString("es-AR", {
    maximumFractionDigits: 2,
  })}`;
}

export default function StreamPanel({
  streamHour,
  streamRewards,
  liveStatus,
  loading,
  isPending,
  onActivateHour,
  onActivateChest,
  onActivateChatReward,
  onDisableHour,
  onResetRankingPoints,
}) {
  const [autoDisable, setAutoDisable] = useState(true);

  if (loading && !streamHour) {
    return (
      <div className="rounded-2xl border border-white/10 bg-neutral-950/75 p-8 text-center text-neutral-400 shadow-xl shadow-black/15">
        Cargando configuracion de stream...
      </div>
    );
  }

  const state = streamHour || {
    mode: "auto",
    hasManualOverride: false,
    activeLabel: "Sin hora especial",
    hours: [],
  };
  const isManual = state.hasManualOverride || state.mode === "manual";
  const noEffectActive = !state.active;
  const chestState = streamRewards || {
    chest: null,
    chatReward: null,
    chestScheduler: {
      intervalMinutes: 45,
      durationSeconds: 60,
    },
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <section className="space-y-5 rounded-2xl border border-white/10 bg-neutral-950/75 p-3 shadow-xl shadow-black/20 ring-1 ring-white/[0.03] sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <h2 className="inline-flex items-center gap-2 text-lg font-bold text-white">
              <IconClockCog size={19} />
              Stream
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-neutral-400">
              Controla bonus de puntos, cofres y recompensas activas durante el stream.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-neutral-900/70 p-4 shadow-inner shadow-black/10 lg:min-w-72">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Activo ahora</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-xl font-bold text-white">{state.activeLabel}</span>
              <span className="rounded-full border border-white/10 bg-neutral-950 px-3 py-1 text-xs font-bold text-neutral-400">
                {isManual ? "Manual" : "Auto"}
              </span>
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              Automatico: {state.automaticLabel || "Sin hora especial"}
            </p>
          </div>
        </div>

        <AutoDisableToggle
          checked={autoDisable}
          expiresAt={state.expiresAt}
          onChange={setAutoDisable}
        />

        <div className="grid gap-3 lg:grid-cols-4">
          <button
            type="button"
            disabled={isPending}
            onClick={onDisableHour}
            className={`grid cursor-pointer gap-4 rounded-2xl border p-4 text-left shadow-lg shadow-black/10 transition hover:-translate-y-1 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-red-300/40 disabled:cursor-not-allowed disabled:opacity-60 ${
              noEffectActive
                ? "border-white/25 bg-white/[0.06] text-white"
                : "border-white/10 bg-neutral-900/70 text-neutral-300"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 font-bold">
                <IconPower size={18} />
                Sin efecto activo
              </span>
              {noEffectActive ? (
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
                  Activa
                </span>
              ) : null}
            </div>
            <div className="grid gap-2 text-sm">
              <span className="inline-flex items-center gap-2">
                <IconBolt size={16} />
                x1 watchtime
              </span>
              <span className="text-neutral-400">Chat normal</span>
            </div>
          </button>

          {state.hours.map((hour) => {
            const active = isManual && state.active === hour.id;

            return (
              <button
                key={hour.id}
                type="button"
                disabled={isPending}
                onClick={() => onActivateHour(hour.id, { autoDisable })}
                className={`grid cursor-pointer gap-4 rounded-2xl border p-4 text-left shadow-lg shadow-black/10 transition hover:-translate-y-1 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-red-300/40 disabled:cursor-not-allowed disabled:opacity-60 ${
                  active
                    ? hourStyles[hour.id] || "border-red-300/30 bg-red-500/10 text-red-100"
                    : "border-white/10 bg-neutral-900/70 text-neutral-300"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 font-bold">
                    <IconSparkles size={18} />
                    {hour.label}
                  </span>
                  {active ? (
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
                      Activa
                    </span>
                  ) : null}
                </div>
                <div className="grid gap-2 text-sm">
                  <span className="inline-flex items-center gap-2">
                    <IconBolt size={16} />
                    {formatMultiplier(hour.watchtimeMultiplier)} watchtime
                  </span>
                  <span className="text-neutral-400">
                    {hour.chatMultiplier > 1
                      ? `${formatMultiplier(hour.chatMultiplier)} chat`
                      : "Chat normal"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <div className="grid gap-3 rounded-2xl border border-white/10 bg-neutral-900/65 p-4 shadow-lg shadow-black/10 transition hover:border-amber-300/20 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h3 className="inline-flex items-center gap-2 font-semibold text-white">
                <IconBox size={18} />
                Cofres
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                Automatico cada {chestState.chestScheduler.intervalMinutes} minutos y activo por{" "}
                {chestState.chestScheduler.durationSeconds} segundos.
              </p>
              {chestState.chest ? (
                <p className="mt-2 text-sm font-semibold text-green-300">
                  Hay un cofre activo para reclamar.
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onActivateChest}
              disabled={isPending || Boolean(chestState.chest)}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-sm font-black text-amber-100 transition hover:-translate-y-0.5 hover:bg-amber-400/20 focus:outline-none focus:ring-2 focus:ring-amber-300/40 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-neutral-950 disabled:text-neutral-600 lg:w-auto"
            >
              <IconBox size={17} />
              Activar cofre
            </button>
          </div>

          <div className="grid gap-3 rounded-2xl border border-white/10 bg-neutral-900/65 p-4 shadow-lg shadow-black/10 transition hover:border-green-300/20 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h3 className="inline-flex items-center gap-2 font-semibold text-white">
                <IconMessageCircle size={18} />
                Recompensa de Chat
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                Manual, dura 60 segundos y solo la puede reclamar una persona.
              </p>
              {chestState.chatReward ? (
                <p className="mt-2 text-sm font-semibold text-green-300">
                  Hay una recompensa de chat activa.
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onActivateChatReward}
              disabled={isPending || Boolean(chestState.chatReward)}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-green-300/30 bg-green-400/10 px-4 py-3 text-sm font-black text-green-100 transition hover:-translate-y-0.5 hover:bg-green-400/20 focus:outline-none focus:ring-2 focus:ring-green-300/40 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-neutral-950 disabled:text-neutral-600 lg:w-auto"
            >
              <IconMessageCircle size={17} />
              Activar recompensa
            </button>
          </div>
        </div>
      </section>

      <StreamDangerPanel
        isPending={isPending}
        liveStatus={liveStatus}
        streamHour={state}
        onResetRankingPoints={onResetRankingPoints}
      />
    </div>
  );
}

function formatLiveStatus(liveStatus) {
  if (!liveStatus) return "Sin datos";
  if (liveStatus.isLive) return "En vivo";
  if (liveStatus.status === "unknown") return "Desconocido";
  return "Offline";
}

function formatLiveMode(liveStatus) {
  if (!liveStatus) return "Esperando lectura";
  if (liveStatus.manualOverride === true) return "Override manual online";
  if (liveStatus.manualOverride === false) return "Override manual offline";
  return `Detector: ${liveStatus.status || "auto"}`;
}

function StreamDangerPanel({
  isPending,
  liveStatus,
  streamHour,
  onResetRankingPoints,
}) {
  const live = Boolean(liveStatus?.isLive);

  return (
    <aside className="h-fit rounded-2xl border border-red-300/20 bg-red-950/20 p-4 shadow-xl shadow-black/20 ring-1 ring-red-300/[0.04]">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-red-300/25 bg-red-500/10 text-red-100">
          <IconAlertTriangle size={21} />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-300/80">
            Zona de peligro
          </p>
          <h3 className="mt-1 text-base font-black text-white">Estado del stream</h3>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <div className="rounded-xl border border-white/10 bg-neutral-950/70 p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-neutral-400">Kick</span>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-black ${
                live
                  ? "border-green-300/30 bg-green-400/10 text-green-100"
                  : "border-red-300/25 bg-red-500/10 text-red-100"
              }`}
            >
              {formatLiveStatus(liveStatus)}
            </span>
          </div>
          <p className="mt-2 text-xs font-medium text-neutral-500">
            {formatLiveMode(liveStatus)}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-neutral-950/70 p-3">
          <p className="text-sm font-semibold text-neutral-400">Bonus activo</p>
          <p className="mt-1 text-lg font-black text-white">
            {streamHour.activeLabel || "Sin hora especial"}
          </p>
          <p className="mt-1 text-xs font-medium text-neutral-500">
            {streamHour.hasManualOverride || streamHour.mode === "manual"
              ? "Control manual"
              : "Control automatico"}
          </p>
        </div>

        <button
          type="button"
          onClick={onResetRankingPoints}
          disabled={isPending}
          className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-300/35 bg-red-500/15 px-4 py-3 text-sm font-black text-red-100 transition hover:-translate-y-0.5 hover:border-red-200/50 hover:bg-red-500/25 focus:outline-none focus:ring-2 focus:ring-red-300/45 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <IconRefreshAlert size={18} />
          Reiniciar puntos
        </button>
      </div>
    </aside>
  );
}

function AutoDisableToggle({ checked, expiresAt, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/10 bg-neutral-900/65 p-4 shadow-lg shadow-black/10 transition hover:border-red-300/20 focus-within:ring-2 focus-within:ring-red-300/40">
      <span className="flex min-w-0 items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-red-300/25 bg-red-500/10 text-red-100">
          <IconClockCog size={19} />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-black text-white">
            Apagar automaticamente despues de 1 hora
          </span>
          <span className="mt-0.5 block text-xs font-medium text-neutral-500">
            Las horas especiales vuelven a puntos normales al terminar el tiempo.
          </span>
          {expiresAt ? (
            <span className="mt-1 block text-xs font-semibold text-red-200/80">
              Se apaga: {new Date(expiresAt).toLocaleString("es-AR")}
            </span>
          ) : null}
        </span>
      </span>
      <span
        className={`relative h-8 w-14 shrink-0 rounded-full border transition ${
          checked
            ? "border-red-300/45 bg-red-500"
            : "border-white/10 bg-neutral-800"
        }`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="sr-only"
        />
        <span
          className={`absolute top-1 size-6 rounded-full bg-white shadow-sm transition ${
            checked ? "left-7" : "left-1"
          }`}
        />
      </span>
    </label>
  );
}
