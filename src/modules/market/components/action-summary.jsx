import { IconMinus, IconPlus } from "@tabler/icons-react";
import { clampRedemptionQuantity, formatNumber } from "../lib/market-utils";

export default function ActionSummary({ action, onQuantityChange }) {
  const isPurchase = action.type === "purchase";
  const item = action.item;
  const quantity = clampRedemptionQuantity(action.quantity, item.stock);
  const totalCost = Number(item.price || 0) * quantity;

  return (
    <div className="grid gap-3 text-sm text-neutral-300">
      <SummaryRow label={isPurchase ? "Paquete" : "Producto"} value={isPurchase ? item.name : item.title} />
      <SummaryRow
        label={isPurchase ? "Puntos a usar" : "Creditos a usar"}
        value={formatNumber(isPurchase ? item.pointsCost : totalCost)}
        valueClassName="text-amber-200"
      />
      {isPurchase ? (
        <SummaryRow label="Creditos que recibis" value={formatNumber(item.credits)} />
      ) : (
        <QuantityControl value={quantity} max={item.stock} onChange={onQuantityChange} />
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

function QuantityControl({ value, max, onChange }) {
  const stock = Math.max(0, Number(max || 0));
  const safeValue = clampRedemptionQuantity(value, stock);

  function updateQuantity(nextValue) {
    onChange(clampRedemptionQuantity(nextValue, stock));
  }

  return (
    <div className="grid gap-2 border-t border-white/10 pt-3">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor="redeem-quantity" className="text-sm font-semibold text-neutral-300">
          Unidades
        </label>
        <span className="rounded-full border border-white/10 bg-neutral-950 px-3 py-1 text-xs font-black text-neutral-400">
          Disponible: {formatNumber(stock)}
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
          max={stock}
          value={safeValue}
          onChange={(event) => updateQuantity(event.target.value)}
          className="h-12 w-full bg-transparent px-3 text-center text-lg font-black text-white outline-none"
          aria-label="Unidades a canjear"
        />
        <button
          type="button"
          onClick={() => updateQuantity(safeValue + 1)}
          disabled={safeValue >= stock}
          className="grid h-12 cursor-pointer place-items-center border-l border-white/10 text-neutral-300 transition hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:text-neutral-700"
          aria-label="Aumentar unidades"
        >
          <IconPlus size={17} />
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 text-xs text-neutral-500">
        <span>Maximo segun stock disponible</span>
        <strong className="font-black text-amber-200">
          {safeValue} {safeValue === 1 ? "unidad" : "unidades"}
        </strong>
      </div>
    </div>
  );
}
