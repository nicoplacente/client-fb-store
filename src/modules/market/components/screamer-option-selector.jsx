import { useState } from "react";
import { IconCheck, IconSkull, IconVolume } from "@tabler/icons-react";

export default function ScreamerOptionSelector({ options = [], selectedId, onSelect }) {
  return (
    <fieldset aria-describedby="screamer-options-help">
      <div className="flex items-center justify-between gap-3">
        <legend className="flex items-center gap-2 text-sm font-black text-red-100">
          <IconSkull size={18} />
          Elegí el screamer
        </legend>
        <span className="text-xs font-bold text-neutral-500">
          {options.length} {options.length === 1 ? "opción" : "opciones"}
        </span>
      </div>
      <p id="screamer-options-help" className="mt-2 text-xs leading-5 text-neutral-500">
        Previsualizá los pares y seleccioná uno antes de canjear.
      </p>

      {options.length ? (
        <div className="mt-4 grid max-h-[28rem] gap-3 overflow-y-auto pr-1">
          {options.map((option) => (
            <ScreamerOptionCard
              key={option.id}
              option={option}
              selected={String(option.id) === String(selectedId)}
              onSelect={() => onSelect(option.id)}
            />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-red-300/20 bg-red-500/5 p-4 text-sm leading-6 text-red-100">
          Este producto no tiene opciones disponibles.
        </div>
      )}
    </fieldset>
  );
}

function ScreamerOptionCard({ option, selected, onSelect }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <label
      className={`group grid cursor-pointer gap-3 rounded-2xl border p-3 transition focus-within:ring-2 focus-within:ring-red-300/60 ${
        selected
          ? "border-red-300/55 bg-red-500/12 shadow-lg shadow-red-950/20"
          : "border-white/10 bg-neutral-950/70 hover:border-red-300/30 hover:bg-white/[0.03]"
      }`}
    >
      <input
        type="radio"
        name="screamer-option"
        value={option.id}
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />

      <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black">
        {imageFailed ? (
          <div className="grid h-full place-items-center px-4 text-center text-xs font-semibold text-neutral-500">
            No se pudo cargar la animación.
          </div>
        ) : (
          <img
            src={option.gifUrl}
            alt={`Vista previa de ${option.name}`}
            className="h-full w-full object-contain"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        )}
        <span
          className={`absolute right-2 top-2 grid size-7 place-items-center rounded-full border transition ${
            selected
              ? "border-red-200/60 bg-red-500 text-white"
              : "border-white/15 bg-black/70 text-transparent"
          }`}
          aria-hidden="true"
        >
          <IconCheck size={15} />
        </span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <strong className="min-w-0 truncate text-sm text-white">{option.name}</strong>
        {selected ? (
          <span className="shrink-0 rounded-full bg-red-500/15 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-red-100">
            Seleccionado
          </span>
        ) : null}
      </div>

      <div className="rounded-xl border border-white/10 bg-black/35 p-2">
        <p className="mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide text-neutral-500">
          <IconVolume size={14} />
          Audio asociado
        </p>
        <audio controls preload="metadata" src={option.audioUrl} className="h-8 w-full">
          Tu navegador no puede reproducir este audio.
        </audio>
      </div>
    </label>
  );
}
