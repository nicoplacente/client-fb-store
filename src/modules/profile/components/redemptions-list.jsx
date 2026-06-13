import Image from "next/image";
import {
  IconCalendar,
  IconShoppingBag,
  IconSparkles,
  IconStack2,
} from "@tabler/icons-react";
import coins from "@/assets/coins.webp";
import { formatDate } from "../lib/profile-utils";

export default function RedemptionsList({ loading, redemptions }) {
  if (loading) {
    return (
      <div className="rounded-lg border border-white/10 bg-neutral-900/60 p-8 text-center text-neutral-400">
        Cargando canjes...
      </div>
    );
  }

  if (redemptions.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-neutral-900/60 p-8 text-center text-neutral-400">
        Todavía no hiciste canjes.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {redemptions.map((redemption) => (
        <article
          key={redemption.id}
          className="grid gap-4 rounded-lg border border-white/10 bg-neutral-900/60 p-4 sm:grid-cols-[112px_1fr]"
        >
          <div className="aspect-square overflow-hidden rounded-md bg-neutral-950">
            {redemption.product.imageUrl ? (
              <img
                src={redemption.product.imageUrl}
                alt={`Imagen del producto canjeado ${redemption.product.title}`}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-neutral-600">
                <IconShoppingBag size={34} />
              </div>
            )}
          </div>
          <div className="flex flex-col justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-bold text-white">{redemption.product.title}</h2>
                <span className="rounded-md border border-white/10 bg-neutral-950 px-2 py-1 text-xs text-neutral-400">
                  {redemption.status}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-neutral-400">
                {redemption.product.description || "Canje de producto"}
              </p>
              {redemption.wheelPrizeName ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <p className="inline-flex items-center gap-2 rounded-lg border border-fuchsia-300/20 bg-fuchsia-500/10 px-3 py-2 text-sm font-bold text-fuchsia-100">
                    <IconSparkles size={16} />
                    Premio ganado: {redemption.wheelPrizeName}
                  </p>
                  <WheelEffectStatus redemption={redemption} />
                </div>
              ) : null}
              {redemption.productEffectType ? (
                <ProductEffectStatus redemption={redemption} />
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-400">
              <span className="inline-flex items-center gap-2">
                <IconStack2 size={16} />
                Cantidad: {Math.max(1, redemption.quantity)}
              </span>
              <span className="inline-flex items-center gap-2 text-yellow-200">
                <Image src={coins} alt="Creditos" className="size-5" />
                {redemption.cost.toLocaleString()} créditos
              </span>
              <span className="inline-flex items-center gap-2">
                <IconCalendar size={16} />
                {formatDate(redemption.createdAt)}
              </span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function WheelEffectStatus({ redemption }) {
  if (
    !redemption.wheelEffectType ||
    redemption.wheelEffectType === "none"
  ) {
    return null;
  }

  const statusStyles = {
    completed:
      "border-green-300/20 bg-green-400/10 text-green-100",
    pending:
      "border-amber-300/20 bg-amber-400/10 text-amber-100",
    failed: "border-red-300/20 bg-red-500/10 text-red-100",
  };
  const statusLabels = {
    completed: "Efecto aplicado",
    pending: "Efecto pendiente",
    failed: "Efecto fallido",
  };
  const status = redemption.wheelEffectStatus || "pending";

  return (
    <span
      title={redemption.wheelEffectError || undefined}
      className={`rounded-lg border px-3 py-2 text-sm font-bold ${
        statusStyles[status] || statusStyles.pending
      }`}
    >
      {statusLabels[status] || statusLabels.pending}
    </span>
  );
}

function ProductEffectStatus({ redemption }) {
  const statusStyles = {
    completed: "border-green-300/20 bg-green-400/10 text-green-100",
    pending: "border-amber-300/20 bg-amber-400/10 text-amber-100",
    failed: "border-red-300/20 bg-red-500/10 text-red-100",
  };
  const statusLabels = {
    completed: "Acción de Kick aplicada",
    pending: "Acción de Kick pendiente",
    failed: "Acción de Kick fallida",
  };
  const status = redemption.productEffectStatus || "pending";
  const target = redemption.productEffectTargetUsername
    ? ` a ${redemption.productEffectTargetUsername}`
    : "";

  return (
    <p
      title={redemption.productEffectError || undefined}
      className={`mt-3 w-fit rounded-lg border px-3 py-2 text-sm font-bold ${
        statusStyles[status] || statusStyles.pending
      }`}
    >
      {statusLabels[status] || statusLabels.pending}
      {target}
    </p>
  );
}
