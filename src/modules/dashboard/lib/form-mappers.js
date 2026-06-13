import { formatDateInput } from "./formatters";

export function productToForm(product) {
  return {
    title: product.title,
    description: product.description,
    price: String(product.price),
    stock: String(product.stock),
    infiniteStock: Boolean(product.infiniteStock),
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
    alertEnabled: Boolean(product.alertEnabled),
    alertType: product.alertType || "confetti",
    alertMessage: product.alertMessage || "",
    alertDurationSeconds: String(product.alertDurationSeconds || 8),
  };
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
