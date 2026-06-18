import { formatDateInput } from "./formatters";
import { createEmptyScreamerOption } from "./constants";

export function productToForm(product) {
  return {
    title: product.title,
    description: product.description,
    price: String(product.price),
    stock: String(product.stock),
    infiniteStock: Boolean(product.infiniteStock),
    singleUnitPerRedemption: Boolean(product.singleUnitPerRedemption),
    category: product.category,
    imageUrl: product.imageUrl,
    imageFile: null,
    status: product.status,
    featured: product.featured,
    rewardEffectType: product.rewardEffectType,
    rewardEffectValue:
      product.rewardEffectType === "stream_special_hour"
        ? "happy"
        : product.rewardEffectValue || "happy",
    rewardEffectDurationMinutes:
      product.rewardEffectType === "stream_special_hour"
        ? "60"
        : product.rewardEffectType === "kick_timeout_user"
          ? String(product.rewardEffectDurationMinutes || 10)
          : String(product.rewardEffectDurationMinutes || 60),
    audioMaxDurationSeconds: String(product.audioMaxDurationSeconds || 15),
    screamerOptions: getScreamerOptions(product),
    screamerDurationSeconds: String(product.screamerDurationSeconds || 5),
    screamerVolume: String(product.screamerVolume ?? 1),
    alertEnabled: Boolean(product.alertEnabled),
    alertType: product.alertType || "confetti",
    alertMessage: product.alertMessage || "",
    alertDurationSeconds: String(product.alertDurationSeconds || 8),
  };
}

function getScreamerOptions(product) {
  const options = Array.isArray(product.screamerOptions)
    ? product.screamerOptions
    : [];
  const source = options.length
    ? options
    : product.screamerGifUrl && product.screamerAudioUrl
      ? [
          {
            name: "Opción 1",
            gifUrl: product.screamerGifUrl,
            audioUrl: product.screamerAudioUrl,
          },
        ]
      : [];

  if (!source.length) return [createEmptyScreamerOption()];

  return source.map((option) => ({
    clientId: option.id
      ? `screamer-option-${option.id}`
      : createEmptyScreamerOption().clientId,
    id: option.id || null,
    name: option.name || "",
    gifUrl: option.gifUrl || "",
    gifFile: null,
    audioUrl: option.audioUrl || "",
    audioFile: null,
  }));
}

export function creditPackageToForm(creditPackage) {
  return {
    name: creditPackage.name,
    description: creditPackage.description,
    credits: String(creditPackage.credits),
    pointsCost: String(creditPackage.pointsCost),
    status: creditPackage.status,
    sortOrder: String(creditPackage.sortOrder),
  };
}

export function giveawayToForm(giveaway) {
  return {
    title: giveaway.title,
    description: giveaway.description,
    entryCost: String(giveaway.entryCost || 0),
    imageUrl: giveaway.imageUrl,
    imageFile: null,
    status: giveaway.status,
    startsAt: formatDateInput(giveaway.startsAt),
    endsAt: formatDateInput(giveaway.endsAt),
  };
}
