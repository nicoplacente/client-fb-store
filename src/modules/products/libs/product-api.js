import { envConfig } from "@/config";
import {
  apiBlobRequest,
  apiRequest,
  buildResourceUrl,
} from "@/modules/api/client";

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

export async function redeemProduct(
  productId,
  {
    quantity = 1,
    moderationTargetMode,
    moderationTargetKickId,
  } = {},
) {
  return apiRequest(`${buildResourceUrl(envConfig.API_PRODUCTS, productId)}/redeem`, {
    method: "POST",
    body: {
      quantity: Math.max(1, Math.floor(Number(quantity || 1))),
      ...(moderationTargetMode
        ? {
            moderationTargetMode,
          }
        : {}),
      ...(moderationTargetKickId
        ? {
            moderationTargetKickId,
          }
        : {}),
    },
  });
}

export async function getProductModerationTargets(productId) {
  const data = await apiRequest(
    `${buildResourceUrl(envConfig.API_PRODUCTS, productId)}/moderation-targets`,
  );

  return Array.isArray(data) ? data : data.targets || [];
}

export async function executeWheelRedemptionEffect(redemptionId) {
  return apiRequest(
    `${envConfig.API_PRODUCTS}/redemptions/${redemptionId}/wheel-effect`,
    {
      method: "POST",
    },
  );
}

export async function uploadRedemptionAudio(redemptionId, audioBlob) {
  const formData = new FormData();
  const extension = getAudioExtension(audioBlob.type);

  formData.append(
    "audio",
    audioBlob,
    `grabacion-${Date.now()}.${extension}`,
  );

  return apiRequest(
    `${envConfig.API_AUDIO_SUBMISSIONS}/${encodeURIComponent(redemptionId)}`,
    {
      method: "POST",
      body: formData,
    },
  );
}

export async function getRedemptionAudioBlob(redemptionId) {
  return apiBlobRequest(
    `${envConfig.API_AUDIO_SUBMISSIONS}/${encodeURIComponent(redemptionId)}/file`,
  );
}

export async function approveRedemptionAudio(redemptionId) {
  return apiRequest(
    `${envConfig.API_AUDIO_SUBMISSIONS}/${encodeURIComponent(redemptionId)}/approve`,
    {
      method: "POST",
    },
  );
}

export async function rejectRedemptionAudio(redemptionId, reason) {
  return apiRequest(
    `${envConfig.API_AUDIO_SUBMISSIONS}/${encodeURIComponent(redemptionId)}/reject`,
    {
      method: "POST",
      body: {
        reason,
      },
    },
  );
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
    productEffectType: redemption.productEffectType || "",
    productEffectDurationMinutes: Number(
      redemption.productEffectDurationMinutes || 0,
    ),
    productEffectTargetKickId:
      redemption.productEffectTargetKickId || "",
    productEffectTargetUsername:
      redemption.productEffectTargetUsername || "",
    productEffectStatus:
      redemption.productEffectStatus || "not_applicable",
    audioStatus: redemption.audioStatus || "not_applicable",
    audioAttemptsUsed: Number(redemption.audioAttemptsUsed || 0),
    audioRejectionReason: redemption.audioRejectionReason || "",
    audioPlayedAt: redemption.audioPlayedAt || "",
    audioSubmission: normalizeAudioSubmission(redemption.audioSubmission),
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
    audioMaxDurationSeconds: Math.min(
      60,
      Math.max(5, Number(product.audioMaxDurationSeconds || 15)),
    ),
    alertEnabled: Boolean(product.alertEnabled),
    alertType: product.alertType || "confetti",
    alertMessage: product.alertMessage || "",
    alertDurationSeconds: Number(product.alertDurationSeconds || 8),
  };
}

function normalizeAudioSubmission(submission) {
  if (!submission?.id) return null;

  return {
    id: submission.id,
    redemptionId: submission.redemptionId,
    status: submission.status || "",
    attemptNumber: Number(submission.attemptNumber || 0),
    mimeType: submission.mimeType || "",
    fileSize: Number(submission.fileSize || 0),
    durationSeconds: Number(submission.durationSeconds || 0),
    reviewedAt: submission.reviewedAt || "",
    approvedAt: submission.approvedAt || "",
    createdAt: submission.createdAt || "",
    updatedAt: submission.updatedAt || "",
  };
}

function getAudioExtension(mimeType) {
  const normalized = String(mimeType || "").toLowerCase();

  if (normalized.includes("ogg")) return "ogg";
  if (normalized.includes("mp4")) return "m4a";
  if (normalized.includes("mpeg")) return "mp3";
  if (normalized.includes("wav")) return "wav";

  return "webm";
}
