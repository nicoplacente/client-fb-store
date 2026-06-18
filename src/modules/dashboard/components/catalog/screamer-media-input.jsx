import { useEffect, useRef, useState } from "react";
import {
  IconArrowDown,
  IconArrowUp,
  IconFileMusic,
  IconLink,
  IconPhotoUp,
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { createEmptyScreamerOption } from "../../lib/constants";
import { Field, TextInput } from "../form-controls";

function useMediaPreview(file, url) {
  const [previewUrl, setPreviewUrl] = useState(url);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(url);
      return undefined;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file, url]);

  return previewUrl;
}

function FilePicker({ accept, description, file, icon, label, onClear, onFileChange }) {
  const inputRef = useRef(null);

  function clearFile() {
    if (inputRef.current) inputRef.current.value = "";
    onClear();
  }

  return (
    <div className="grid gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDrop={(event) => {
          event.preventDefault();
          onFileChange(event.dataTransfer.files?.[0] || null);
        }}
        onDragOver={(event) => event.preventDefault()}
        className="grid min-h-28 cursor-pointer place-items-center rounded-xl border border-dashed border-white/15 bg-neutral-950/55 px-4 py-5 text-center transition hover:border-red-300/45 hover:bg-red-500/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300/60"
      >
        <span className="grid justify-items-center gap-2">
          {icon}
          <span className="text-sm font-black text-white">{label}</span>
          <span className="text-xs font-medium text-neutral-500">{description}</span>
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => onFileChange(event.target.files?.[0] || null)}
      />
      {file ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-300/20 bg-red-500/10 px-3 py-2">
          <span className="min-w-0 truncate text-xs font-bold text-red-100">{file.name}</span>
          <button
            type="button"
            onClick={clearFile}
            className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg text-red-100 transition hover:bg-red-500/20 focus:outline-none"
            aria-label={`Quitar ${label.toLowerCase()}`}
          >
            <IconX size={16} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ScreamerOptionEditor({ option, index, total, onChange, onMove, onRemove }) {
  const gifPreviewUrl = useMediaPreview(option.gifFile, option.gifUrl);
  const audioPreviewUrl = useMediaPreview(option.audioFile, option.audioUrl);

  return (
    <article className="grid gap-4 rounded-2xl border border-white/10 bg-neutral-950/65 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-red-200/70">
            Opción {index + 1}
          </p>
          <p className="mt-1 text-xs text-neutral-500">El GIF y el audio se enviarán siempre juntos.</p>
        </div>
        <div className="flex items-center gap-1">
          <OptionButton
            label="Mover opción hacia arriba"
            disabled={index === 0}
            onClick={() => onMove(index, index - 1)}
          >
            <IconArrowUp size={16} />
          </OptionButton>
          <OptionButton
            label="Mover opción hacia abajo"
            disabled={index === total - 1}
            onClick={() => onMove(index, index + 1)}
          >
            <IconArrowDown size={16} />
          </OptionButton>
          <OptionButton label="Eliminar opción" onClick={onRemove} danger>
            <IconTrash size={16} />
          </OptionButton>
        </div>
      </div>

      <Field label="Nombre de la opción">
        <TextInput
          value={option.name}
          maxLength={80}
          placeholder={`Ej: Screamer ${index + 1}`}
          onChange={(event) => onChange({ name: event.target.value })}
          className="w-full"
          required
        />
      </Field>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="grid content-start gap-3">
          <FilePicker
            accept="image/gif,image/webp"
            description="GIF o WEBP animado, hasta 15MB."
            file={option.gifFile}
            icon={<IconPhotoUp size={32} className="text-neutral-600" />}
            label="Seleccionar animación"
            onClear={() => onChange({ gifFile: null })}
            onFileChange={(gifFile) => onChange({ gifFile })}
          />
          <MediaUrlField
            label="O usar URL de la animación"
            value={option.gifUrl}
            placeholder="https://.../screamer.gif"
            onChange={(gifUrl) => onChange({ gifUrl })}
          />
          {gifPreviewUrl ? (
            <div className="aspect-video overflow-hidden rounded-xl border border-white/10 bg-black">
              <img
                src={gifPreviewUrl}
                alt={`Vista previa de ${option.name || `opción ${index + 1}`}`}
                className="h-full w-full object-contain"
              />
            </div>
          ) : null}
        </div>

        <div className="grid content-start gap-3">
          <FilePicker
            accept="audio/mpeg,audio/ogg,audio/wav,audio/mp4"
            description="MP3, OGG, WAV o M4A, hasta 10MB."
            file={option.audioFile}
            icon={<IconFileMusic size={32} className="text-neutral-600" />}
            label="Seleccionar audio"
            onClear={() => onChange({ audioFile: null })}
            onFileChange={(audioFile) => onChange({ audioFile })}
          />
          <MediaUrlField
            label="O usar URL del audio"
            value={option.audioUrl}
            placeholder="https://.../scream.mp3"
            onChange={(audioUrl) => onChange({ audioUrl })}
          />
          {audioPreviewUrl ? (
            <audio controls preload="metadata" src={audioPreviewUrl} className="w-full">
              Tu navegador no puede reproducir este audio.
            </audio>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function MediaUrlField({ label, value, placeholder, onChange }) {
  return (
    <Field label={label}>
      <div className="relative">
        <IconLink
          size={17}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
        />
        <TextInput
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="w-full pl-9"
        />
      </div>
    </Field>
  );
}

function OptionButton({ label, disabled = false, danger = false, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`grid size-9 place-items-center rounded-lg border transition focus:outline-none disabled:cursor-not-allowed disabled:opacity-30 ${
        danger
          ? "border-red-300/15 text-red-200 hover:bg-red-500/15"
          : "border-white/10 text-neutral-400 hover:bg-white/5 hover:text-white"
      }`}
      aria-label={label}
    >
      {children}
    </button>
  );
}

export default function ScreamerMediaInput({ form, setForm }) {
  const options = form.screamerOptions || [];

  function updateOption(index, patch) {
    setForm((current) => ({
      ...current,
      screamerOptions: current.screamerOptions.map((option, optionIndex) =>
        optionIndex === index ? { ...option, ...patch } : option,
      ),
    }));
  }

  function moveOption(fromIndex, toIndex) {
    setForm((current) => {
      const nextOptions = [...current.screamerOptions];
      const [movedOption] = nextOptions.splice(fromIndex, 1);
      nextOptions.splice(toIndex, 0, movedOption);
      return { ...current, screamerOptions: nextOptions };
    });
  }

  function removeOption(index) {
    setForm((current) => ({
      ...current,
      screamerOptions: current.screamerOptions.filter((_, optionIndex) => optionIndex !== index),
    }));
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-black text-white">Opciones del screamer</h4>
          <p className="mt-1 text-xs leading-5 text-neutral-500">
            Cada opción combina una animación y un audio fijo.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setForm((current) => ({
              ...current,
              screamerOptions: [...current.screamerOptions, createEmptyScreamerOption()],
            }))
          }
          className="inline-flex items-center gap-2 rounded-xl border border-red-300/25 bg-red-500/10 px-3 py-2 text-xs font-black text-red-100 transition hover:bg-red-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300/60"
        >
          <IconPlus size={16} />
          Agregar opción
        </button>
      </div>

      {options.length ? (
        <div className="grid gap-4">
          {options.map((option, index) => (
            <ScreamerOptionEditor
              key={option.clientId || option.id}
              option={option}
              index={index}
              total={options.length}
              onChange={(patch) => updateOption(index, patch)}
              onMove={moveOption}
              onRemove={() => removeOption(index)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-red-300/20 bg-red-500/5 p-5 text-center text-sm font-medium text-red-100">
          Agrega al menos una opción para guardar el screamer.
        </div>
      )}
    </div>
  );
}
