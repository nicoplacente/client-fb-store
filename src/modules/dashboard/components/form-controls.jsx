import { IconDeviceFloppy, IconPlus, IconX } from "@tabler/icons-react";

export function Field({ label, children }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-neutral-300">
      {label}
      {children}
    </label>
  );
}

export function TextInput(props) {
  return (
    <input
      {...props}
      className="rounded-md border border-white/10 bg-neutral-900 px-3 py-2 text-white outline-none transition focus:border-red-400"
    />
  );
}

export function TextArea(props) {
  return (
    <textarea
      {...props}
      className="resize-none rounded-md border border-white/10 bg-neutral-900 px-3 py-2 text-white outline-none transition focus:border-red-400"
    />
  );
}

export function SelectInput(props) {
  return (
    <select
      {...props}
      className="rounded-md border border-white/10 bg-neutral-900 px-3 py-2 text-white outline-none transition focus:border-red-400"
    />
  );
}

export function PanelHeader({ title, subtitle, canCancel, onCancel }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="text-sm text-neutral-500">{subtitle}</p>
      </div>
      {canCancel ? (
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-white/10 p-2 text-neutral-400 transition hover:text-white"
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
      className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {selectedId ? <IconDeviceFloppy size={18} /> : <IconPlus size={18} />}
      {selectedId ? "Guardar cambios" : "Crear"}
    </button>
  );
}
