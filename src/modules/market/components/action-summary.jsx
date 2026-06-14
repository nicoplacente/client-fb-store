import Image from "next/image";
import { IconBrandKick, IconMinus, IconPlus, IconSparkles } from "@tabler/icons-react";
import coins from "@/assets/coins.webp";
import {
  formatNumber,
  getCreditPurchaseLimit,
  getCreditPurchaseQuantity,
  getRedemptionLimit,
  getRedemptionQuantity,
  hasSingleRedemptionEffect,
} from "../lib/market-utils";

export default function ActionSummary({
  action,
  availablePoints = 0,
  availableCredits = 0,
  maxPurchasePlan,
  onMaxPurchase,
  onQuantityChange,
}) {
  if (action.type === "bulkPurchase") {
    return <BulkCreditPurchaseSummary plan={action.plan} />;
  }

  const isPurchase = action.type === "purchase";
  const item = action.item;
  const quantity = isPurchase
    ? getCreditPurchaseQuantity(action.quantity, item, availablePoints)
    : getRedemptionQuantity(action.quantity, item, availableCredits);
  const totalCost =
    Number(isPurchase ? item.pointsCost : item.price || 0) * quantity;
  const displayedCost =
    !isPurchase && quantity <= 0 ? Number(item.price || 0) : totalCost;
  const totalCredits = Number(item.credits || 0) * quantity;
  const isSingleRedemption = hasSingleRedemptionEffect(item);

  return (
    <div className="grid gap-3 text-sm text-neutral-300">
      <SummaryRow
        label={isPurchase ? "Paquete" : "Producto"}
        value={isPurchase ? item.name : item.title}
      />
      <SummaryRow
        label={isPurchase ? "Costo unitario del pack" : "Creditos necesarios"}
        value={formatNumber(isPurchase ? item.pointsCost : displayedCost)}
        valueClassName={isPurchase ? "text-green-300" : "text-amber-200"}
        icon={isPurchase ? <PointsIcon /> : <CreditsIcon />}
      />
      {isPurchase ? (
        <>
          <CreditPurchaseQuantityControl
            value={quantity}
            max={getCreditPurchaseLimit(item, availablePoints)}
            maxPurchasePlan={maxPurchasePlan}
            onMaxPurchase={onMaxPurchase}
            onChange={onQuantityChange}
          />
          <SummaryRow
            label="Total a descontar de tus puntos"
            value={formatNumber(totalCost)}
            valueClassName="text-green-300"
            icon={<PointsIcon />}
          />
          <SummaryRow
            label="Creditos acreditados al instante"
            value={formatNumber(totalCredits)}
            icon={<CreditsIcon />}
          />
        </>
      ) : quantity <= 0 ? (
        <SummaryRow
          label="Estado"
          value="Créditos insuficientes"
          valueClassName="text-red-300"
        />
      ) : isSingleRedemption ? (
        <SummaryRow label="Unidades" value="1 unidad" />
      ) : (
        <QuantityControl
          value={quantity}
          max={getRedemptionLimit(item, availableCredits)}
          stock={item.stock}
          infiniteStock={item.infiniteStock}
          onChange={onQuantityChange}
        />
      )}
    </div>
  );
}

function BulkCreditPurchaseSummary({ plan }) {
  return (
    <div className="grid gap-3 text-sm text-neutral-300">
      <SummaryRow
        label="Packs"
        value={`${formatNumber(plan.totalPacks)} ${plan.totalPacks === 1 ? "pack" : "packs"}`}
      />
      <SummaryRow
        label="Total a descontar de tus puntos"
        value={formatNumber(plan.totalPointsCost)}
        valueClassName="text-green-300"
        icon={<PointsIcon />}
      />
      <SummaryRow
        label="Creditos acreditados al instante"
        value={formatNumber(plan.totalCredits)}
        icon={<CreditsIcon />}
      />

      <div className="grid gap-2 border-t border-white/10 pt-3">
        <p className="text-sm font-semibold text-neutral-300">Detalle de packs seleccionados</p>
        <div className="grid gap-2">
          {plan.items.map((item) => (
            <div
              key={item.creditPackage.id}
              className="rounded-xl border border-white/10 bg-neutral-950 px-3 py-2"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-neutral-300">
                  {item.creditPackage.name}
                </span>
                <strong className="text-right text-amber-200">
                  {formatNumber(item.quantity)}x
                </strong>
              </div>
              <div className="mt-1 flex items-center justify-between gap-3 text-xs text-neutral-500">
                <CurrencyValue
                  icon={<PointsIcon size={14} />}
                  value={`${formatNumber(item.pointsCost)} puntos usados`}
                  className="text-green-300/80"
                />
                <CurrencyValue
                  icon={<CreditsIcon size="size-4" />}
                  value={`${formatNumber(item.credits)} creditos recibidos`}
                  className="text-neutral-300"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {plan.remainingPoints > 0 ? (
        <SummaryRow
          label="Puntos que conservas despues de la compra"
          value={formatNumber(plan.remainingPoints)}
          valueClassName="text-green-300/80"
          icon={<PointsIcon />}
        />
      ) : null}
    </div>
  );
}

function SummaryRow({ label, value, valueClassName = "text-white", icon }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-neutral-400">{label}</span>
      <CurrencyValue
        icon={icon}
        value={value}
        className={`justify-end text-right font-black ${valueClassName}`}
      />
    </div>
  );
}

function CurrencyValue({ icon, value, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {icon}
      <span>{value}</span>
    </span>
  );
}

function PointsIcon({ size = 16 }) {
  return <IconBrandKick size={size} className="shrink-0 text-green-400" />;
}

function CreditsIcon({ size = "size-4" }) {
  return <Image src={coins} alt="Creditos" className={`shrink-0 ${size}`} />;
}

function CreditPurchaseQuantityControl({
  value,
  max,
  maxPurchasePlan,
  onMaxPurchase,
  onChange,
}) {
  const safeMax = Math.max(0, Math.floor(Number(max || 0)));
  const safeValue = safeMax > 0
    ? Math.min(Math.max(1, Math.floor(Number(value || 1))), safeMax)
    : 0;
  const canMaxPurchase = maxPurchasePlan?.totalPacks > 0;

  function updateQuantity(nextValue) {
    if (safeMax <= 0) {
      onChange(0);
      return;
    }

    const nextQuantity = Math.floor(Number(nextValue || 1));
    const safeQuantity = Number.isFinite(nextQuantity)
      ? Math.min(Math.max(1, nextQuantity), safeMax)
      : 1;

    onChange(safeQuantity);
  }

  return (
    <div className="grid gap-2 border-t border-white/10 pt-3">
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor="credit-package-quantity"
          className="text-sm font-semibold text-neutral-300"
        >
          Packs
        </label>
        <span className="rounded-full border border-white/10 bg-neutral-950 px-3 py-1 text-xs font-black text-neutral-400">
          Maximo: {formatNumber(safeMax)}
        </span>
      </div>

      <div className="grid grid-cols-[3rem_1fr_3rem] overflow-hidden rounded-xl border border-white/10 bg-neutral-950 shadow-inner shadow-black/10 focus-within:border-green-300/50">
        <button
          type="button"
          onClick={() => updateQuantity(safeValue - 1)}
          disabled={safeValue <= 1}
          className="grid h-12 cursor-pointer place-items-center border-r border-white/10 text-neutral-300 transition hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:text-neutral-700"
          aria-label="Reducir packs"
        >
          <IconMinus size={17} />
        </button>
        <input
          id="credit-package-quantity"
          type="number"
          min={safeMax > 0 ? "1" : "0"}
          max={safeMax}
          value={safeValue}
          onChange={(event) => updateQuantity(event.target.value)}
          disabled={safeMax <= 0}
          className="h-12 w-full bg-transparent px-3 text-center text-lg font-black text-white outline-none disabled:cursor-not-allowed disabled:text-neutral-600"
          aria-label="Packs a comprar"
        />
        <button
          type="button"
          onClick={() => updateQuantity(safeValue + 1)}
          disabled={safeMax <= 0 || safeValue >= safeMax}
          className="grid h-12 cursor-pointer place-items-center border-l border-white/10 text-neutral-300 transition hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:text-neutral-700"
          aria-label="Aumentar packs"
        >
          <IconPlus size={17} />
        </button>
      </div>

      <button
        type="button"
        onClick={onMaxPurchase}
        disabled={!canMaxPurchase}
        className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-green-300/30 bg-green-500/10 px-4 py-3 text-sm font-black text-green-100 transition hover:-translate-y-0.5 hover:border-green-300/55 hover:bg-green-500/15 hover:text-white focus:outline-none disabled:cursor-not-allowed disabled:border-green-300/15 disabled:bg-black/20 disabled:text-green-100/40"
        aria-label="Comprar el maximo de creditos posible"
      >
        <IconSparkles size={18} />
        Comprar maximo
      </button>
    </div>
  );
}

function QuantityControl({ value, max, stock, infiniteStock, onChange }) {
  const limit = Math.max(0, Math.floor(Number(max || 0)));
  const availableStock = Math.max(0, Number(stock || 0));
  const numericValue = Math.floor(Number(value || 1));
  const safeValue =
    limit <= 0
      ? 0
      : Math.min(
          Number.isFinite(numericValue) ? Math.max(1, numericValue) : 1,
          limit,
        );

  function updateQuantity(nextValue) {
    const nextQuantity = Math.floor(Number(nextValue || 1));

    onChange(
      limit <= 0
        ? 0
        : Math.min(
            Number.isFinite(nextQuantity) ? Math.max(1, nextQuantity) : 1,
            limit,
          ),
    );
  }

  return (
    <div className="grid gap-2 border-t border-white/10 pt-3">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor="redeem-quantity" className="text-sm font-semibold text-neutral-300">
          Unidades
        </label>
        <span className="rounded-full border border-white/10 bg-neutral-950 px-3 py-1 text-xs font-black text-neutral-400">
          Disponible: {infiniteStock ? "Ilimitado" : formatNumber(availableStock)}
        </span>
      </div>

      <div className="grid grid-cols-[3rem_1fr_3rem] overflow-hidden rounded-xl border border-white/10 bg-neutral-950 shadow-inner shadow-black/10 focus-within:border-amber-300/50">
        <button
          type="button"
          onClick={() => updateQuantity(safeValue - 1)}
          disabled={safeValue <= 1}
          className="grid h-12 cursor-pointer place-items-center border-r border-white/10 text-neutral-300 transition hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:text-neutral-700"
          aria-label="Reducir unidades"
        >
          <IconMinus size={17} />
        </button>
        <input
          id="redeem-quantity"
          type="number"
          min={limit > 0 ? "1" : "0"}
          max={limit}
          value={safeValue}
          disabled={limit <= 0}
          onChange={(event) => updateQuantity(event.target.value)}
          className="h-12 w-full bg-transparent px-3 text-center text-lg font-black text-white outline-none"
          aria-label="Unidades a canjear"
        />
        <button
          type="button"
          onClick={() => updateQuantity(safeValue + 1)}
          disabled={limit <= 0 || safeValue >= limit}
          className="grid h-12 cursor-pointer place-items-center border-l border-white/10 text-neutral-300 transition hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:text-neutral-700"
          aria-label="Aumentar unidades"
        >
          <IconPlus size={17} />
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 text-xs text-neutral-500">
        <span>
          Máximo según stock y créditos:{" "}
          {limit === Number.MAX_SAFE_INTEGER ? "Sin límite" : formatNumber(limit)}
        </span>
        <strong className="font-black text-amber-200">
          {safeValue} {safeValue === 1 ? "unidad" : "unidades"}
        </strong>
      </div>
    </div>
  );
}
