import { IconPlus } from "@tabler/icons-react";

export function CreateButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-300/20 bg-gradient-to-r from-red-700 to-red-500 px-5 py-3 text-sm font-black text-white shadow-[0_16px_34px_rgba(255,45,45,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(255,45,45,0.30)] focus:outline-none focus:ring-2 focus:ring-red-300/50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <IconPlus size={18} />
      {children}
    </button>
  );
}

export function PanelTitle({ title, subtitle, action }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-950/75 p-4 shadow-xl shadow-black/20 ring-1 ring-white/[0.03] sm:flex sm:items-center sm:justify-between sm:gap-4 sm:p-5">
      <div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
      </div>
      <div className="mt-4 sm:mt-0">{action}</div>
    </div>
  );
}

export function ModalForm({ children, onCancel, onSubmit }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-2 sm:items-center sm:p-4"
      onClick={onCancel}
    >
      <form
        onSubmit={onSubmit}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-neutral-950 p-4 shadow-2xl shadow-black ring-1 ring-white/[0.03] [contain:layout_paint] sm:max-h-[90vh] sm:p-5"
      >
        {children}
      </form>
    </div>
  );
}
