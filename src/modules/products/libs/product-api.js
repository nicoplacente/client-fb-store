import { envConfig } from "@/config";
import { apiRequest, buildResourceUrl } from "@/modules/api/client";

export async function getProducts({ includeDisabled = false } = {}) {
  const url = includeDisabled
    ? `${envConfig.API_PRODUCTS}?includeDisabled=true`
    : envConfig.API_PRODUCTS;
  const data = await apiRequest(url);
  return Array.isArray(data) ? data : data.products || [];
}

export async function createProduct(product) {
  return apiRequest(envConfig.API_PRODUCTS, {
    method: "POST",
    body: product,
  });
}

export async function updateProduct(productId, product) {
  return apiRequest(buildResourceUrl(envConfig.API_PRODUCTS, productId), {
    method: "PUT",
    body: product,
  });
}

export async function deleteProduct(productId) {
  return apiRequest(buildResourceUrl(envConfig.API_PRODUCTS, productId), {
    method: "DELETE",
  });
}

export async function redeemProduct(productId, { quantity = 1 } = {}) {
  return apiRequest(`${buildResourceUrl(envConfig.API_PRODUCTS, productId)}/redeem`, {
    method: "POST",
    body: {
      quantity: Math.max(1, Math.floor(Number(quantity || 1))),
    },
  });
}

export async function getMyProductRedemptions() {
  let data;

  try {
    data = await apiRequest(envConfig.API_USER_REDEMPTIONS);
  } catch {
    data = await apiRequest(envConfig.API_PRODUCT_REDEMPTIONS);
  }

  return Array.isArray(data) ? data : data.redemptions || [];
}

function normalizeStatus(status, enabled) {
  if (status === "draft") return "disabled";
  if (status === "archived") return "hidden";
  if (!status && enabled === false) return "disabled";
  return status || "active";
}

export function normalizeProductRedemption(redemption) {
  const product = redemption.product || {};

  return {
    id: redemption.id || redemption._id,
    status: redemption.status || "pending",
    cost: Number(redemption.cost || 0),
    quantity: Number(redemption.quantity || 1),
    wheelPrizeName:
      redemption.wheelPrizeName ||
      redemption.wheel?.winner?.name ||
      redemption.winner?.name ||
      "",
    wheelEffectType: redemption.wheelEffectType || "",
    wheelEffectValue: Number(redemption.wheelEffectValue || 0),
    wheelEffectStatus: redemption.wheelEffectStatus || "not_applicable",
    wheelEffectError: redemption.wheelEffectError || "",
    createdAt: redemption.createdAt || "",
    product: normalizeProduct(product),
  };
}

export function normalizeProduct(product) {
  const status = normalizeStatus(product.status, product.enabled);
  const rewardWheel =
    product.rewardWheel || product.rewardWheelConfig || product.wheel || {};
  const rewardWheelPrizes =
    product.rewardWheelPrizes ||
    product.wheelPrizes ||
    rewardWheel.prizes ||
    product.prizes ||
    [];

  return {
    id: product.id || product._id || product.slug || product.title,
    title: product.title || product.name || "Producto sin nombre",
    description: product.description || "",
    price: Number(product.price || product.cost || 0),
    stock: Number(product.stock || product.quantity || 0),
    infiniteStock: Boolean(product.infiniteStock),
    category: product.category || "General",
    imageUrl: product.imageUrl || product.image || product.img || "",
    status,
    featured: Boolean(product.featured),
    rewardEffectType: product.rewardEffectType || "",
    rewardWheelPrizes: Array.isArray(rewardWheelPrizes)
      ? rewardWheelPrizes
          .map((prize, index) => ({
            id: prize.id || prize._id || `reward-wheel-prize-${index}`,
            name: String(prize.name || prize.title || "").trim(),
            probability:
              prize.probabilityBasisPoints !== undefined
                ? Number(prize.probabilityBasisPoints || 0) / 100
                : Number(prize.probability || 0),
          }))
          .filter((prize) => prize.name && prize.probability > 0)
      : [],
    rewardEffectValue: product.rewardEffectValue || "",
    rewardEffectDurationMinutes: Number(product.rewardEffectDurationMinutes || 0),
    alertEnabled: Boolean(product.alertEnabled),
    alertType: product.alertType || "confetti",
    alertMessage: product.alertMessage || "",
    alertDurationSeconds: Number(product.alertDurationSeconds || 8),
  };
}
