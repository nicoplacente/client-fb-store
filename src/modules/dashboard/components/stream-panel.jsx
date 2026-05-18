import { useState } from "react";
import {
  IconBolt,
  IconBox,
  IconClockCog,
  IconMessageCircle,
  IconPower,
  IconPlayerPause,
  IconSparkles,
} from "@tabler/icons-react";

const hourStyles = {
  happy: "border-yellow-300/30 bg-yellow-400/10 text-yellow-100",
  golden: "border-amber-300/30 bg-amber-400/10 text-amber-100",
  netherite: "border-purple-300/30 bg-purple-400/10 text-purple-100",
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
  loading,
  isPending,
  onActivateHour,
  onActivateChest,
  onActivateChatReward,
  onDisableHour,
  onUseAutoHour,
}) {
  const [autoDisable, setAutoDisable] = useState(true);

  if (loading && !streamHour) {
    return (
      <div className="rounded-lg border border-white/10 bg-neutral-950/70 p-8 text-center text-neutral-400">
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
  const chestState = streamRewards || {
    chest: null,
    chatReward: null,
    chestScheduler: {
      intervalMinutes: 45,
      durationSeconds: 60,
    },
  };

  return (
    <section className="space-y-5 rounded-lg border border-white/10 bg-neutral-950/70 p-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
        <div>
          <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-white">
            <IconClockCog size={19} />
            Stream
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-neutral-400">
            Controla la hora especial que modifica puntos de watchtime y chat.
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-neutral-900/70 p-4">
          <p className="text-xs font-semibold uppercase text-neutral-500">Activo ahora</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-xl font-bold text-white">{state.activeLabel}</span>
            <span className="rounded-md border border-white/10 bg-neutral-950 px-2 py-1 text-xs font-semibold text-neutral-400">
              {isManual ? "Manual" : "Auto"}
            </span>
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            Automatico: {state.automaticLabel || "Sin hora especial"}
          </p>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {state.hours.map((hour) => {
          const active = isManual && state.active === hour.id;

          return (
            <button
              key={hour.id}
              type="button"
              disabled={isPending}
              onClick={() => onActivateHour(hour.id, { autoDisable })}
              className={`grid gap-4 rounded-lg border p-4 text-left transition hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-60 ${
                active
                  ? hourStyles[hour.id] || "border-red-300/30 bg-red-500/10 text-red-100"
                  : "border-white/10 bg-neutral-900/70 text-neutral-300"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 font-bold">
                  <IconSparkles size={18} />
                  {hour.label}
                </span>
                {active ? (
                  <span className="rounded-md bg-white/10 px-2 py-1 text-xs font-semibold">
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
        <div className="grid gap-3 rounded-lg border border-white/10 bg-neutral-900/60 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
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
            className="inline-flex items-center justify-center gap-2 rounded-md border border-yellow-300/30 bg-yellow-400/10 px-4 py-2 text-sm font-bold text-yellow-100 transition hover:bg-yellow-400/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-neutral-950 disabled:text-neutral-600"
          >
            <IconBox size={17} />
            Activar cofre
          </button>
        </div>

        <div className="grid gap-3 rounded-lg border border-white/10 bg-neutral-900/60 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
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
            className="inline-flex items-center justify-center gap-2 rounded-md border border-green-300/30 bg-green-400/10 px-4 py-2 text-sm font-bold text-green-100 transition hover:bg-green-400/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-neutral-950 disabled:text-neutral-600"
          >
            <IconMessageCircle size={17} />
            Activar recompensa
          </button>
        </div>
      </div>

      <div className="grid gap-3 rounded-lg border border-white/10 bg-neutral-900/60 p-4 lg:grid-cols-[1fr_auto_auto] lg:items-center">
        <div>
          <h3 className="font-semibold text-white">Control de modo</h3>
          <p className="mt-1 text-sm text-neutral-500">
            Forza puntos normales o vuelve a usar la configuracion automatica del server.
          </p>
          <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-neutral-300">
            <input
              type="checkbox"
              checked={autoDisable}
              onChange={(event) => setAutoDisable(event.target.checked)}
              className="size-4 accent-red-500"
            />
            Apagar automaticamente despues de 1 hora
          </label>
          {state.expiresAt ? (
            <p className="mt-2 text-xs text-neutral-500">
              Se apaga: {new Date(state.expiresAt).toLocaleString("es-AR")}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onDisableHour}
          disabled={isPending || (isManual && !state.active)}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-neutral-950 px-4 py-2 text-sm font-bold text-white transition hover:border-red-400/50 disabled:cursor-not-allowed disabled:text-neutral-600"
        >
          <IconPower size={17} />
          Sin bonus
        </button>
        <button
          type="button"
          onClick={onUseAutoHour}
          disabled={isPending || !isManual}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-neutral-950 px-4 py-2 text-sm font-bold text-white transition hover:border-red-400/50 disabled:cursor-not-allowed disabled:text-neutral-600"
        >
          <IconPlayerPause size={17} />
          Usar auto
        </button>
      </div>
    </section>
  );
}
