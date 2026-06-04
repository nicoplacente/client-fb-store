import Image from "next/image";
import SpotlightCard from "@/modules/ui/spotlight-card";
import {
  IconLock,
  IconPackage,
  IconShoppingCart,
  IconStarFilled,
} from "@tabler/icons-react";
import coins from "@/assets/coins.webp";
import { formatNumber } from "../lib/market-utils";

const CARD_HUES = [165, 291.34, 338.69];
const CARD_SATURATIONS = ["82.26%", "95.9%", "100%"];
const CARD_LIGHTNESSES = ["51.37%", "61.76%", "48.04%"];

export default function ProductCard({
  product,
  onRedeem,
  disabled,
  index = 0,
}) {
  const outOfStock = !product.infiniteStock && product.stock <= 0;
  const isDisabled = product.status === "disabled";
  const unavailable = product.status !== "active" || outOfStock;
  const colorIndex = index % CARD_HUES.length;

  return (
    <SpotlightCard
      hue={CARD_HUES[colorIndex]}
      saturation={CARD_SATURATIONS[colorIndex]}
      lightness={CARD_LIGHTNESSES[colorIndex]}
      className={`group flex min-h-[390px] flex-col items-center rounded-[15px] p-5 text-center ${
        outOfStock ? "opacity-75" : ""
      }`}
    >
      {product.featured ? <FeaturedBadge /> : null}
      {outOfStock || isDisabled ? (
        <UnavailableBadge outOfStock={outOfStock} />
      ) : null}

      <div className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-xl bg-black/20 sm:h-44">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={`Imagen del producto ${product.title}`}
            className={`max-h-full max-w-full object-contain drop-shadow-[0_18px_26px_rgba(0,0,0,0.45)] transition duration-700 group-hover:scale-105 ${outOfStock ? "grayscale" : ""}`}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-600">
            <IconPackage size={48} />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col items-center justify-between gap-4 pt-4">
        <ProductInfo product={product} />
        <ProductPrice
          product={product}
          outOfStock={outOfStock}
          unavailable={unavailable}
        />
        <RedeemButton
          product={product}
          disabled={disabled || unavailable}
          outOfStock={outOfStock}
          isDisabled={isDisabled}
          unavailable={unavailable}
          onRedeem={onRedeem}
        />
      </div>
    </SpotlightCard>
  );
}

function FeaturedBadge() {
  return (
    <div className="flex absolute left-3 top-3 z-10 shrink-0 items-center gap-2 rounded-full border-2 border-orange-300/50 bg-gradient-to-br from-neutral-900 via-orange-300/30 backdrop-blur-3xl to-neutral-900 px-2 py-1 font-mono font-semibold shadow-[4px_4px_10px_rgba(0,0,0,0.4)] saturate-150  hover:saturate-200 sm:px-4 sm:py-0.5 text-orange-300">
      <IconStarFilled size={13} />
      Destacado
    </div>
  );
}

function UnavailableBadge({ outOfStock }) {
  return (
    <div className="absolute right-3 top-3 z-10 rounded-full border border-neutral-500/40 bg-black/55 px-3 py-1 text-xs font-bold uppercase text-neutral-300 backdrop-blur">
      {outOfStock ? "Agotado" : "Deshabilitado"}
    </div>
  );
}

function ProductInfo({ product }) {
  return (
    <div>
      <div className="grid justify-items-center gap-2">
        <h2 className="line-clamp-2 text-lg font-black leading-tight text-[#eceff1]">
          {product.title}
        </h2>
        <span
          className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase ${
            product.featured
              ? "border-white/15 bg-white/[0.06] text-neutral-200"
              : "border-white/10 bg-white/[0.03] text-neutral-400"
          }`}
        >
          {product.category}
        </span>
      </div>
      <p className="mx-auto mt-3 line-clamp-2 min-h-10 max-w-[16rem] text-sm font-semibold leading-5 text-neutral-500">
        {product.description || "Producto disponible en la tienda."}
      </p>
    </div>
  );
}

function ProductPrice({ product, outOfStock, unavailable }) {
  const isDisabled = product.status === "disabled";

  return (
    <div className="grid justify-items-center gap-2">
      <p className="flex items-center justify-center gap-2 text-2xl font-black text-amber-300">
        <Image src={coins} alt="Creditos" className="size-5" />
        {formatNumber(product.price)}
      </p>
      <div className="text-center text-xs font-black uppercase text-neutral-600">
        <p className={outOfStock ? "text-red-200" : ""}>
          {outOfStock
            ? "Sin stock"
            : product.infiniteStock
              ? "Ilimitado"
              : `${product.stock} restantes`}
        </p>
        <p
          className={`mt-1 normal-case ${unavailable ? "text-neutral-600" : "text-green-300"}`}
        >
          {outOfStock
            ? "Agotado"
            : isDisabled
              ? "Deshabilitado"
              : product.status === "active"
                ? "Activo"
                : "Fuera de tienda"}
        </p>
      </div>
    </div>
  );
}

function RedeemButton({
  product,
  disabled,
  outOfStock,
  isDisabled,
  unavailable,
  onRedeem,
}) {
  return (
    <button
      disabled={disabled}
      onClick={() => onRedeem(product)}
      aria-label={`Canjear producto ${product.title}`}
      data-spotlight-cta
      className="spotlight-cta mt-auto inline-flex min-h-11 min-w-36 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-white/10 px-5 py-3 text-xs font-black focus:outline-none focus:ring-2 focus:ring-red-300/50 disabled:cursor-not-allowed disabled:bg-neutral-900 disabled:text-neutral-500 disabled:shadow-none"
    >
      {unavailable ? <IconLock size={18} /> : <IconShoppingCart size={18} />}
      {outOfStock ? "Sin stock" : isDisabled ? "Deshabilitado" : "Canjear"}
    </button>
  );
}
