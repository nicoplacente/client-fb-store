import Image from "next/image";
import {
  IconCategory,
  IconGift,
  IconPackage,
  IconSparkles,
} from "@tabler/icons-react";
import coins from "@/assets/coins.webp";
import { formatNumber } from "../lib/market-utils";

export default function ProductDetail({ product }) {
  const isRewardWheel = product.rewardEffectType === "reward_wheel";

  return (
    <div className="grid content-start gap-5">
      <div className="relative grid min-h-52 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-black/25 p-5">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={`Imagen del producto ${product.title}`}
            className="max-h-56 max-w-full object-contain drop-shadow-[0_18px_26px_rgba(0,0,0,0.45)]"
            loading="eager"
            decoding="async"
          />
        ) : (
          <IconPackage size={52} className="text-neutral-600" />
        )}
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold text-neutral-300">
            <IconCategory size={14} />
            {product.category}
          </span>
          {isRewardWheel ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-fuchsia-300/20 bg-fuchsia-400/10 px-3 py-1 text-xs font-bold text-fuchsia-200">
              <IconSparkles size={14} />
              Ruleta
            </span>
          ) : null}
        </div>

        <h3 className="mt-3 text-xl font-black leading-tight text-white">
          {product.title}
        </h3>
        <p className="mt-2 text-sm font-medium leading-6 text-neutral-400">
          {product.description || "Producto disponible en la tienda."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <DetailMetric
          label="Precio"
          value={formatNumber(product.price)}
          icon={<Image src={coins} alt="" className="size-4" />}
          valueClassName="text-amber-200"
        />
        <DetailMetric
          label="Disponibilidad"
          value={
            product.infiniteStock
              ? "Ilimitada"
              : `${formatNumber(product.stock)} restantes`
          }
          icon={<IconPackage size={16} />}
        />
      </div>

    </div>
  );
}

function DetailMetric({ label, value, icon, valueClassName = "text-white" }) {
  return (
    <div className="rounded-xl border border-white/10 bg-neutral-950/70 p-3">
      <p className="text-[11px] font-black uppercase tracking-wide text-neutral-500">
        {label}
      </p>
      <p
        className={`mt-2 flex items-center gap-1.5 text-sm font-black ${valueClassName}`}
      >
        {icon}
        {value}
      </p>
    </div>
  );
}

export function WheelPrizes({ prizes = [] }) {
  return (
    <section
      aria-labelledby="wheel-prizes-title"
      className="rounded-2xl border border-fuchsia-300/15 bg-fuchsia-400/[0.05] p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h3
          id="wheel-prizes-title"
          className="flex items-center gap-2 text-sm font-black text-fuchsia-100"
        >
          <IconGift size={18} />
          Premios de la ruleta
        </h3>
        <span className="text-xs font-bold text-neutral-500">
          {prizes.length} {prizes.length === 1 ? "premio" : "premios"}
        </span>
      </div>

      {prizes.length ? (
        <ul className="mt-3 grid gap-2">
          {prizes.map((prize) => (
            <li
              key={prize.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-neutral-950/70 px-3 py-2.5"
            >
              <span className="text-sm font-semibold text-neutral-300">
                {prize.name}
              </span>
              <strong className="shrink-0 text-sm font-black tabular-nums text-fuchsia-200">
                {formatProbability(prize.probability)}
              </strong>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm leading-6 text-neutral-500">
          Los premios todavía no están disponibles para consultar.
        </p>
      )}
    </section>
  );
}

function formatProbability(probability) {
  return `${Number(probability || 0).toLocaleString("es-AR", {
    maximumFractionDigits: 2,
  })}%`;
}
