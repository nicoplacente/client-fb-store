export default function RankingSearchBar({ onSearch }) {
  return (
    <div>
      <input
        type="text"
        placeholder="Buscar usuario"
        className="px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-white/70"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
}
