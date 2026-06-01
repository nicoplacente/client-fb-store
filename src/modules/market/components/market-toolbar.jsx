import { IconChevronDown, IconSearch } from "@tabler/icons-react";

export default function MarketToolbar({
  query,
  category,
  categories,
  onQueryChange,
  onCategoryChange,
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(220,38,38,0.16),rgba(10,10,10,0.72)_38%,rgba(10,10,10,0.88))] p-4 shadow-2xl shadow-black/25 ring-1 ring-white/[0.03] sm:p-6">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-red-200/45 to-transparent" />
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-red-300/80">
            Tienda
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
            Recompensas listas para la comunidad
          </h1>
          <p className="mt-3 max-w-2xl text-neutral-400">
            Explora productos, codigos y beneficios disponibles. Filtra rapido y canjea con tus creditos.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <label className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-neutral-950/80 px-3 py-2.5 text-neutral-400 shadow-inner shadow-black/20 transition focus-within:border-red-300/50 focus-within:ring-2 focus-within:ring-red-300/10 sm:min-w-72">
            <IconSearch size={18} />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Buscar producto"
              aria-label="Buscar producto"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-neutral-600"
            />
          </label>
          <label className="relative w-full sm:w-auto">
            <select
              value={category}
              onChange={(event) => onCategoryChange(event.target.value)}
              aria-label="Filtrar productos por categoria"
              className="w-full cursor-pointer appearance-none rounded-xl border border-white/10 bg-neutral-950/80 px-3 py-2.5 pr-10 text-sm font-semibold text-white shadow-inner shadow-black/20 outline-none transition hover:border-red-300/30 focus:border-red-300/50 focus:ring-2 focus:ring-red-300/10 sm:w-auto"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === "all" ? "Todas" : item}
                </option>
              ))}
            </select>
            <IconChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
