export function formatNumber(value) {
  return Number(value || 0).toLocaleString("es-AR");
}

export function clampRedemptionQuantity(value, stock) {
  const maxStock = Math.max(1, Math.floor(Number(stock || 1)));
  const quantity = Math.floor(Number(value || 1));

  if (!Number.isFinite(quantity)) return 1;

  return Math.min(Math.max(quantity, 1), maxStock);
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

export function getActionConfirmation(action) {
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
