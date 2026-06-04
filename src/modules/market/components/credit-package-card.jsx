import Image from "next/image";
import { IconArrowRight, IconBrandKick, IconCoins, IconPlus } from "@tabler/icons-react";
import coins from "@/assets/coins.webp";
import { formatNumber } from "../lib/market-utils";

export default function CreditPackageCard({ creditPackage, onPurchase, disabled }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.045),rgba(18,18,18,0.94)_42%,rgba(8,8,8,0.98))] p-4 shadow-xl shadow-black/25 ring-1 ring-white/[0.03] transition duration-300 hover:-translate-y-1 hover:border-amber-200/35 hover:shadow-[0_24px_60px_rgba(251,191,36,0.08)] sm:p-5">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/70 to-transparent" />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-amber-200/80">
            Pack de creditos
          </p>
          <h2 className="mt-2 text-lg font-black leading-tight text-white">
            {creditPackage.name}
          </h2>
          <p className="mt-2 text-sm font-medium leading-5 text-neutral-500">
            Carga saldo para canjear recompensas al instante.
          </p>
        </div>
        <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-amber-200/25 bg-amber-300/10 text-amber-100">
          <IconCoins size={22} />
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center">
        <CreditMetric
          label="Recibis"
          value={formatNumber(creditPackage.credits)}
          icon={<Image src={coins} alt="Creditos" className="size-6" />}
          tone="amber"
        />
        <span className="hidden size-9 items-center justify-center rounded-full border border-white/10 bg-black/25 text-neutral-500 sm:inline-flex">
          <IconArrowRight size={16} />
        </span>
        <CreditMetric
          label="Pagas"
          value={formatNumber(creditPackage.pointsCost)}
          icon={<IconBrandKick size={18} />}
          tone="green"
        />
      </div>

      <button
        disabled={disabled || creditPackage.status !== "active"}
        onClick={() => onPurchase(creditPackage)}
        aria-label={`Comprar pack ${creditPackage.name}`}
        className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-amber-200/30 bg-black/35 px-4 py-3 text-sm font-black text-amber-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:-translate-y-0.5 hover:border-amber-200/55 hover:bg-amber-300/12 hover:text-white hover:shadow-[0_14px_36px_rgba(251,191,36,0.12)] focus:outline-none focus:ring-2 focus:ring-amber-200/60 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:shadow-none"
      >
        <IconPlus size={18} />
        Comprar creditos
      </button>
    </article>
  );
}

function CreditMetric({ label, value, icon, tone }) {
  const toneClass =
    tone === "green"
      ? "border-green-300/20 bg-green-400/10 text-green-200"
      : "border-amber-300/20 bg-amber-300/10 text-amber-200";

  return (
    <div className={`min-w-0 rounded-xl border p-3.5 ${toneClass}`}>
      <p className="text-xs font-black uppercase text-neutral-500">{label}</p>
      <p className="mt-2 flex min-w-0 items-center gap-2 text-xl font-black sm:text-2xl">
        <span className="inline-flex shrink-0 items-center">{icon}</span>
        <span className="min-w-0 truncate tabular-nums" title={value}>
          {value}
        </span>
      </p>
    </div>
  );
}
