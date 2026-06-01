export function buildProductPayload(productForm) {
  return {
    title: productForm.title.trim(),
    description: productForm.description.trim(),
    price: Number(productForm.price),
    stock: Number(productForm.stock),
    category: productForm.category.trim() || "General",
    status: productForm.status,
    featured: productForm.featured,
    rewardEffectType: productForm.rewardEffectType,
    rewardEffectValue: productForm.rewardEffectType
      ? productForm.rewardEffectValue
      : "",
    rewardEffectDurationMinutes: productForm.rewardEffectType
      ? Number(productForm.rewardEffectDurationMinutes || 60)
      : "",
    alertEnabled: false,
    alertType: productForm.alertType || "confetti",
    alertMessage: productForm.alertMessage.trim(),
    alertDurationSeconds: Number(productForm.alertDurationSeconds || 8),
  };
}

export function buildCreditPackagePayload(creditPackageForm) {
  return {
    name: creditPackageForm.name.trim(),
    description: creditPackageForm.description.trim(),
    credits: Number(creditPackageForm.credits),
    pointsCost: Number(creditPackageForm.pointsCost),
    status: creditPackageForm.status,
    sortOrder: Number(creditPackageForm.sortOrder),
    source: "points",
  };
}

export function buildGiveawayPayload(giveawayForm) {
  return {
    title: giveawayForm.title.trim(),
    description: giveawayForm.description.trim(),
    entryCost: Number(giveawayForm.entryCost || 0),
    status: giveawayForm.status,
    startsAt: giveawayForm.startsAt,
    endsAt: giveawayForm.endsAt,
  };
}
