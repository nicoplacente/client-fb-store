import { formatProductStatus } from "../../lib/formatters";

const rewardEffectLabels = {
  happy: "Happy Hour",
  opening: "Opening Hour",
  bertello_snack: "Bertello-Snack Hour",
};

export function formatProductRewardEffect(product) {
  if (product.rewardEffectType === "unique") {
    return "Único por usuario";
  }

  if (product.rewardEffectType === "restore_stream_streak") {
    return "Recupera racha perdida";
  }

  if (product.rewardEffectType === "kick_timeout_user") {
    const duration = Number(product.rewardEffectDurationMinutes || 10);

    return `Timeout dirigido de ${duration} min`;
  }

  if (product.rewardEffectType === "kick_unban_self") {
    return "Desbanea al comprador en Kick";
  }

  if (product.rewardEffectType === "desktop_screamer") {
    return `Screamer de escritorio (${product.screamerDurationSeconds || 5}s)`;
  }

  if (product.rewardEffectType !== "stream_special_hour") return "";

  const label = rewardEffectLabels[product.rewardEffectValue] || "Hora especial";
  const duration = Number(product.rewardEffectDurationMinutes || 60);

  return `Activa ${label} por ${duration} min`;
}

export function formatProductAlert(product) {
  if (!product.alertEnabled) return "";

  const labels = {
    confetti: "Confetti",
    fire: "Fuego",
    legendary: "Legendaria",
  };

  return `Alerta ${labels[product.alertType] || "especial"} (${product.alertDurationSeconds || 8}s)`;
}

export function getProductCardDetails(product) {
  const rewardEffect = formatProductRewardEffect(product);
  const streamAlert = formatProductAlert(product);
  const stockLabel = product.infiniteStock
    ? "Stock infinito"
    : product.stock > 0
      ? `${product.stock} disponibles`
      : "Sin stock";
  const stockDetail = `${stockLabel} - ${formatProductStatus(product.status)}`;
  const purchaseLimit = product.singleUnitPerRedemption
    ? "Una unidad por canje"
    : "";

  return [stockDetail, purchaseLimit, rewardEffect, streamAlert]
    .filter(Boolean)
    .join(" - ");
}
