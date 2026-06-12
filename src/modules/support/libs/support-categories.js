export const SUPPORT_CATEGORY_OPTIONS = [
  { value: "general", label: "General" },
  { value: "credits", label: "Créditos" },
  { value: "giveaways", label: "Sorteos" },
  { value: "account", label: "Cuenta" },
  { value: "technical", label: "Técnico" },
  { value: "suggestion", label: "Sugerencia" },
];

const SUPPORT_CATEGORY_LABELS = new Map(
  SUPPORT_CATEGORY_OPTIONS.map((category) => [category.value, category.label]),
);

export function getSupportCategoryLabel(category) {
  const normalizedCategory = String(category || "")
    .trim()
    .toLowerCase();

  return SUPPORT_CATEGORY_LABELS.get(normalizedCategory) || "General";
}
