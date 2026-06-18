export function buildProductPayload(productForm) {
  return {
    title: productForm.title.trim(),
    description: productForm.description.trim(),
    price: Number(productForm.price),
    stock: Number(productForm.stock),
    infiniteStock: Boolean(productForm.infiniteStock),
    singleUnitPerRedemption: Boolean(productForm.singleUnitPerRedemption),
    category: productForm.category.trim() || "General",
    status: productForm.status,
    featured: productForm.featured,
    rewardEffectType: productForm.rewardEffectType,
    rewardEffectValue: productForm.rewardEffectType === "stream_special_hour"
      ? "happy"
      : "",
    rewardEffectDurationMinutes:
      productForm.rewardEffectType === "stream_special_hour"
        ? 60
        : productForm.rewardEffectType === "kick_timeout_user"
          ? Number(productForm.rewardEffectDurationMinutes || 10)
          : "",
    audioMaxDurationSeconds:
      productForm.rewardEffectType === "audio_submission"
        ? Number(productForm.audioMaxDurationSeconds || 15)
        : 15,
    screamerOptions:
      productForm.rewardEffectType === "desktop_screamer"
        ? productForm.screamerOptions.map((option) => ({
            name: option.name.trim(),
            gifUrl: option.gifUrl.trim(),
            audioUrl: option.audioUrl.trim(),
          }))
        : [],
    screamerDurationSeconds:
      productForm.rewardEffectType === "desktop_screamer"
        ? Number(productForm.screamerDurationSeconds || 5)
        : 5,
    screamerVolume:
      productForm.rewardEffectType === "desktop_screamer"
        ? Number(productForm.screamerVolume ?? 1)
        : 1,
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
