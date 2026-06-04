import { formatProductStatus } from "../../lib/formatters";

const rewardEffectLabels = {
  happy: "Happy Hour",
  opening: "Opening Hour",
  bertello_snack: "Bertello-Snack Hour",
};

export function formatProductRewardEffect(product) {
  if (product.rewardEffectType === "restore_stream_streak") {
    return "Recupera racha perdida";
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
  const stockDetail = `${
    product.stock > 0 ? `${product.stock} disponibles` : "Sin stock"
  } - ${formatProductStatus(product.status)}`;

  return [stockDetail, rewardEffect, streamAlert].filter(Boolean).join(" - ");
}
