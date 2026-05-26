export default function ItemGrid({ loading, emptyText, items, renderItem }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-950/75 p-3 shadow-xl shadow-black/20 ring-1 ring-white/[0.03] sm:p-5">
      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-8 text-center text-neutral-400 shadow-inner shadow-black/10">
          Cargando...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-8 text-center text-neutral-400 shadow-inner shadow-black/10">
          {emptyText}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {items.map(renderItem)}
        </div>
      )}
    </div>
  );
}
