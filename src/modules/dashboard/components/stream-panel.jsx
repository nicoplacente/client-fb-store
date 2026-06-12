import { useState } from "react";
import {
  IconBolt,
  IconBox,
  IconClockCog,
  IconChartPie,
  IconDeviceFloppy,
  IconMessageCircle,
  IconPlus,
  IconPower,
  IconSparkles,
  IconTrash,
} from "@tabler/icons-react";
import {
  Field,
  FormattedNumberInput,
  TextArea,
  TextInput,
} from "./form-controls";

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

function formatSchedulerTime(value) {
  if (!value) return null;

  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) return null;

  return date.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function StreamPanel({
  streamHour,
  streamRewards,
  loading,
  isPending,
  onActivateHour,
  onActivateChest,
  onActivateChatReward,
  onCreatePrediction,
  onResolvePrediction,
  onDisableHour,
  predictions = [],
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
      streamOnlineSince: null,
      nextCheckAt: null,
    },
  };
  const nextChestTime = formatSchedulerTime(chestState.chestScheduler.nextCheckAt);

  return (
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
            className={`grid cursor-pointer gap-4 rounded-2xl border p-4 text-left shadow-lg shadow-black/10 transition hover:-translate-y-1 hover:border-white/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${
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
                className={`grid cursor-pointer gap-4 rounded-2xl border p-4 text-left shadow-lg shadow-black/10 transition hover:-translate-y-1 hover:border-white/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${
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
                Automatico cada {chestState.chestScheduler.intervalMinutes} minutos desde que el stream esta online y activo por{" "}
                {chestState.chestScheduler.durationSeconds} segundos.
              </p>
              {nextChestTime ? (
                <p className="mt-2 text-sm font-semibold text-amber-200">
                  Proximo cofre automatico: {nextChestTime}.
                </p>
              ) : null}
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
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-sm font-black text-amber-100 transition hover:-translate-y-0.5 hover:bg-amber-400/20 focus:outline-none disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-neutral-950 disabled:text-neutral-600 lg:w-auto"
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
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-green-300/30 bg-green-400/10 px-4 py-3 text-sm font-black text-green-100 transition hover:-translate-y-0.5 hover:bg-green-400/20 focus:outline-none disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-neutral-950 disabled:text-neutral-600 lg:w-auto"
            >
              <IconMessageCircle size={17} />
              Activar recompensa
            </button>
          </div>
        </div>

        <StreamPredictionsPanel
          isPending={isPending}
          predictions={predictions}
          onCreatePrediction={onCreatePrediction}
          onResolvePrediction={onResolvePrediction}
        />
    </section>
  );
}

function AutoDisableToggle({ checked, expiresAt, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/10 bg-neutral-900/65 p-4 shadow-lg shadow-black/10 transition hover:border-red-300/20">
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

const defaultPredictionOptions = ["", ""];

function StreamPredictionsPanel({
  isPending,
  predictions,
  onCreatePrediction,
  onResolvePrediction,
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    payoutMultiplier: "2",
    durationMinutes: "1",
    minBetPoints: "1",
    maxBetPoints: "",
    options: defaultPredictionOptions,
  });

  const activePredictions = predictions.filter(
    (prediction) => prediction.status === "active" || !prediction.resolvedAt,
  );

  function updateOption(index, value) {
    setForm((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) =>
        optionIndex === index ? value : option,
      ),
    }));
  }

  function addOption() {
    setForm((current) => {
      if (current.options.length >= 10) return current;

      return {
        ...current,
        options: [...current.options, ""],
      };
    });
  }

  function removeOption(index) {
    setForm((current) => {
      if (current.options.length <= 2) return current;

      return {
        ...current,
        options: current.options.filter((_, optionIndex) => optionIndex !== index),
      };
    });
  }

  function submitPrediction(event) {
    event.preventDefault();

    onCreatePrediction?.({
      title: form.title,
      description: form.description,
      payoutMultiplier: form.payoutMultiplier,
      durationMinutes: form.durationMinutes,
      minBetPoints: form.minBetPoints,
      maxBetPoints: form.maxBetPoints,
      options: form.options,
    });

    setForm({
      title: "",
      description: "",
      payoutMultiplier: "2",
      durationMinutes: "2",
      minBetPoints: "1",
      maxBetPoints: "",
      options: defaultPredictionOptions,
    });
  }

  return (
    <div className="grid gap-4 rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(220,38,38,0.08),rgba(23,23,23,0.78))] p-4 shadow-lg shadow-black/10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.82fr)]">
      <div>
        <h3 className="inline-flex items-center gap-2 font-semibold text-white">
          <IconChartPie size={18} />
          Predicciones del stream
        </h3>
        <p className="mt-1 text-sm text-neutral-500">
          Crea polls con 2 a 10 opciones. Por defecto el ganador cobra x2, pero
          podes ajustar el multiplicador antes de publicar.
        </p>

        <form onSubmit={submitPrediction} className="mt-4 grid gap-4">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_8rem_8rem]">
            <Field label="Titulo">
              <TextInput
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Quien gana el 1er mapa?"
                required
              />
            </Field>

            <Field label="Pago ganador">
              <FormattedNumberInput
                value={form.payoutMultiplier}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    payoutMultiplier: value,
                  }))
                }
                allowDecimals
                decimalScale={2}
                aria-label="Multiplicador de pago ganador"
              />
            </Field>

            <Field label="Timer min">
              <FormattedNumberInput
                value={form.durationMinutes}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    durationMinutes: value,
                  }))
                }
                aria-label="Duracion de la prediccion en minutos"
              />
            </Field>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Apuesta minima">
              <FormattedNumberInput
                value={form.minBetPoints}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    minBetPoints: value,
                  }))
                }
                aria-label="Apuesta minima en puntos"
              />
            </Field>

            <Field label="Apuesta maxima">
              <FormattedNumberInput
                value={form.maxBetPoints}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    maxBetPoints: value,
                  }))
                }
                placeholder="Sin limite"
                aria-label="Apuesta maxima en puntos"
              />
            </Field>
          </div>

          <Field label="Descripcion">
            <TextArea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              rows={3}
              placeholder="Contexto opcional para los viewers."
            />
          </Field>

          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-neutral-300">Opciones</p>
              <button
                type="button"
                onClick={addOption}
                disabled={form.options.length >= 10}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-neutral-900/80 px-3 py-2 text-xs font-black text-neutral-200 transition hover:border-red-300/30 hover:text-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <IconPlus size={15} />
                Agregar
              </button>
            </div>

            <div className="grid gap-2">
              {form.options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <TextInput
                    value={option}
                    onChange={(event) => updateOption(index, event.target.value)}
                    placeholder={`Opcion ${index + 1}`}
                    required
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    disabled={form.options.length <= 2}
                    className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-xl border border-white/10 bg-neutral-900/80 text-neutral-500 transition hover:border-red-300/30 hover:text-red-100 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={`Quitar opcion ${index + 1}`}
                  >
                    <IconTrash size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-300/20 bg-gradient-to-r from-red-700 to-red-500 px-5 py-3 text-sm font-black text-white shadow-[0_16px_34px_rgba(255,45,45,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(255,45,45,0.30)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IconDeviceFloppy size={18} />
            Crear prediccion
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-white/10 bg-neutral-950/55 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Activas y pendientes
        </p>
        <div className="mt-3 grid gap-3">
          {activePredictions.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/10 bg-neutral-900/45 p-4 text-sm text-neutral-500">
              Todavia no hay predicciones publicadas para el stream.
            </p>
          ) : (
            activePredictions.slice(0, 4).map((prediction) => (
              <div
                key={prediction.id}
                className="rounded-xl border border-white/10 bg-neutral-900/70 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-white">{prediction.title}</p>
                    <p className="mt-1 text-xs text-neutral-500">
                      Pool {formatPoints(prediction.totalPool)} pts · x
                      {formatPredictionMultiplier(prediction.payoutMultiplier)}
                    </p>
                    <p className="mt-1 text-xs text-neutral-600">
                      Cierra {formatPredictionCountdown(prediction.endsAt)}
                    </p>
                  </div>
                  <span className="rounded-full border border-green-300/25 bg-green-400/10 px-2 py-1 text-[10px] font-black uppercase text-green-200">
                    {prediction.status}
                  </span>
                </div>
                {!prediction.resolvedAt ? (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {prediction.options.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => onResolvePrediction?.(prediction.id, option.id)}
                        disabled={isPending}
                        className="cursor-pointer rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs font-bold text-neutral-300 transition hover:border-green-300/30 hover:text-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Gana {option.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function formatPoints(value) {
  return new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatPredictionCountdown(value) {
  if (!value) return "manual";

  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) return "manual";

  return date.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPredictionMultiplier(value) {
  return Number(value || 2).toLocaleString("es-AR", {
    maximumFractionDigits: 2,
  });
}
