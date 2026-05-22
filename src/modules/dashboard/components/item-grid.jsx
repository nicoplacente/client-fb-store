export default function ItemGrid({ loading, emptyText, items, renderItem }) {
  return (
    <div className="rounded-lg border border-white/10 bg-neutral-950/70 p-5">
      {loading ? (
        <div className="rounded-lg border border-white/10 bg-neutral-900/60 p-8 text-center text-neutral-400">
          Cargando...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-neutral-900/60 p-8 text-center text-neutral-400">
          {emptyText}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {items.map(renderItem)}
        </div>
      )}
    </div>
  );
}
