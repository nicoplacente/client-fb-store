"use client";

import { useEffect, useState } from "react";
import HandleShowLogin from "./handle-show-login";
import { AuthContext } from "@/context/auth-context/auth-context";
import useAppContext from "@/context/use-app-context";
import Link from "next/link";
import { IconUser, IconBrandKick } from "@tabler/icons-react";
import coins from "@/assets/coins.webp";
import Image from "next/image";
import { envConfig } from "@/config";
import { apiRequest } from "@/modules/api/client";

function formatPoints(value) {
  const number = Number(value) || 0;

  if (number >= 1000) {
    return `${(number / 1000).toFixed(1)}k`;
  }

  if (number % 1 !== 0) {
    return number.toFixed(2);
  }

  return String(number);
}

export default function Header() {
  const { user } = useAppContext(AuthContext);

  const [kickPoints, setKickPoints] = useState(0);
  const [loadingPoints, setLoadingPoints] = useState(false);

  useEffect(() => {
    if (!user) {
      setKickPoints(0);
      return;
    }

    let cancelled = false;

    async function fetchRankingPoints() {
      try {
        setLoadingPoints(true);

        const data = await apiRequest(envConfig.API_MY_RANKING);

        if (!cancelled) {
          setKickPoints(Number(data.ranking?.points || 0));
        }
      } catch (err) {
        console.error("Error obteniendo puntos:", err);
      } finally {
        if (!cancelled) {
          setLoadingPoints(false);
        }
      }
    }

    fetchRankingPoints();

    const interval = setInterval(fetchRankingPoints, 30 * 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user]);

  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between px-6 z-30">
      {user ? (
        <div className="ml-auto flex items-center gap-4">
          <Link
            href="/market"
            className="flex items-center gap-2 font-semibold font-mono border-2 border-dashed border-orange-300/50 bg-gradient-to-br from-neutral-900 via-orange-300/30 to-neutral-900 rounded-lg px-4 py-0.5 hover:translate-y-0.5 transition-all duration-300 shadow-[4px_4px_10px_rgba(0,0,0,0.4)] saturate-150 hover:saturate-200"
          >
            <Image src={coins} className="size-6" alt="Creditos" />
            <div className="flex flex-col">
              <span className="text-xs text-orange-300 font-normal">
                Creditos
              </span>
              <span className="text-sm text-[#ffe000] font-semibold">
                1.000
              </span>
            </div>
          </Link>

          <span className="flex items-center gap-2 font-semibold font-mono border-2 border-dashed text-green-500 border-green-500/50 bg-gradient-to-br from-neutral-900 via-green-500/30 to-neutral-900 rounded-lg px-4 py-0.5 hover:translate-y-0.5 transition-all duration-300 shadow-[4px_4px_10px_rgba(0,0,0,0.4)] saturate-150 hover:saturate-200">
            <IconBrandKick />
            <div className="flex flex-col">
              <span className="text-xs text-green-500/70 font-normal">
                Puntos
              </span>
              <span className="text-sm font-semibold">
                {loadingPoints ? "..." : formatPoints(kickPoints)}
              </span>
            </div>
          </span>

          <Link
            href="/profile"
            className="flex items-center gap-1 font-semibold font-mono border text-red-500 border-red-500/50 bg-gradient-to-br from-neutral-900 via-primary/20 to-neutral-900 rounded-lg px-6 py-2 hover:translate-y-0.5 transition-all duration-300 shadow-[4px_4px_10px_rgba(0,0,0,0.4)] saturate-150 hover:saturate-200"
          >
            <IconUser />
            {user.username}
          </Link>
        </div>
      ) : (
        <HandleShowLogin />
      )}
    </header>
  );
}
