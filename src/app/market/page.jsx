"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import Image from "next/image";
import {
  IconBrandKick,
  IconChevronDown,
  IconCoins,
  IconLock,
  IconMinus,
  IconPackage,
  IconPlus,
  IconSearch,
  IconShoppingCart,
  IconStarFilled,
} from "@tabler/icons-react";
import { toast } from "sonner";
import SectionContainer from "@/modules/ui/section-container";
import ConfirmationDialog from "@/modules/ui/confirmation-dialog";
import useAppContext from "@/context/use-app-context";
import { AuthContext } from "@/context/auth-context/auth-context";
import {
  getProducts,
  normalizeProduct,
  redeemProduct,
} from "@/modules/products/libs/product-api";
import {
  getCreditPackages,
  normalizeCreditPackage,
  purchaseCreditPackage,
} from "@/modules/credits/libs/credit-api";
import coins from "@/assets/coins.webp";

function formatNumber(value) {
  return Number(value || 0).toLocaleString("es-AR");
}

function clampRedemptionQuantity(value, stock) {
  const maxStock = Math.max(1, Math.floor(Number(stock || 1)));
  const quantity = Math.floor(Number(value || 1));

  if (!Number.isFinite(quantity)) return 1;

  return Math.min(Math.max(quantity, 1), maxStock);
}

function saveLocalRedemption(redemption) {
  if (typeof window === "undefined" || !redemption?.id) return;

  try {
    const current = JSON.parse(
      window.localStorage.getItem("fbStoreLocalRedemptions") || "[]"
    );
    const next = [
      redemption,
      ...current.filter((item) => String(item.id) !== String(redemption.id)),
    ].slice(0, 30);

    window.localStorage.setItem("fbStoreLocalRedemptions", JSON.stringify(next));
  } catch {
    try {
      window.localStorage.setItem(
        "fbStoreLocalRedemptions",
        JSON.stringify([redemption])
      );
    } catch {
      // Ignore storage write errors.
    }
  }
}

function getActionConfirmation(action) {
  if (!action) return null;

  if (action.type === "purchase") {
    return {
      title: "Confirmar compra",
      description: `Vas a usar ${formatNumber(action.item.pointsCost)} puntos y recibir ${formatNumber(action.item.credits)} creditos al instante.`,
      confirmLabel: "Comprar",
    };
  }

  const quantity = clampRedemptionQuantity(action.quantity, action.item.stock);
  const totalCost = Number(action.item.price || 0) * quantity;

  return {
    title: "Confirmar canje",
    description: `Vas a usar ${formatNumber(totalCost)} creditos para solicitar ${quantity} ${quantity === 1 ? "unidad" : "unidades"} de este producto.`,
    confirmLabel: "Canjear",
  };
}

function ActionSummary({ action, onQuantityChange }) {
  const isPurchase = action.type === "purchase";
  const item = action.item;
  const quantity = clampRedemptionQuantity(action.quantity, item.stock);
  const totalCost = Number(item.price || 0) * quantity;

  return (
    <div className="grid gap-3 text-sm text-neutral-300">
      <div className="flex items-center justify-between gap-4">
        <span className="text-neutral-400">
          {isPurchase ? "Paquete" : "Producto"}
        </span>
        <strong className="text-right text-white">
          {isPurchase ? item.name : item.title}
        </strong>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-neutral-400">
          {isPurchase ? "Puntos a usar" : "Creditos a usar"}
        </span>
        <strong className="text-amber-200">
          {formatNumber(isPurchase ? item.pointsCost : totalCost)}
        </strong>
      </div>
      {isPurchase ? (
        <div className="flex items-center justify-between gap-4">
          <span className="text-neutral-400">Creditos que recibis</span>
          <strong className="text-white">{formatNumber(item.credits)}</strong>
        </div>
      ) : (
        <QuantityControl
          value={quantity}
          max={item.stock}
          onChange={onQuantityChange}
        />
      )}
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
        <label
          htmlFor="redeem-quantity"
          className="text-sm font-semibold text-neutral-300"
        >
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

function CreditPackageCard({ creditPackage, onPurchase, disabled }) {
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

function ProductCard({ product, onRedeem, disabled }) {
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
      {product.featured ? (
        <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full border border-amber-300/40 bg-amber-300/15 px-3 py-1 text-xs font-bold text-amber-100 backdrop-blur">
          <IconStarFilled size={13} />
          Destacado
        </div>
      ) : null}

      {outOfStock || isDisabled ? (
        <div className="absolute right-3 top-3 z-10 rounded-full border border-neutral-500/40 bg-neutral-950/80 px-3 py-1 text-xs font-bold uppercase text-neutral-300 backdrop-blur">
          {outOfStock ? "Agotado" : "Deshabilitado"}
        </div>
      ) : null}

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

        <div className="grid justify-items-center gap-2">
          <div>
            <p className="flex items-center justify-center gap-2 text-2xl font-black text-amber-300">
              <Image src={coins} alt="Creditos" className="size-5" />
              {formatNumber(product.price)}
            </p>
          </div>
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

        <button
          disabled={disabled || unavailable}
          onClick={() => onRedeem(product)}
          aria-label={`Canjear producto ${product.title}`}
          className="relative -bottom-4 inline-flex min-w-36 cursor-pointer items-center justify-center gap-2 rounded-full border border-white/10 bg-red-600 px-5 py-3 text-xs font-black text-white shadow-lg shadow-red-950/25 transition hover:-translate-y-0.5 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-300/50 disabled:cursor-not-allowed disabled:bg-neutral-900 disabled:text-neutral-500 disabled:shadow-none"
        >
          {unavailable ? <IconLock size={18} /> : <IconShoppingCart size={18} />}
          {outOfStock ? "Sin stock" : isDisabled ? "Deshabilitado" : "Canjear"}
        </button>
      </div>
    </article>
  );
}

export default function MarketPage() {
  const { refreshUser } = useAppContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [creditPackages, setCreditPackages] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [isPending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);

  const normalizedProducts = useMemo(
    () =>
      products
        .map(normalizeProduct)
        .filter((product) => product.id && product.status !== "hidden"),
    [products]
  );

  const normalizedCreditPackages = useMemo(
    () =>
      creditPackages
        .map(normalizeCreditPackage)
        .filter((creditPackage) => creditPackage.id && creditPackage.enabled),
    [creditPackages]
  );

  const categories = useMemo(() => {
    const names = new Set(normalizedProducts.map((product) => product.category));
    return ["all", ...names];
  }, [normalizedProducts]);

  const filteredProducts = useMemo(() => {
    const term = deferredQuery.trim().toLowerCase();

    return normalizedProducts
      .filter((product) => {
        const matchesCategory =
          category === "all" || product.category === category;
        const matchesQuery =
          !term ||
          product.title.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term);

        return matchesCategory && matchesQuery;
      })
      .toSorted((a, b) => Number(b.featured) - Number(a.featured));
  }, [category, deferredQuery, normalizedProducts]);

  const loadMarket = useCallback(async ({ showLoading = true } = {}) => {
    try {
      if (showLoading) setLoading(true);
      setError("");
      const [productData, creditPackageData] = await Promise.all([
        getProducts(),
        getCreditPackages(),
      ]);

      setProducts(productData);
      setCreditPackages(creditPackageData);
    } catch (err) {
      setError(err.message || "No se pudo cargar la tienda");
      setProducts([]);
      setCreditPackages([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMarket();
  }, [loadMarket]);

  function handleRequestRedeem(product) {
    if (isPending) return;
    setPendingAction({
      type: "redeem",
      item: product,
      quantity: 1,
    });
  }

  function handleRequestPurchase(creditPackage) {
    if (isPending) return;
    setPendingAction({
      type: "purchase",
      item: creditPackage,
    });
  }

  function handleConfirmAction() {
    const action = pendingAction;

    if (!action) return;

    setPendingAction(null);

    startTransition(async () => {
      try {
        if (action.type === "redeem") {
          const quantity = clampRedemptionQuantity(
            action.quantity,
            action.item.stock
          );
          const result = await redeemProduct(action.item.id, {
            quantity,
          });

          if (result?.redemption) {
            saveLocalRedemption({
              ...result.redemption,
              product: result.product || action.item,
            });
          }

          if (result?.product) {
            setProducts((current) =>
              current.map((item) =>
                Number(item.id) === Number(result.product.id)
                  ? result.product
                  : item
              )
            );
          } else {
            await loadMarket({ showLoading: false });
          }

          toast.success("Canje solicitado");
          await Promise.resolve(refreshUser?.()).catch(() => {});
          return;
        }

        await purchaseCreditPackage(action.item.id);
        toast.success("Creditos acreditados");
        await Promise.resolve(refreshUser?.()).catch(() => {});
      } catch (err) {
        toast.error(err.message || "No se pudo completar la operacion");

        if (action.type === "redeem") {
          await loadMarket({ showLoading: false });
        }
      }
    });
  }

  const confirmation = getActionConfirmation(pendingAction);

  return (
    <SectionContainer className="space-y-8">
      {normalizedCreditPackages.length > 0 ? (
        <section className="relative overflow-hidden rounded-3xl border border-amber-300/15 bg-neutral-950/65 p-4 shadow-2xl shadow-black/25 ring-1 ring-white/[0.03] sm:p-6">
          <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/45 to-transparent" />
          <div className="relative space-y-5">
            <div className="flex flex-col gap-3 text-left lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-amber-200/80">
                  Packs de creditos
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                  Prepara saldo para canjear al instante
                </h2>
                <p className="mt-3 max-w-2xl text-neutral-400">
                  Usa tus puntos del canal para cargar creditos y desbloquear recompensas sin esperar.
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-xs font-bold text-amber-100">
                <IconCoins size={16} />
                Acreditacion inmediata
              </span>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {normalizedCreditPackages.map((creditPackage) => (
                <CreditPackageCard
                  key={creditPackage.id}
                  creditPackage={creditPackage}
                  onPurchase={handleRequestPurchase}
                  disabled={isPending || Boolean(pendingAction)}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(220,38,38,0.16),rgba(10,10,10,0.72)_38%,rgba(10,10,10,0.88))] p-4 shadow-2xl shadow-black/25 ring-1 ring-white/[0.03] sm:p-6">
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-red-200/45 to-transparent" />
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-red-300/80">
              Tienda
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
              Recompensas listas para la comunidad
            </h1>
            <p className="mt-3 max-w-2xl text-neutral-400">
              Explora productos, codigos y beneficios disponibles. Filtra rapido y canjea con tus creditos.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <label className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-neutral-950/80 px-3 py-2.5 text-neutral-400 shadow-inner shadow-black/20 transition focus-within:border-red-300/50 focus-within:ring-2 focus-within:ring-red-300/10 sm:min-w-72">
              <IconSearch size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar producto"
                aria-label="Buscar producto"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-neutral-600"
              />
            </label>
            <label className="relative w-full sm:w-auto">
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                aria-label="Filtrar productos por categoria"
                className="w-full cursor-pointer appearance-none rounded-xl border border-white/10 bg-neutral-950/80 px-3 py-2.5 pr-10 text-sm font-semibold text-white shadow-inner shadow-black/20 outline-none transition hover:border-red-300/30 focus:border-red-300/50 focus:ring-2 focus:ring-red-300/10 sm:w-auto"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item === "all" ? "Todas" : item}
                  </option>
                ))}
              </select>
              <IconChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500"
              />
            </label>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-neutral-950/75 p-10 text-center text-neutral-400 shadow-xl shadow-black/15">
          Cargando tienda...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-10 text-center text-red-200 shadow-xl shadow-black/15">
          {error}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-neutral-950/75 p-10 text-center text-neutral-400 shadow-xl shadow-black/15">
          No encontramos productos con esos filtros.
        </div>
      ) : (
        <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onRedeem={handleRequestRedeem}
              disabled={isPending || Boolean(pendingAction)}
            />
          ))}
        </div>
      )}

      <ConfirmationDialog
        open={Boolean(pendingAction)}
        title={confirmation?.title}
        description={confirmation?.description}
        confirmLabel={confirmation?.confirmLabel}
        onConfirm={handleConfirmAction}
        onCancel={() => setPendingAction(null)}
      >
        {pendingAction ? (
          <ActionSummary
            action={pendingAction}
            onQuantityChange={(quantity) =>
              setPendingAction((current) =>
                current ? { ...current, quantity } : current
              )
            }
          />
        ) : null}
      </ConfirmationDialog>
    </SectionContainer>
  );
}
