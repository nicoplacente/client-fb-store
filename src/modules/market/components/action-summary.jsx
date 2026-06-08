import { IconMinus, IconPlus } from "@tabler/icons-react";
import {
  clampRedemptionQuantity,
  formatNumber,
  getCreditPurchaseLimit,
  getCreditPurchaseQuantity,
  getRedemptionQuantity,
  hasSingleRedemptionEffect,
} from "../lib/market-utils";

export default function ActionSummary({
  action,
  availablePoints = 0,
  onQuantityChange,
}) {
  const isPurchase = action.type === "purchase";
  const item = action.item;
  const quantity = isPurchase
    ? getCreditPurchaseQuantity(action.quantity, item, availablePoints)
    : getRedemptionQuantity(action.quantity, item);
  const totalCost =
    Number(isPurchase ? item.pointsCost : item.price || 0) * quantity;
  const totalCredits = Number(item.credits || 0) * quantity;
  const isSingleRedemption = hasSingleRedemptionEffect(item);

  return (
    <div className="grid gap-3 text-sm text-neutral-300">
      <SummaryRow
        label={isPurchase ? "Paquete" : "Producto"}
        value={isPurchase ? item.name : item.title}
      />
      <SummaryRow
        label={isPurchase ? "Puntos por pack" : "Creditos a usar"}
        value={formatNumber(isPurchase ? item.pointsCost : totalCost)}
        valueClassName="text-amber-200"
      />
      {isPurchase ? (
        <>
          <CreditPurchaseQuantityControl
            value={quantity}
            max={getCreditPurchaseLimit(item, availablePoints)}
            onChange={onQuantityChange}
          />
          <SummaryRow
            label="Total de puntos"
            value={formatNumber(totalCost)}
            valueClassName="text-amber-200"
          />
          <SummaryRow
            label="Creditos que recibis"
            value={formatNumber(totalCredits)}
          />
        </>
      ) : isSingleRedemption ? (
        <SummaryRow label="Unidades" value="1 canje" />
      ) : (
        <QuantityControl
          value={quantity}
          max={item.stock}
          infiniteStock={item.infiniteStock}
          onChange={onQuantityChange}
        />
      )}
    </div>
  );
}

function SummaryRow({ label, value, valueClassName = "text-white" }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-neutral-400">{label}</span>
      <strong className={`text-right ${valueClassName}`}>{value}</strong>
    </div>
  );
}

function CreditPurchaseQuantityControl({ value, max, onChange }) {
  const safeMax = Math.max(0, Math.floor(Number(max || 0)));
  const safeValue = safeMax > 0
    ? Math.min(Math.max(1, Math.floor(Number(value || 1))), safeMax)
    : 0;

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

      <div className="grid grid-cols-[3rem_1fr_3rem] overflow-hidden rounded-xl border border-white/10 bg-neutral-950 shadow-inner shadow-black/10 focus-within:border-amber-300/50 focus-within:ring-2 focus-within:ring-amber-300/15">
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

      <div className="flex items-center justify-between gap-3 text-xs text-neutral-500">
        <span>Limite segun tus puntos actuales</span>
        <strong className="font-black text-amber-200">
          {safeValue} {safeValue === 1 ? "pack" : "packs"}
        </strong>
      </div>
    </div>
  );
}

function QuantityControl({ value, max, infiniteStock, onChange }) {
  const stock = Math.max(0, Number(max || 0));
  const numericValue = Math.floor(Number(value || 1));
  const safeValue = infiniteStock
    ? Number.isFinite(numericValue)
      ? Math.max(1, numericValue)
      : 1
    : clampRedemptionQuantity(value, stock);

  function updateQuantity(nextValue) {
    const nextQuantity = Math.floor(Number(nextValue || 1));

    onChange(
      infiniteStock
        ? Number.isFinite(nextQuantity)
          ? Math.max(1, nextQuantity)
          : 1
        : clampRedemptionQuantity(nextValue, stock)
    );
  }

  return (
    <div className="grid gap-2 border-t border-white/10 pt-3">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor="redeem-quantity" className="text-sm font-semibold text-neutral-300">
          Unidades
        </label>
        <span className="rounded-full border border-white/10 bg-neutral-950 px-3 py-1 text-xs font-black text-neutral-400">
          Disponible: {infiniteStock ? "Ilimitado" : formatNumber(stock)}
        </span>
      </div>

      <div className="grid grid-cols-[3rem_1fr_3rem] overflow-hidden rounded-xl border border-white/10 bg-neutral-950 shadow-inner shadow-black/10 focus-within:border-amber-300/50 focus-within:ring-2 focus-within:ring-amber-300/15">
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
          min="1"
          max={infiniteStock ? undefined : stock}
          value={safeValue}
          onChange={(event) => updateQuantity(event.target.value)}
          className="h-12 w-full bg-transparent px-3 text-center text-lg font-black text-white outline-none"
          aria-label="Unidades a canjear"
        />
        <button
          type="button"
          onClick={() => updateQuantity(safeValue + 1)}
          disabled={!infiniteStock && safeValue >= stock}
          className="grid h-12 cursor-pointer place-items-center border-l border-white/10 text-neutral-300 transition hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:text-neutral-700"
          aria-label="Aumentar unidades"
        >
          <IconPlus size={17} />
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 text-xs text-neutral-500">
        <span>
          {infiniteStock ? "Sin limite de stock" : "Maximo segun stock disponible"}
        </span>
        <strong className="font-black text-amber-200">
          {safeValue} {safeValue === 1 ? "unidad" : "unidades"}
        </strong>
      </div>
    </div>
  );
}
