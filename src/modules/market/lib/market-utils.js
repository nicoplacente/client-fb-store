export function formatNumber(value) {
  return Number(value || 0).toLocaleString("es-AR");
}

export function clampRedemptionQuantity(value, stock) {
  const maxStock = Math.max(1, Math.floor(Number(stock || 1)));
  const quantity = Math.floor(Number(value || 1));

  if (!Number.isFinite(quantity)) return 1;

  return Math.min(Math.max(quantity, 1), maxStock);
}

export function hasSingleRedemptionEffect(product) {
  return (
    product?.rewardEffectType === "stream_special_hour" ||
    product?.rewardEffectType === "restore_stream_streak"
  );
}

export function getRedemptionQuantity(value, product) {
  if (hasSingleRedemptionEffect(product)) return 1;

  if (product?.infiniteStock) {
    const quantity = Math.floor(Number(value || 1));

    return Number.isFinite(quantity) ? Math.max(quantity, 1) : 1;
  }

  return clampRedemptionQuantity(value, product?.stock);
}

export function getCreditPurchaseLimit(creditPackage, availablePoints) {
  const pointsCost = Number(creditPackage?.pointsCost || 0);
  const points = Number(availablePoints || 0);

  if (!Number.isFinite(pointsCost) || pointsCost <= 0) return 0;
  if (!Number.isFinite(points) || points <= 0) return 0;

  return Math.max(0, Math.floor(points / pointsCost));
}

export function getCreditPurchaseQuantity(value, creditPackage, availablePoints) {
  const limit = getCreditPurchaseLimit(creditPackage, availablePoints);
  const quantity = Math.floor(Number(value || 1));
  const safeQuantity = Number.isFinite(quantity) ? Math.max(1, quantity) : 1;

  if (limit <= 0) return 0;

  return Math.min(safeQuantity, limit);
}

export function saveLocalRedemption(redemption) {
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

export function getActionConfirmation(action, { availablePoints = 0 } = {}) {
  if (!action) return null;

  if (action.type === "purchase") {
    const quantity = getCreditPurchaseQuantity(
      action.quantity,
      action.item,
      availablePoints
    );
    const totalPointsCost = Number(action.item.pointsCost || 0) * quantity;
    const totalCredits = Number(action.item.credits || 0) * quantity;
    const hasEnoughPoints = quantity > 0;

    return {
      title: "Confirmar compra",
      description: hasEnoughPoints
        ? `Vas a usar ${formatNumber(totalPointsCost)} puntos y recibir ${formatNumber(totalCredits)} creditos al instante.`
        : `No tenes puntos suficientes para comprar este pack.`,
      confirmLabel: "Comprar",
      confirmDisabled: !hasEnoughPoints,
    };
  }

  const quantity = getRedemptionQuantity(action.quantity, action.item);
  const totalCost = Number(action.item.price || 0) * quantity;
  const singleRedemption = hasSingleRedemptionEffect(action.item);

  return {
    title: "Confirmar canje",
    description: singleRedemption
      ? `Vas a usar ${formatNumber(totalCost)} creditos para activar este canje.`
      : `Vas a usar ${formatNumber(totalCost)} creditos para solicitar ${quantity} ${quantity === 1 ? "unidad" : "unidades"} de este producto.`,
    confirmLabel: "Canjear",
  };
}
