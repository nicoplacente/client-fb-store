import { IconSearch } from "@tabler/icons-react";

export default function RankingSearchBar({ value, onSearch }) {
  return (
    <label className="ml-2 flex items-center gap-2 rounded-3xl border border-neutral-700 bg-neutral-950/60 px-3 text-start transition focus-within:border-red-400">
      <IconSearch size={16} aria-hidden="true" className="text-neutral-500" />
      <span className="sr-only">Buscar usuario</span>
      <input
        type="text"
        name="ranking-search"
        autoComplete="off"
        value={value}
        placeholder="Buscar usuario"
        className="w-full bg-transparent py-1.5 text-white/80 outline-none placeholder:text-neutral-600"
        onChange={(event) => onSearch(event.target.value)}
      />
    </label>
  );
}
