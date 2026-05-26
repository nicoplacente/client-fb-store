import { IconDeviceFloppy, IconPlus, IconX } from "@tabler/icons-react";

export function Field({ label, children }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-neutral-300">
      {label}
      {children}
    </label>
  );
}

export function TextInput({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`rounded-xl border border-white/10 bg-neutral-900/90 px-3 py-2.5 text-white shadow-inner shadow-black/10 outline-none transition placeholder:text-neutral-600 hover:border-red-300/25 focus:border-red-300/60 focus:ring-2 focus:ring-red-300/15 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    />
  );
}

export function TextArea(props) {
  return (
    <textarea
      {...props}
      className="resize-none rounded-xl border border-white/10 bg-neutral-900/90 px-3 py-2.5 text-white shadow-inner shadow-black/10 outline-none transition placeholder:text-neutral-600 hover:border-red-300/25 focus:border-red-300/60 focus:ring-2 focus:ring-red-300/15 disabled:cursor-not-allowed disabled:opacity-60"
    />
  );
}

export function SelectInput(props) {
  return (
    <select
      {...props}
      className="cursor-pointer rounded-xl border border-white/10 bg-neutral-900/90 px-3 py-2.5 text-white shadow-inner shadow-black/10 outline-none transition hover:border-red-300/25 focus:border-red-300/60 focus:ring-2 focus:ring-red-300/15 disabled:cursor-not-allowed disabled:opacity-60"
    />
  );
}

export function PanelHeader({ title, subtitle, canCancel, onCancel }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3 border-b border-white/10 pb-5">
      <div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
      </div>
      {canCancel ? (
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer rounded-md border border-white/10 bg-neutral-900 p-2 text-neutral-400 transition hover:border-red-300/35 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-300/40"
          aria-label="Cancelar edicion"
        >
          <IconX size={18} />
        </button>
      ) : null}
    </div>
  );
}

export function SubmitButton({ isPending, selectedId }) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-red-950/25 transition hover:-translate-y-0.5 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-300/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
    >
      {selectedId ? <IconDeviceFloppy size={18} /> : <IconPlus size={18} />}
      {selectedId ? "Guardar cambios" : "Crear"}
    </button>
  );
}
