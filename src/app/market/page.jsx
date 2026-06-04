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
import ActionSummary from "@/modules/market/components/action-summary";
import CreditPackagesSection from "@/modules/market/components/credit-packages-section";
import MarketToolbar from "@/modules/market/components/market-toolbar";
import ProductsGrid from "@/modules/market/components/products-grid";
import {
  getActionConfirmation,
  getRedemptionQuantity,
  saveLocalRedemption,
} from "@/modules/market/lib/market-utils";

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
          await confirmProductRedemption({
            action,
            loadMarket,
            refreshUser,
            setProducts,
          });
          return;
        }

        await purchaseCreditPackage(action.item.id);
        toast.success("Creditos acreditados");
        await Promise.resolve(refreshUser?.()).catch(() => {});
      } catch {
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
      <CreditPackagesSection
        creditPackages={normalizedCreditPackages}
        pendingAction={pendingAction}
        isPending={isPending}
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
        pendingAction={pendingAction}
        isPending={isPending}
        onRedeem={handleRequestRedeem}
      />

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
                current ? { ...current, quantity } : current,
              )
            }
          />
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

  return "Canje solicitado";
}
