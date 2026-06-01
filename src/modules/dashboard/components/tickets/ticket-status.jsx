export function StatusBadge({ status }) {
  const closed = status === "closed";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-black ${
        closed
          ? "border-green-300/25 bg-green-400/10 text-green-200"
          : "border-amber-300/25 bg-amber-400/10 text-amber-100"
      }`}
    >
      {formatTicketStatus(status)}
    </span>
  );
}

export function formatTicketStatus(status) {
  if (status === "closed") return "Cerrado";
  if (status === "in_progress") return "En proceso";
  return "Abierto";
}

export function TicketEmptyState({ children }) {
  return (
    <p className="rounded-2xl border border-white/10 bg-neutral-900/60 p-8 text-center text-neutral-400 shadow-inner shadow-black/10">
      {children}
    </p>
  );
}
