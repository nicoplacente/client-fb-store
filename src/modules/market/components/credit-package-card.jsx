import Image from "next/image";
import { IconBrandKick, IconCoins, IconShoppingCart } from "@tabler/icons-react";
import coins from "@/assets/coins.webp";
import { formatNumber } from "../lib/market-utils";

export default function CreditPackageCard({ creditPackage, onPurchase, disabled }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-amber-300/20 bg-[linear-gradient(145deg,rgba(251,191,36,0.10),rgba(10,10,10,0.92)_42%,rgba(10,10,10,0.98))] p-5 shadow-xl shadow-black/25 ring-1 ring-white/[0.03] transition duration-300 hover:-translate-y-1 hover:border-amber-300/45 hover:shadow-amber-950/20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/60 to-transparent" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-amber-100/80">
            Saldo para canjes
          </p>
          <h2 className="mt-2 text-lg font-bold text-white">{creditPackage.name}</h2>
          <p className="mt-2 min-h-10 text-sm leading-6 text-neutral-400">
            {creditPackage.description || "Transforma tus puntos del canal en creditos listos para usar."}
          </p>
        </div>
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-amber-300/25 bg-amber-300/15 text-amber-100 shadow-lg shadow-amber-950/20 transition group-hover:scale-105">
          <IconCoins size={22} />
        </span>
      </div>

      <div className="mt-6 rounded-xl border border-amber-100/10 bg-black/25 p-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase text-neutral-500">Recibis</p>
            <p className="mt-1 flex items-center gap-2 text-3xl font-black text-amber-200">
              <Image src={coins} alt="Creditos" className="size-7" />
              {formatNumber(creditPackage.credits)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase text-neutral-500">Pagas</p>
            <p className="mt-1 inline-flex items-center gap-1 rounded-full border border-green-400/25 bg-green-400/10 px-3 py-1 text-sm font-bold text-green-200 shadow-inner shadow-green-950/20">
              <IconBrandKick size={16} />
              {formatNumber(creditPackage.pointsCost)}
            </p>
          </div>
        </div>
      </div>

      <button
        disabled={disabled || creditPackage.status !== "active"}
        onClick={() => onPurchase(creditPackage)}
        aria-label={`Comprar pack ${creditPackage.name}`}
        className="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-black text-neutral-950 shadow-lg shadow-amber-950/30 transition hover:-translate-y-0.5 hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200/70 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500 disabled:shadow-none"
      >
        <IconShoppingCart size={18} />
        Comprar creditos
      </button>
    </article>
  );
}
