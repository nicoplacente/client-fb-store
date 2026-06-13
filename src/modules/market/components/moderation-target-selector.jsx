"use client";

import { useDeferredValue, useMemo, useState } from "react";
import {
  IconMessages,
  IconRefresh,
  IconSearch,
  IconUser,
  IconUserPlus,
  IconUsersGroup,
} from "@tabler/icons-react";

const sourceLabels = {
  page: "Página",
  follow: "Seguidor",
  chat: "Chat",
};

export default function ModerationTargetSelector({
  targets,
  loading,
  error,
  mode,
  targetKickId,
  onModeChange,
  onTargetChange,
  onRetry,
}) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const filteredTargets = useMemo(() => {
    const term = deferredQuery.trim().toLowerCase();

    if (!term) return targets;

    return targets.filter((target) =>
      target.username.toLowerCase().includes(term),
    );
  }, [deferredQuery, targets]);

  return (
    <section
      aria-labelledby="moderation-target-title"
      className="mt-4 grid gap-3 border-t border-white/10 pt-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3
            id="moderation-target-title"
            className="text-sm font-black text-white"
          >
            Objetivo del timeout
          </h3>
          <p className="mt-1 text-xs font-medium leading-5 text-neutral-500">
            Elegí una persona de la audiencia o dejá que el sistema seleccione
            una al azar.
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-neutral-950 px-3 py-1 text-xs font-black text-neutral-400">
          {targets.length} disponibles
        </span>
      </div>

      <TargetOption
        active={mode === "random"}
        icon={<IconUsersGroup size={18} />}
        title="Elegir usuario aleatorio"
        description="El servidor elegirá entre todos los candidatos válidos."
        onClick={() => onModeChange("random")}
      />

      <div className="relative">
        <IconSearch
          size={17}
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar usuario"
          className="h-11 w-full rounded-xl border border-white/10 bg-neutral-950 pl-10 pr-3 text-sm font-medium text-white outline-none transition placeholder:text-neutral-600 focus:border-red-300/45"
          aria-label="Buscar usuario para aplicar el timeout"
        />
      </div>

      <TargetListState
        loading={loading}
        error={error}
        targets={filteredTargets}
        mode={mode}
        targetKickId={targetKickId}
        onRetry={onRetry}
        onSelect={(kickId) => {
          onModeChange("selected");
          onTargetChange(kickId);
        }}
      />
    </section>
  );
}

function TargetListState({
  loading,
  error,
  targets,
  mode,
  targetKickId,
  onRetry,
  onSelect,
}) {
  if (loading) {
    return (
      <p
        role="status"
        className="rounded-xl border border-white/10 bg-neutral-950 p-4 text-sm font-medium text-neutral-400"
      >
        Cargando usuarios disponibles...
      </p>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="flex items-center justify-between gap-3 rounded-xl border border-red-300/20 bg-red-500/10 p-3"
      >
        <p className="text-sm font-medium text-red-100">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-red-300/25 bg-red-500/10 px-3 py-2 text-xs font-black text-red-100 transition hover:bg-red-500/20 focus:outline-none"
        >
          <IconRefresh size={15} />
          Reintentar
        </button>
      </div>
    );
  }

  if (!targets.length) {
    return (
      <p className="rounded-xl border border-white/10 bg-neutral-950 p-4 text-sm font-medium leading-6 text-neutral-500">
        No hay usuarios que coincidan con la búsqueda.
      </p>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Usuario específico para el timeout"
      className="grid max-h-72 gap-2 overflow-y-auto pr-1"
    >
      {targets.map((target) => (
        <button
          key={target.kickId}
          type="button"
          role="radio"
          aria-checked={
            mode === "selected" && targetKickId === target.kickId
          }
          onClick={() => onSelect(target.kickId)}
          className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 text-left transition focus:outline-none ${
            mode === "selected" && targetKickId === target.kickId
              ? "border-red-300/45 bg-red-500/12"
              : "border-white/10 bg-neutral-950 hover:border-white/20 hover:bg-white/[0.03]"
          }`}
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-neutral-900 text-neutral-400">
              <IconUser size={17} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-black text-white">
                {target.username}
              </span>
              <span className="mt-1 flex flex-wrap gap-1.5">
                {target.sources.map((source) => (
                  <SourceBadge key={source} source={source} />
                ))}
              </span>
            </span>
          </span>
          <span
            aria-hidden="true"
            className={`size-4 shrink-0 rounded-full border ${
              mode === "selected" && targetKickId === target.kickId
                ? "border-red-300 bg-red-400 shadow-[inset_0_0_0_3px_rgb(23,23,23)]"
                : "border-white/20 bg-neutral-900"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function TargetOption({ active, icon, title, description, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 text-left transition focus:outline-none ${
        active
          ? "border-red-300/45 bg-red-500/12"
          : "border-white/10 bg-neutral-950 hover:border-white/20 hover:bg-white/[0.03]"
      }`}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-red-300/20 bg-red-500/10 text-red-100">
          {icon}
        </span>
        <span>
          <span className="block text-sm font-black text-white">{title}</span>
          <span className="mt-0.5 block text-xs font-medium text-neutral-500">
            {description}
          </span>
        </span>
      </span>
      <span
        aria-hidden="true"
        className={`size-4 shrink-0 rounded-full border ${
          active
            ? "border-red-300 bg-red-400 shadow-[inset_0_0_0_3px_rgb(23,23,23)]"
            : "border-white/20 bg-neutral-900"
        }`}
      />
    </button>
  );
}

function SourceBadge({ source }) {
  const Icon =
    source === "chat"
      ? IconMessages
      : source === "follow"
        ? IconUserPlus
        : IconUser;

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-bold text-neutral-400">
      <Icon size={11} />
      {sourceLabels[source] || source}
    </span>
  );
}
