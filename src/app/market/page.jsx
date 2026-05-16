"use client";

import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import {
  IconBrandKick,
  IconCoins,
  IconPackage,
  IconSearch,
  IconShoppingCart,
} from "@tabler/icons-react";
import { toast } from "sonner";
import SectionContainer from "@/modules/ui/section-container";
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
import Image from "next/image";

function formatNumber(value) {
  return Number(value || 0).toLocaleString("es-AR");
}

function CreditPackageCard({ creditPackage, onPurchase, disabled }) {
  return (
    <article className="relative overflow-hidden rounded-lg border border-yellow-300/20 bg-neutral-950/75 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">{creditPackage.name}</h2>
          <p className="mt-2 min-h-10 text-sm text-neutral-400">
            {creditPackage.description || "Compra creditos usando tus puntos."}
          </p>
        </div>
        <span className="inline-flex size-10 items-center justify-center rounded-md bg-yellow-300/10 text-yellow-300">
          <IconCoins size={22} />
        </span>
      </div>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs text-neutral-500">Recibis</p>
          <p className="mt-1 flex items-center gap-2 text-3xl font-black text-yellow-300">
            <Image src={coins} alt="Creditos" className="size-7" />
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
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-yellow-500 px-4 py-2.5 text-sm font-black text-neutral-950 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500 cursor-pointer"
      >
        <IconShoppingCart size={18} />
        Comprar creditos
      </button>
    </article>
  );
}

function ProductCard({ product, onRedeem, disabled }) {
  return (
    <article className="overflow-hidden rounded-lg border border-white/10 bg-neutral-950/75">
      <div className="aspect-[4/3] bg-neutral-900">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="h-full w-full object-cover"
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
            <span className="rounded-md border border-white/10 px-2 py-1 text-xs text-neutral-400">
              {product.category}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 min-h-10 text-sm text-neutral-400">
            {product.description || "Producto disponible en el market."}
          </p>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs text-neutral-500">Precio</p>
            <p className="mt-1 flex items-center gap-2 text-2xl font-black text-yellow-300">
              <Image src={coins} alt="Creditos" className="size-6" />
              {product.price.toLocaleString()}
            </p>
          </div>
          <div className="text-right text-sm text-neutral-500">
            <p>{product.stock} restantes</p>
            <p className={product.status === "active" ? "text-green-300" : "text-neutral-500"}>
              {product.status === "active" ? "Activo" : "No disponible"}
            </p>
          </div>
        </div>

        <button
          disabled={disabled || product.status !== "active" || product.stock <= 0}
          onClick={() => onRedeem(product)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
        >
          <IconShoppingCart size={18} />
          Canjear
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
  const [isPending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);

  const normalizedProducts = useMemo(
    () =>
      products
        .map(normalizeProduct)
        .filter((product) => product.id && product.status !== "archived"),
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

    return normalizedProducts.filter((product) => {
      const matchesCategory = category === "all" || product.category === category;
      const matchesQuery =
        !term ||
        product.title.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term);

      return matchesCategory && matchesQuery;
    });
  }, [category, deferredQuery, normalizedProducts]);

  useEffect(() => {
    let cancelled = false;

    async function loadMarket() {
      try {
        setLoading(true);
        setError("");
        const [productData, creditPackageData] = await Promise.all([
          getProducts(),
          getCreditPackages(),
        ]);

        if (!cancelled) {
          setProducts(productData);
          setCreditPackages(creditPackageData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "No se pudo cargar el market");
          setProducts([]);
          setCreditPackages([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMarket();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleRedeem(product) {
    startTransition(async () => {
      try {
        await redeemProduct(product.id);
        toast.success("Canje solicitado");
        await refreshUser?.();
      } catch (err) {
        toast.error(err.message || "No se pudo solicitar el canje");
      }
    });
  }

  function handlePurchaseCredits(creditPackage) {
    startTransition(async () => {
      try {
        await purchaseCreditPackage(creditPackage.id);
        toast.success("Creditos acreditados");
        await refreshUser?.();
      } catch (err) {
        toast.error(err.message || "No se pudieron comprar creditos");
      }
    });
  }

  return (
    <SectionContainer className="space-y-8">

     {normalizedCreditPackages.length > 0 ? (
        <section className="space-y-5">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase text-yellow-300/80">
              Compra creditos
            </p>
            <h2 className="mt-2 text-3xl font-bold text-white">
              Converti tus puntos en creditos
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-neutral-400">
              Usa tus puntos del canal para cargar creditos y canjear productos.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {normalizedCreditPackages.map((creditPackage) => (
              <CreditPackageCard
                key={creditPackage.id}
                creditPackage={creditPackage}
                onPurchase={handlePurchaseCredits}
                disabled={isPending}
              />
            ))}
          </div>
        </section>
      ) : null}


      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-red-300/80">Tienda</p>
          <h1 className="mt-2 text-4xl font-bold text-white">Canjeá tus creditos</h1>
          <p className="mt-3 max-w-2xl text-neutral-400">
            Productos, codigos y recompensas disponibles para la comunidad.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex min-w-64 items-center gap-2 rounded-md border border-white/10 bg-neutral-950/80 px-3 py-2 text-neutral-400">
            <IconSearch size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar producto"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-neutral-600"
            />
          </label>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-md border border-white/10 bg-neutral-950/80 px-3 py-2 text-sm text-white outline-none"
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
          Cargando market...
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
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onRedeem={handleRedeem}
              disabled={isPending}
            />
          ))}
        </div>
      )}
    </SectionContainer>
  );
}
