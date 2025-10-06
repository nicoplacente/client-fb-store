export default function RankingSearchBar({ onSearch }) {
  return (
    <div className="text-start  border border-neutral-600 ml-2 rounded-3xl">
      <input
        type="text"
        placeholder="Buscar usuario"
        className="px-4 w-full focus:outline-none text-white/70 py-1.5"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
}
