"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { IconAwardFilled, IconCrown } from "@tabler/icons-react";
import SectionContainer from "@/modules/ui/section-container";
import { ITEMS_PER_PAGE } from "@/modules/ranking/libs/constants";
import RankingSearchBar from "@/modules/ranking/components/ranking-searchbar";
import TH from "@/modules/ranking/ui/th";
import { envConfig } from "@/config";

function formatExactNumber(value) {
  return Number(value || 0).toLocaleString("es-AR");
}

function formatRoundedNumber(value) {
  return Math.round(Number(value) || 0).toLocaleString("es-AR");
}

function RoundedStat({ value }) {
  return (
    <span title={formatExactNumber(value)}>{formatRoundedNumber(value)}</span>
  );
}

function getRankLabel(index) {
  if (index === 0) return "#1";
  if (index === 1) return "#2";
  if (index === 2) return "#3";
  return String(index + 1);
}

function RankIndicator({ index }) {
  if (index === 0) {
    return (
      <span className="inline-flex w-10 items-center justify-center">
        <IconCrown
          size={20}
          className="text-yellow-400"
          fill="currentColor"
          stroke={0}
        />
      </span>
    );
  }

  if (index === 1) {
    return (
      <span className="inline-flex w-10 items-center justify-center">
        <IconAwardFilled size={20} className="text-slate-200" />
      </span>
    );
  }

  if (index === 2) {
    return (
      <span className="inline-flex w-10 items-center justify-center">
        <IconAwardFilled size={20} className="text-amber-500" />
      </span>
    );
  }

  return (
    <span className="block w-10 text-center font-bold text-neutral-500">
      {getRankLabel(index)}
    </span>
  );
}

export default function RankingPage() {
  const [ranking, setRanking] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const loadRanking = useCallback(async () => {
    try {
      const res = await fetch(`${envConfig.API_RANKING}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Error al cargar ranking");
      const data = await res.json();
      setRanking(Array.isArray(data) ? data : data.ranking || []);
    } catch (error) {
      console.error(error);
      setRanking([]);
    }
  }, []);

  useEffect(() => {
    loadRanking();
    const interval = setInterval(loadRanking, 60000);
    return () => clearInterval(interval);
  }, [loadRanking]);

  useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearchTerm]);

  const filteredRanking = useMemo(() => {
    if (!ranking) return [];

    const term = deferredSearchTerm.trim().toLowerCase();
    if (!term) return ranking;

    return ranking.filter((user) =>
      String(user.username || "").toLowerCase().includes(term)
    );
  }, [deferredSearchTerm, ranking]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRanking.length / ITEMS_PER_PAGE)
  );

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedRanking = useMemo(
    () => filteredRanking.slice(startIndex, endIndex),
    [endIndex, filteredRanking, startIndex]
  );

  return (
    <SectionContainer className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-red-300/80">
          Ranking
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Tabla de puntos</h1>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-neutral-950/75 p-1 sm:p-2">
        <table
          className="mx-auto w-full min-w-[760px] table border-separate overflow-hidden [border-spacing:0_4px] sm:min-w-[880px]"
        >
          <thead className="bg-neutral-900">
            <tr>
              <TH>
                <RankingSearchBar
                  value={searchTerm}
                  onSearch={setSearchTerm}
                />
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
                <td colSpan={7} className="p-4 text-center text-neutral-400">
                  Cargando...
                </td>
              </tr>
            ) : filteredRanking.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-neutral-400">
                  No se encontraron usuarios
                </td>
              </tr>
            ) : (
              paginatedRanking.map((user, index) => {
                const absoluteIndex = startIndex + index;
                const isPodium = absoluteIndex < 3;
                const watchTimePoints = Number(user.watchTimePoints || 0);
                const hours = Math.floor(watchTimePoints / 60);
                const minutes = watchTimePoints % 60;

                return (
                  <tr
                    key={user.id || user._id || user.username}
                    className={`w-full bg-gradient-to-r from-neutral-800/90 to-neutral-900/70 shadow-2xl [&>td]:px-2 [&>td]:text-center ${
                      isPodium
                        ? "text-base [&>td]:py-4"
                        : "text-sm [&>td]:py-3"
                    }`}
                  >
                    <td className="flex items-center gap-2">
                      <RankIndicator index={absoluteIndex} />
                      <span className="w-full text-start font-semibold">
                        {user.username}
                      </span>
                    </td>
                    <td>{`${hours}h ${minutes}m`}</td>
                    <td>
                      <RoundedStat value={user.totalPoints} />
                    </td>
                    <td>
                      <RoundedStat value={user.chests} />
                    </td>
                    <td>
                      <RoundedStat value={user.streak} />
                    </td>
                    <td>
                      <RoundedStat value={user.totalMessages} />
                    </td>
                    <td>
                      <RoundedStat value={user.recChat} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {ranking && filteredRanking.length > ITEMS_PER_PAGE && (
        <div className="mx-auto flex w-full flex-col items-stretch justify-between gap-3 rounded-lg border border-white/10 bg-neutral-950/70 p-3 sm:w-auto sm:flex-row sm:items-center">
          <span className="text-sm text-neutral-400">
            Página {currentPage} de {totalPages}
          </span>
          <div className="flex items-center justify-between gap-2 sm:justify-start">
            <button
              className="rounded-md bg-neutral-900 px-3 py-1 text-sm transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            <span className="px-2 text-sm text-white">{currentPage}</span>
            <button
              className="rounded-md bg-neutral-900 px-3 py-1 text-sm transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() =>
                setCurrentPage((page) => Math.min(page + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </SectionContainer>
  );
}
