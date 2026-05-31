import { formatDateInput } from "./formatters";

export function productToForm(product) {
  return {
    title: product.title,
    description: product.description,
    price: String(product.price),
    stock: String(product.stock),
    category: product.category,
    imageUrl: product.imageUrl,
    imageFile: null,
    status: product.status,
    featured: product.featured,
    rewardEffectType: product.rewardEffectType,
    rewardEffectValue: product.rewardEffectValue || "happy",
    rewardEffectDurationMinutes: String(product.rewardEffectDurationMinutes || 60),
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
