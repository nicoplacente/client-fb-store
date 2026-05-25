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
  IconCoins,
  IconLock,
  IconPackage,
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
      description: `Vas a gastar ${formatNumber(action.item.pointsCost)} puntos para recibir ${formatNumber(action.item.credits)} créditos.`,
      confirmLabel: "Comprar",
    };
  }

  return {
    title: "Confirmar canje",
    description: `Vas a gastar ${formatNumber(action.item.price)} créditos para solicitar este producto.`,
    confirmLabel: "Canjear",
  };
}

function ActionSummary({ action }) {
  const isPurchase = action.type === "purchase";
  const item = action.item;

  return (
    <div className="grid gap-3 text-sm text-neutral-300">
      <div className="flex items-center justify-between gap-4">
        <span className="text-neutral-400">
          {isPurchase ? "Paquete" : "Producto"}
        </span>
        <strong className="text-white">
          {isPurchase ? item.name : item.title}
        </strong>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-neutral-400">
          {isPurchase ? "Puntos a gastar" : "Créditos a gastar"}
        </span>
        <strong className="text-amber-300">
          {formatNumber(isPurchase ? item.pointsCost : item.price)}
        </strong>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-neutral-400">
          {isPurchase ? "Créditos que recibís" : "Stock restante"}
        </span>
        <strong className="text-white">
          {formatNumber(isPurchase ? item.credits : item.stock)}
        </strong>
      </div>
    </div>
  );
}

function CreditPackageCard({ creditPackage, onPurchase, disabled }) {
  return (
    <article className="relative overflow-hidden rounded-lg border border-yellow-300/20 bg-neutral-950/75 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">{creditPackage.name}</h2>
          <p className="mt-2 min-h-10 text-sm text-neutral-400">
            {creditPackage.description || "Comprá créditos usando tus puntos."}
          </p>
        </div>
        <span className="inline-flex size-10 items-center justify-center rounded-md bg-yellow-300/10 text-yellow-300">
          <IconCoins size={22} />
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs text-neutral-500">Recibís</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-black text-yellow-300 sm:text-3xl">
            <Image src={coins} alt="Créditos" className="size-7" />
            {formatNumber(creditPackage.credits)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-neutral-500">Costo</p>
          <p className="mt-1 inline-flex items-center gap-1 rounded-md border border-green-500/30 bg-green-500/10 px-2 py-1 text-sm font-bold text-green-300">
            <IconBrandKick size={16} />
            {formatNumber(creditPackage.pointsCost)}
          </p>
        </div>
      </div>

      <button
        disabled={disabled || creditPackage.status !== "active"}
        onClick={() => onPurchase(creditPackage)}
        aria-label={`Comprar pack ${creditPackage.name}`}
        className="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-yellow-500 px-4 py-2.5 text-sm font-black text-neutral-950 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
      >
        <IconShoppingCart size={18} />
        Comprar créditos
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
      className={`relative overflow-hidden rounded-lg border bg-neutral-950/75 transition ${
        product.featured
          ? "border-yellow-300/50 shadow-[0_0_0_1px_rgba(250,204,21,0.18)]"
          : "border-white/10"
      } ${outOfStock ? "opacity-75" : ""}`}
    >
      {product.featured ? (
        <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-md border border-yellow-300/40 bg-yellow-300/15 px-2 py-1 text-xs font-bold text-yellow-200 backdrop-blur">
          <IconStarFilled size={13} />
          Destacado
        </div>
      ) : null}

      {outOfStock || isDisabled ? (
        <div className="absolute right-3 top-3 z-10 rounded-md border border-neutral-500/40 bg-neutral-950/80 px-2 py-1 text-xs font-bold uppercase text-neutral-300 backdrop-blur">
          {outOfStock ? "Agotado" : "Deshabilitado"}
        </div>
      ) : null}

      <div className="relative aspect-[4/3] bg-neutral-900">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={`Imagen del producto ${product.title}`}
            className={`h-full w-full object-cover ${outOfStock ? "grayscale" : ""}`}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-600">
            <IconPackage size={48} />
          </div>
        )}
      </div>
      <div className="space-y-4 p-5">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-bold text-white">{product.title}</h2>
            <span
              className={`rounded-md border px-2 py-1 text-xs ${
                product.featured
                  ? "border-yellow-300/30 bg-yellow-300/10 text-yellow-200"
                  : "border-white/10 text-neutral-400"
              }`}
            >
              {product.category}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 min-h-10 text-sm text-neutral-400">
            {product.description || "Producto disponible en la tienda."}
          </p>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs text-neutral-500">Precio</p>
            <p className="mt-1 flex items-center gap-2 text-2xl font-black text-yellow-300">
              <Image src={coins} alt="Créditos" className="size-6" />
              {formatNumber(product.price)}
            </p>
          </div>
          <div className="text-right text-sm text-neutral-500">
            <p className={outOfStock ? "font-semibold text-red-200" : ""}>
              {outOfStock ? "Sin stock" : `${product.stock} restantes`}
            </p>
            <p className={unavailable ? "text-neutral-500" : "text-green-300"}>
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
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
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
          const result = await redeemProduct(action.item.id);

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
        toast.success("Créditos acreditados");
        await Promise.resolve(refreshUser?.()).catch(() => {});
      } catch (err) {
        toast.error(err.message || "No se pudo completar la operación");

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
        <section className="space-y-5">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase text-yellow-300/80">
              Compra créditos
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
              Convertí tus puntos en créditos
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-neutral-400">
              Usa tus puntos del canal para cargar créditos y canjear productos.
            </p>
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
        </section>
      ) : null}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-red-300/80">
            Tienda
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
            Canjeá tus créditos
          </h1>
          <p className="mt-3 max-w-2xl text-neutral-400">
            Productos, códigos y recompensas disponibles para la comunidad.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <label className="flex w-full items-center gap-2 rounded-md border border-white/10 bg-neutral-950/80 px-3 py-2 text-neutral-400 sm:min-w-64">
            <IconSearch size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar producto"
              aria-label="Buscar producto"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-neutral-600"
            />
          </label>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filtrar productos por categoría"
            className="w-full rounded-md border border-white/10 bg-neutral-950/80 px-3 py-2 text-sm text-white outline-none sm:w-auto"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item === "all" ? "Todas" : item}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border border-white/10 bg-neutral-950/70 p-10 text-center text-neutral-400">
          Cargando tienda...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-10 text-center text-red-200">
          {error}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-neutral-950/70 p-10 text-center text-neutral-400">
          No hay productos para mostrar.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
        {pendingAction ? <ActionSummary action={pendingAction} /> : null}
      </ConfirmationDialog>
    </SectionContainer>
  );
}
