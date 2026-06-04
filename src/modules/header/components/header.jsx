"use client";

import { useEffect, useRef, useState } from "react";
import HandleShowLogin from "./handle-show-login";
import { AuthContext } from "@/context/auth-context/auth-context";
import useAppContext from "@/context/use-app-context";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconBrandKick,
  IconMenu2,
  IconPower,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import coins from "@/assets/coins.webp";
import Image from "next/image";
import { envConfig } from "@/config";
import { apiRequest } from "@/modules/api/client";
import { legalMenuItems, menuItems } from "@/modules/sidebar/libs/menu-items";
import { hasDashboardAccess } from "@/modules/auth/libs/permissions";

function formatExactNumber(value) {
  return Number(value || 0).toLocaleString("es-AR");
}

function formatHeaderNumber(value) {
  const number = Number(value) || 0;
  const absolute = Math.abs(number);
  const sign = number < 0 ? "-" : "";

  const compact = (divisor, suffix) =>
    `${sign}${(absolute / divisor).toFixed(1).replace(/\.0$/, "")}${suffix}`;

  if (absolute >= 1_000_000_000) return compact(1_000_000_000, "B");
  if (absolute >= 1_000_000) return compact(1_000_000, "M");
  if (absolute >= 1000) return compact(1000, "k");
  if (number % 1 !== 0) return number.toFixed(2).replace(/\.00$/, "");

  return String(number);
}

export default function Header() {
  const { user, logout } = useAppContext(AuthContext);
  const pathname = usePathname();
  const userId = user?.id;

  const [menuOpen, setMenuOpen] = useState(false);
  const [kickPoints, setKickPoints] = useState(0);
  const [loadingPoints, setLoadingPoints] = useState(false);
  const [hasLoadedPoints, setHasLoadedPoints] = useState(false);
  const hasLoadedPointsRef = useRef(false);
  const isFetchingPointsRef = useRef(false);

  useEffect(() => {
    if (!userId) {
      setKickPoints(0);
      setHasLoadedPoints(false);
      hasLoadedPointsRef.current = false;
      isFetchingPointsRef.current = false;
      setLoadingPoints(false);
      return;
    }

    let cancelled = false;

    async function fetchRankingPoints() {
      if (isFetchingPointsRef.current) return;

      isFetchingPointsRef.current = true;

      try {
        if (!hasLoadedPointsRef.current) {
          setLoadingPoints(true);
        }

        const data = await apiRequest(envConfig.API_MY_RANKING);

        if (!cancelled) {
          setKickPoints(Number(data.ranking?.points || 0));
          if (!hasLoadedPointsRef.current) {
            hasLoadedPointsRef.current = true;
            setHasLoadedPoints(true);
          }
        }
      } catch {
        console.error("Error obteniendo puntos");
      } finally {
        isFetchingPointsRef.current = false;

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
  }, [userId]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const visibleMenuItems = menuItems.filter((item) => {
    if (item.requiresAuth && !user) return false;
    if (item.requiresDashboardAccess && !hasDashboardAccess(user)) return false;
    return true;
  });

  function handleLogout() {
    setMenuOpen(false);
    logout?.();
  }

  return (
    <header className="fixed left-0 top-0 z-30 flex h-16 w-full items-center justify-between border-b border-neutral-800 bg-neutral-950/95 px-3 backdrop-blur sm:px-6">
      <Link
        href="/"
        aria-label="Ir al inicio"
        className="inline-flex items-center justify-center"
      >
        <Image
          src="/logo.webp"
          alt="Logo Franco Bertello"
          className="
          size-10 lg:size-12 p-1
          transition-all duration-300
          hover:[filter:brightness(2)_drop-shadow(0_0_8px_#FFD700)_drop-shadow(0_0_20px_#FFD700)_drop-shadow(0_0_40px_#FFC107)]
        "
          width={1024}
          height={1024}
          priority
          loading="eager"
        />
      </Link>

      {user ? (
        <div className="ml-auto hidden max-w-full items-center gap-2 py-2 lg:flex lg:gap-4">
          <Link
            href="/market"
            className="flex shrink-0 items-center gap-2 rounded-lg border-2 border-dashed border-orange-300/50 bg-gradient-to-br from-neutral-900 via-orange-300/30 to-neutral-900 px-2 py-1 font-mono font-semibold shadow-[4px_4px_10px_rgba(0,0,0,0.4)] saturate-150 transition-all duration-300 hover:translate-y-0.5 hover:saturate-200 sm:px-4 sm:py-0.5"
          >
            <Image src={coins} className="size-6" alt="Creditos" />
            <div className="flex flex-col">
              <span className="text-xs text-orange-300 font-normal">
                Creditos
              </span>
              <span
                className="min-w-14 text-sm font-semibold tabular-nums text-[#ffe000]"
                title={formatExactNumber(user.credits)}
              >
                {formatHeaderNumber(user.credits)}
              </span>
            </div>
          </Link>

          <span className="flex shrink-0 items-center gap-2 rounded-lg border-2 border-dashed border-green-500/50 bg-gradient-to-br from-neutral-900 via-green-500/30 to-neutral-900 px-2 py-1 font-mono font-semibold text-green-500 shadow-[4px_4px_10px_rgba(0,0,0,0.4)] saturate-150 transition-all duration-300 hover:translate-y-0.5 hover:saturate-200 sm:px-4 sm:py-0.5">
            <IconBrandKick />
            <div className="flex flex-col">
              <span className="text-xs text-green-500/70 font-normal">
                Puntos
              </span>
              <span
                className="min-w-16 text-sm font-semibold tabular-nums"
                title={formatExactNumber(kickPoints)}
              >
                {loadingPoints && !hasLoadedPoints
                  ? "..."
                  : formatHeaderNumber(kickPoints)}
              </span>
            </div>
          </span>

          <Link
            href="/profile"
            className="gamer-border-link inline-flex min-h-12 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-transparent bg-[#1A1A1A] px-5 py-3 text-sm font-black text-red-100 transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-300/40"
          >
            <IconUser size={18} />
            <span className="max-w-28 truncate sm:max-w-44">
              {user.username}
            </span>
          </Link>
        </div>
      ) : (
        <div className="ml-auto hidden lg:block">
          <HandleShowLogin />
        </div>
      )}

      <div className="ml-auto flex items-center gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="inline-flex size-11 items-center justify-center rounded-lg border border-white/10 bg-neutral-900 text-white transition hover:border-red-400/50 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-400/70"
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
        >
          <IconMenu2 size={24} />
        </button>
      </div>

      <MobileHeaderMenu
        open={menuOpen}
        user={user}
        pathname={pathname}
        visibleMenuItems={visibleMenuItems}
        kickPoints={kickPoints}
        loadingPoints={loadingPoints}
        hasLoadedPoints={hasLoadedPoints}
        onClose={() => setMenuOpen(false)}
        onLogout={handleLogout}
      />
    </header>
  );
}

function MobileHeaderMenu({
  open,
  user,
  pathname,
  visibleMenuItems,
  kickPoints,
  loadingPoints,
  hasLoadedPoints,
  onClose,
  onLogout,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm [animation:mobile-menu-backdrop-in_180ms_ease-out]"
        aria-label="Cerrar menú"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menú principal"
        className="absolute left-3 right-3 top-3 max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-xl border border-white/10 bg-neutral-950 p-4 shadow-2xl shadow-black/70 [animation:mobile-menu-panel-in_220ms_cubic-bezier(0.22,1,0.36,1)] sm:left-6 sm:right-6 sm:top-5 sm:p-5 md:left-auto md:w-[420px]"
      >
        <div className="flex items-center justify-end">
          <h2 className="sr-only">Menú</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-10 items-center justify-center rounded-lg border border-white/10 bg-neutral-900 text-neutral-300 transition hover:text-white"
            aria-label="Cerrar menú"
          >
            <IconX size={20} />
          </button>
        </div>

        {user ? (
          <div className="mt-5 grid gap-3">
            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-red-100 transition hover:bg-red-500/15"
            >
              <span className="inline-flex size-10 items-center justify-center rounded-md bg-red-500/15">
                <IconUser size={22} />
              </span>
              <span className="grid">
                <span className="text-xs text-red-200/70">Perfil</span>
                <strong className="truncate text-sm">{user.username}</strong>
              </span>
            </Link>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/market"
                className="rounded-lg border-2 border-dashed border-orange-300/40 bg-orange-300/10 p-3"
              >
                <span className="flex items-center gap-2 text-xs text-orange-200/80">
                  <Image src={coins} className="size-5" alt="Creditos" />
                  Créditos
                </span>
                <strong
                  className="mt-2 block truncate font-mono text-lg text-[#ffe000]"
                  title={formatExactNumber(user.credits)}
                >
                  {formatHeaderNumber(user.credits)}
                </strong>
              </Link>

              <div className="rounded-lg border-2 border-dashed border-green-500/40 bg-green-500/10 p-3">
                <span className="flex items-center gap-2 text-xs text-green-300/80">
                  <IconBrandKick size={19} />
                  Puntos
                </span>
                <strong
                  className="mt-2 block truncate font-mono text-lg text-green-300"
                  title={formatExactNumber(kickPoints)}
                >
                  {loadingPoints && !hasLoadedPoints
                    ? "..."
                    : formatHeaderNumber(kickPoints)}
                </strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <HandleShowLogin variant="menu" />
          </div>
        )}

        <nav className="mt-5 grid gap-2">
          {visibleMenuItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg border px-3 py-3 text-sm font-semibold transition ${
                  active
                    ? "border-red-400/40 bg-red-500/15 text-white"
                    : "border-white/10 bg-neutral-900/70 text-neutral-300 hover:border-white/20 hover:text-white"
                }`}
              >
                <span className="inline-flex size-9 items-center justify-center rounded-md bg-white/5">
                  {item.icon}
                </span>
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <nav
          className="mt-5 grid gap-2 border-t border-white/10 pt-5"
          aria-label="Enlaces legales"
        >
          {legalMenuItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg border px-3 py-3 text-sm font-semibold transition ${
                  active
                    ? "border-red-400/35 bg-red-500/12 text-white"
                    : "border-white/10 bg-neutral-900/45 text-neutral-400 hover:border-white/20 hover:text-white"
                }`}
              >
                <span className="inline-flex size-9 items-center justify-center rounded-md bg-white/5">
                  {item.icon}
                </span>
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {user ? (
          <button
            type="button"
            onClick={onLogout}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-100 transition hover:bg-red-500/20"
          >
            <IconPower size={19} />
            Cerrar sesión
          </button>
        ) : null}
      </div>
    </div>
  );
}
