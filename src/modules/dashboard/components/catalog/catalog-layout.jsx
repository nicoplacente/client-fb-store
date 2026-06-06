import { IconPlus } from "@tabler/icons-react";

export function CreateButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-red-950/25 transition hover:-translate-y-0.5 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-300/50 sm:w-fit"
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

export function ModalForm({ children, onSubmit }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-2 sm:items-center sm:p-4">
      <form
        onSubmit={onSubmit}
        role="dialog"
        aria-modal="true"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-neutral-950 p-4 shadow-2xl shadow-black ring-1 ring-white/[0.03] [contain:layout_paint] sm:max-h-[90vh] sm:p-5"
      >
        {children}
      </form>
    </div>
  );
}
