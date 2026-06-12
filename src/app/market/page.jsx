"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";
import { IconSparkles } from "@tabler/icons-react";
import SectionContainer from "@/modules/ui/section-container";
import ConfirmationDialog from "@/modules/ui/confirmation-dialog";
import useAppContext from "@/context/use-app-context";
import { AuthContext } from "@/context/auth-context/auth-context";
import {
  getProducts,
  normalizeProduct,
  redeemProduct,
} from "@/modules/products/libs/product-api";
import { getErrorMessage } from "@/modules/api/error-message";
import {
  getCreditPackages,
  normalizeCreditPackage,
  purchaseCreditPackage,
} from "@/modules/credits/libs/credit-api";
import { getMyRanking } from "@/modules/ranking/libs/ranking-api";
import { emitKickPointsUpdated } from "@/modules/ranking/libs/points-events";
import ActionSummary from "@/modules/market/components/action-summary";
import CreditPackagesSection from "@/modules/market/components/credit-packages-section";
import MarketToolbar from "@/modules/market/components/market-toolbar";
import ProductsGrid from "@/modules/market/components/products-grid";
import ProductDetail, {
  WheelPrizes,
} from "@/modules/market/components/product-detail";
import {
  getActionConfirmation,
  getCreditPurchaseQuantity,
  getMaxCreditPurchasePlan,
  getRedemptionQuantity,
  saveLocalRedemption,
} from "@/modules/market/lib/market-utils";

export default function MarketPage() {
  const { user, refreshUser } = useAppContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [creditPackages, setCreditPackages] = useState([]);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [wheelResult, setWheelResult] = useState(null);
  const [wheelRedeeming, setWheelRedeeming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);
  const userId = user?.id;

  const normalizedProducts = useMemo(
    () =>
      products
        .map(normalizeProduct)
        .filter((product) => product.id && product.status !== "hidden"),
    [products],
  );
  const normalizedCreditPackages = useMemo(
    () =>
      creditPackages
        .map(normalizeCreditPackage)
        .filter((creditPackage) => creditPackage.id && creditPackage.enabled),
    [creditPackages],
  );
  const categories = useMemo(() => {
    const names = new Set(
      normalizedProducts.map((product) => product.category),
    );
    return ["all", ...names];
  }, [normalizedProducts]);
  const filteredProducts = useMemo(
    () => filterProducts(normalizedProducts, category, deferredQuery),
    [category, deferredQuery, normalizedProducts],
  );
  const maxPurchasePlan = useMemo(
    () => getMaxCreditPurchasePlan(normalizedCreditPackages, availablePoints),
    [availablePoints, normalizedCreditPackages],
  );

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
    } catch {
      setError("No se pudo cargar la tienda");
      setProducts([]);
      setCreditPackages([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMarket();
  }, [loadMarket]);

  const loadAvailablePoints = useCallback(async () => {
    if (!userId) {
      setAvailablePoints(0);
      return 0;
    }

    try {
      const ranking = await getMyRanking();
      const points = Number(ranking.points || 0);

      setAvailablePoints(points);
      return points;
    } catch {
      setAvailablePoints(0);
      return 0;
    }
  }, [userId]);

  useEffect(() => {
    loadAvailablePoints();
  }, [loadAvailablePoints]);

  const actionsDisabled = isPending;

  const handleRequestRedeem = useCallback((product) => {
    if (isPending) return;

    setWheelResult(null);
    setPendingAction({
      type: "redeem",
      item: product,
      quantity: 1,
    });
  }, [isPending]);

  const handleRequestPurchase = useCallback((creditPackage) => {
    if (isPending) return;

    setPendingAction({
      type: "purchase",
      item: creditPackage,
      quantity: getCreditPurchaseQuantity(1, creditPackage, availablePoints),
    });
  }, [availablePoints, isPending]);

  const handleRequestMaxPurchase = useCallback(() => {
    if (isPending || !maxPurchasePlan) return;

    setPendingAction({
      type: "bulkPurchase",
      plan: maxPurchasePlan,
    });
  }, [isPending, maxPurchasePlan]);

  const handleCancelAction = useCallback(() => {
    if (wheelRedeeming) return;

    setPendingAction(null);
    setWheelResult(null);
  }, [wheelRedeeming]);

  const handleQuantityChange = useCallback((quantity) => {
    setPendingAction((current) =>
      current ? { ...current, quantity } : current,
    );
  }, []);

  const handleConfirmAction = useCallback(() => {
    const action = pendingAction;
    if (!action) return;

    if (wheelResult) {
      setPendingAction(null);
      setWheelResult(null);
      return;
    }

    if (action.type === "redeem" && action.item.rewardEffectType === "reward_wheel") {
      setWheelRedeeming(true);

      startTransition(async () => {
        try {
          const result = await confirmProductRedemption({
            action,
            loadMarket,
            refreshUser,
            setProducts,
          });
          const winner = getWheelWinner(result);

          if (winner) {
            setWheelResult(winner);
          } else {
            toast.error("La ruleta se canjeó, pero no se pudo mostrar el premio");
            setPendingAction(null);
          }
        } catch (error) {
          toast.error(
            getErrorMessage(error, "No se pudo completar la operación"),
          );
          await loadMarket({ showLoading: false });
        } finally {
          setWheelRedeeming(false);
        }
      });
      return;
    }

    setPendingAction(null);

    startTransition(async () => {
      try {
        if (action.type === "redeem") {
          await confirmProductRedemption({
            action,
            loadMarket,
            refreshUser,
            setProducts,
          });
          return;
        }

        if (action.type === "bulkPurchase") {
          await confirmBulkCreditPurchase({
            action,
            loadAvailablePoints,
            refreshUser,
            setAvailablePoints,
          });
          return;
        }

        const quantity = getCreditPurchaseQuantity(
          action.quantity,
          action.item,
          availablePoints,
        );

        if (quantity < 1) {
          toast.error("Puntos insuficientes");
          return;
        }

        const result = await purchaseCreditPackage(action.item.id, {
          quantity,
        });
        const nextPoints = Number(result?.ranking?.points);

        if (Number.isFinite(nextPoints)) {
          setAvailablePoints(nextPoints);
          emitKickPointsUpdated(nextPoints);
        } else {
          const points = await loadAvailablePoints();
          emitKickPointsUpdated(points);
        }

        toast.success("Creditos acreditados");
        await Promise.resolve(refreshUser?.()).catch(() => {});
      } catch (error) {
        toast.error(
          getErrorMessage(error, "No se pudo completar la operacion"),
        );

        if (action.type === "redeem") {
          await loadMarket({ showLoading: false });
        }

        if (action.type === "bulkPurchase") {
          await loadAvailablePoints();
        }
      }
    });
  }, [
    availablePoints,
    loadAvailablePoints,
    loadMarket,
    pendingAction,
    refreshUser,
    startTransition,
    wheelResult,
  ]);

  const confirmation = useMemo(
    () => getActionConfirmation(pendingAction, { availablePoints }),
    [availablePoints, pendingAction],
  );

  return (
    <SectionContainer className="space-y-8">
      <CreditPackagesSection
        creditPackages={normalizedCreditPackages}
        disabled={actionsDisabled}
        onPurchase={handleRequestPurchase}
      />

      <MarketToolbar
        query={query}
        category={category}
        categories={categories}
        onQueryChange={setQuery}
        onCategoryChange={setCategory}
      />

      <ProductsGrid
        loading={loading}
        error={error}
        products={filteredProducts}
        disabled={actionsDisabled}
        onRedeem={handleRequestRedeem}
      />

      <ConfirmationDialog
        open={Boolean(pendingAction)}
        title={wheelResult ? "Resultado de la ruleta" : confirmation?.title}
        description={
          wheelResult
            ? "Tu premio quedó registrado en el historial de canjes."
            : confirmation?.description
        }
        confirmLabel={
          wheelResult
            ? "Cerrar"
            : wheelRedeeming
              ? "Girando..."
              : confirmation?.confirmLabel
        }
        cancelLabel={wheelResult ? "Volver a la tienda" : "Cancelar"}
        confirmDisabled={confirmation?.confirmDisabled || wheelRedeeming}
        cancelDisabled={wheelRedeeming}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
        aside={
          pendingAction?.type === "redeem" ? (
            <ProductDetail product={pendingAction.item} />
          ) : null
        }
        secondaryAside={
          pendingAction?.type === "redeem" &&
          pendingAction.item.rewardEffectType === "reward_wheel" ? (
            <WheelPrizes prizes={pendingAction.item.rewardWheelPrizes} />
          ) : null
        }
      >
        {pendingAction ? (
          wheelResult ? (
            <WheelResult winner={wheelResult} />
          ) : (
            <ActionSummary
              action={pendingAction}
              availablePoints={availablePoints}
              maxPurchasePlan={maxPurchasePlan}
              onMaxPurchase={handleRequestMaxPurchase}
              onQuantityChange={handleQuantityChange}
            />
          )
        ) : null}
      </ConfirmationDialog>
    </SectionContainer>
  );
}

function filterProducts(products, category, query) {
  const term = query.trim().toLowerCase();

  return products
    .filter((product) => {
      const matchesCategory =
        category === "all" || product.category === category;
      const matchesQuery =
        !term ||
        product.title.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term);

      return matchesCategory && matchesQuery;
    })
    .toSorted((a, b) => {
      const featuredOrder = Number(b.featured) - Number(a.featured);

      if (featuredOrder !== 0) return featuredOrder;

      return Number(b.price || 0) - Number(a.price || 0);
    });
}

async function confirmBulkCreditPurchase({
  action,
  loadAvailablePoints,
  refreshUser,
  setAvailablePoints,
}) {
  let lastResult = null;

  for (const item of action.plan.items) {
    lastResult = await purchaseCreditPackage(item.creditPackage.id, {
      quantity: item.quantity,
    });
  }

  const nextPoints = Number(lastResult?.ranking?.points);

  if (Number.isFinite(nextPoints)) {
    setAvailablePoints(nextPoints);
    emitKickPointsUpdated(nextPoints);
  } else {
    const points = await loadAvailablePoints();
    emitKickPointsUpdated(points);
  }

  toast.success("Creditos acreditados");
  await Promise.resolve(refreshUser?.()).catch(() => {});
}

async function confirmProductRedemption({
  action,
  loadMarket,
  refreshUser,
  setProducts,
}) {
  const quantity = getRedemptionQuantity(action.quantity, action.item);
  const result = await redeemProduct(action.item.id, { quantity });

  if (result?.redemption) {
    saveLocalRedemption({
      ...result.redemption,
      product: result.product || action.item,
    });
  }

  if (result?.product) {
    setProducts((current) =>
      current.map((item) =>
        Number(item.id) === Number(result.product.id) ? result.product : item,
      ),
    );
  } else {
    await loadMarket({ showLoading: false });
  }

  toast.success(getRedemptionSuccessMessage(result, action.item));
  await Promise.resolve(refreshUser?.()).catch(() => {});

  return result;
}

function getWheelWinner(result) {
  const winner = result?.wheel?.winner || result?.winner;
  const name =
    result?.redemption?.wheelPrizeName ||
    winner?.name ||
    result?.wheelPrizeName ||
    "";

  if (!name) return null;

  return {
    id: winner?.id || name,
    name: String(name).trim(),
  };
}

function WheelResult({ winner }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="grid justify-items-center gap-4 py-5 text-center"
    >
      <span className="grid size-16 place-items-center rounded-2xl border border-fuchsia-300/25 bg-fuchsia-400/10 text-fuchsia-200">
        <IconSparkles size={30} aria-hidden="true" />
      </span>
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-200">
          Premio obtenido
        </p>
        <p className="mt-2 text-2xl font-black leading-tight text-white">
          {winner.name}
        </p>
      </div>
      <p className="max-w-sm text-sm leading-6 text-neutral-400">
        Podés consultar este resultado nuevamente desde tu historial de canjes.
      </p>
    </div>
  );
}

function getRedemptionSuccessMessage(result, product) {
  if (
    result?.restoredStreak ||
    product.rewardEffectType === "restore_stream_streak"
  ) {
    return "Racha recuperada";
  }

  if (
    result?.specialHour ||
    product.rewardEffectType === "stream_special_hour"
  ) {
    return "Hora activada";
  }

  if (result?.wheel || product.rewardEffectType === "reward_wheel") {
    return "Ruleta activada";
  }

  return "Canje solicitado";
}
