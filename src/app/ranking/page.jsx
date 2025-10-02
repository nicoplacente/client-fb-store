"use client";
import { useEffect, useState } from "react";
import SectionContainer from "@/modules/ui/section-container";
import { ITEMS_PER_PAGE } from "@/modules/ranking/libs/constants";
import RankingSearchBar from "@/modules/ranking/components/ranking-searchbar";
import TH from "@/modules/ranking/ui/th";
import { envConfig } from "@/config";

export default function RankingPage() {
  const [ranking, setRanking] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRanking = ranking
    ? ranking.filter((user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const loadRanking = async () => {
    try {
      const res = await fetch(`${envConfig.SERVER_URL}/ranking`);
      if (!res.ok) throw new Error("Error al cargar ranking");
      const data = await res.json();
      setRanking(data);
    } catch (error) {
      console.error(error);
      setRanking([]);
    }
  };

  useEffect(() => {
    loadRanking();
    const interval = setInterval(loadRanking, 60000);
    setCurrentPage(1);
    return () => clearInterval(interval);
  }, [searchTerm]);

  const totalPages = filteredRanking
    ? Math.ceil(filteredRanking.length / ITEMS_PER_PAGE)
    : 1;

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedRanking = filteredRanking.slice(startIndex, endIndex);

  const getRankIcon = (index) => {
    if (index === 0) return "👑";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return null;
  };

  return (
    <SectionContainer>
      <h1 className="text-center mb-5 text-2xl font-bold mt-5">Ranking</h1>

      <table className="w-2/3 mx-auto bg-[#1c1c1c]">
        <thead>
          <tr>
            <TH>
              <RankingSearchBar onSearch={setSearchTerm} />
            </TH>
            <TH>Watchtime</TH>
            <TH>Puntos</TH>
            <TH>Cofres</TH>
            <TH>Racha</TH>
            <TH>Mensajes</TH>
            <TH>Rec. Chat</TH>
          </tr>
        </thead>
        <tbody>
          {!ranking ? (
            <tr>
              <td colSpan={7} className="p-3 text-center">
                Cargando...
              </td>
            </tr>
          ) : filteredRanking.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-3 text-center">
                No se encontraron usuarios
              </td>
            </tr>
          ) : (
            paginatedRanking.map((user, index) => {
              const totalMinutes = Math.floor((user.watchTimePoints / 48) * 10);
              const hours = Math.floor(totalMinutes / 60);
              const minutes = totalMinutes % 60;

              const rankIcon = getRankIcon(startIndex + index);

              return (
                <tr
                  key={user.username}
                  className="even:bg-[#181818] border-b border-[#333]"
                >
                  <td className="flex gap-2 items-center p-3">
                    <span className="text-yellow-400 font-bold">
                      {startIndex + index + 1}
                    </span>
                    {rankIcon && <span>{rankIcon}</span>}
                    <span className="w-full">{user.username}</span>
                  </td>
                  <td className="p-3">{`${hours}h ${minutes}m`}</td>
                  <td className="p-3">{user.totalPoints}</td>
                  <td className="p-3">{user.chests}</td>
                  <td className="p-3">{user.streak}</td>
                  <td className="p-3">{user.totalMessages}</td>
                  <td className="p-3">{user.recChat}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {ranking && ranking.length > ITEMS_PER_PAGE && (
        <div className="flex w-2/3 mx-auto justify-between items-center gap-3 mt-4 p-2">
          <div>
            <span className="text-sm">
              Página {currentPage} de {totalPages}
            </span>
          </div>
          <div>
            <button
              className="px-3 py-1 bg-[#222] rounded disabled:opacity-50 cursor-pointer"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              ⬅
            </button>
            <span className="p-4">{currentPage}</span>
            <button
              className="px-3 py-1 bg-[#222] rounded disabled:opacity-50 cursor-pointer"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              ➡
            </button>
          </div>
        </div>
      )}
    </SectionContainer>
  );
}
