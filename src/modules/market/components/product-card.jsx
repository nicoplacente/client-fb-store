import Image from "next/image";
import {
  IconLock,
  IconPackage,
  IconShoppingCart,
  IconStarFilled,
} from "@tabler/icons-react";
import coins from "@/assets/coins.webp";
import { formatNumber } from "../lib/market-utils";

export default function ProductCard({ product, onRedeem, disabled }) {
  const outOfStock = product.stock <= 0;
  const isDisabled = product.status === "disabled";
  const unavailable = product.status !== "active" || outOfStock;

  return (
    <article
      className={`group relative flex min-h-[356px] flex-col items-center overflow-visible rounded-[14px] border bg-[#090b10]/90 p-5 pb-0 text-center shadow-xl shadow-black/25 ring-1 ring-white/[0.03] transition duration-300 hover:-translate-y-1 hover:bg-[#0c0e14] ${
        product.featured
          ? "border-amber-300/45 shadow-[0_0_0_1px_rgba(251,191,36,0.14)] hover:border-amber-300/60"
          : "border-white/10 hover:border-red-300/25"
      } ${outOfStock ? "opacity-75" : ""}`}
    >
      {product.featured ? <FeaturedBadge /> : null}
      {outOfStock || isDisabled ? <UnavailableBadge outOfStock={outOfStock} /> : null}

      <div className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-xl bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.045),transparent_58%)] sm:h-44">
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
        <ProductPrice product={product} outOfStock={outOfStock} unavailable={unavailable} />
        <RedeemButton
          product={product}
          disabled={disabled || unavailable}
          outOfStock={outOfStock}
          isDisabled={isDisabled}
          unavailable={unavailable}
          onRedeem={onRedeem}
        />
      </div>
    </article>
  );
}

function FeaturedBadge() {
  return (
    <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full border border-amber-300/40 bg-amber-300/15 px-3 py-1 text-xs font-bold text-amber-100 backdrop-blur">
      <IconStarFilled size={13} />
      Destacado
    </div>
  );
}

function UnavailableBadge({ outOfStock }) {
  return (
    <div className="absolute right-3 top-3 z-10 rounded-full border border-neutral-500/40 bg-neutral-950/80 px-3 py-1 text-xs font-bold uppercase text-neutral-300 backdrop-blur">
      {outOfStock ? "Agotado" : "Deshabilitado"}
    </div>
  );
}

function ProductInfo({ product }) {
  return (
    <div>
      <div className="grid justify-items-center gap-2">
        <h2 className="line-clamp-2 text-lg font-black leading-tight text-white">
          {product.title}
        </h2>
        <span
          className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase ${
            product.featured
              ? "border-amber-300/30 bg-amber-300/10 text-amber-100"
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
          {outOfStock ? "Sin stock" : `${product.stock} restantes`}
        </p>
        <p className={`mt-1 normal-case ${unavailable ? "text-neutral-600" : "text-green-300"}`}>
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
      className="relative -bottom-4 inline-flex min-w-36 cursor-pointer items-center justify-center gap-2 rounded-full border border-white/10 bg-red-600 px-5 py-3 text-xs font-black text-white shadow-lg shadow-red-950/25 transition hover:-translate-y-0.5 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-300/50 disabled:cursor-not-allowed disabled:bg-neutral-900 disabled:text-neutral-500 disabled:shadow-none"
    >
      {unavailable ? <IconLock size={18} /> : <IconShoppingCart size={18} />}
      {outOfStock ? "Sin stock" : isDisabled ? "Deshabilitado" : "Canjear"}
    </button>
  );
}
