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
      const res = await fetch(`${envConfig.API_RANKING}`);
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
      <table
        className="max-w-5xl w-full mx-auto table border-separate rounded-xl overflow-hidden shadow-2xl"
        style={{ borderSpacing: "0 4px" }}
      >
        <thead className="bg-neutral-900">
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
        <tbody className="">
          {!ranking ? (
            <tr>
              <td colSpan={7} className="p-2 text-center">
                Cargando...
              </td>
            </tr>
          ) : filteredRanking.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-2 text-center">
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
                  className={`bg-gradient-to-r w-full from-neutral-800/90 to-neutral-900/70 text-sm backdrop-blur-3xl shadow-2xl [&>td]:text-center [&>td]:px-2  ${
                    index > 2 ? "[&>td]:py-1.5" : "[&>td]:py-5"
                  }  `}
                >
                  <td className="flex gap-2 items-center">
                    <span className="text-neutral-500 font-bold">
                      {index > 2 ? (
                        <span className="w-9 block text-center">
                          {startIndex + index + 1}
                        </span>
                      ) : (
                        <span className="w-9 block text-center">
                          {rankIcon}
                        </span>
                      )}
                    </span>
                    <span className="w-full text-start font-semibold">
                      {user.username}
                    </span>
                  </td>
                  <td>{`${hours}h ${minutes}m`}</td>
                  <td>{user.totalPoints}</td>
                  <td>{user.chests}</td>
                  <td>{user.streak}</td>
                  <td>{user.totalMessages}</td>
                  <td>{user.recChat}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {ranking && ranking.length > ITEMS_PER_PAGE && (
        <div className="flex mx-auto justify-between items-center gap-3 mt-4 p-2">
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
