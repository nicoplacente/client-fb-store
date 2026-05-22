import { formatDateInput } from "./formatters";

export function productToForm(product) {
  return {
    title: product.title,
    description: product.description,
    price: String(product.price),
    stock: String(product.stock),
    category: product.category,
    imageUrl: product.imageUrl,
    status: product.status,
    featured: product.featured,
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
    prize: giveaway.prize,
    entryCost: String(giveaway.entryCost || 0),
    imageUrl: giveaway.imageUrl,
    status: giveaway.status,
    startsAt: formatDateInput(giveaway.startsAt),
    endsAt: formatDateInput(giveaway.endsAt),
  };
}
