export const initialProductFilters = {
  query: "",
  category: "all",
  status: "all",
  stock: "all",
  featured: "all",
};

export function getProductCategories(products) {
  return Array.from(
    new Set(
      products
        .map((product) => product.category?.trim())
        .filter(Boolean),
    ),
  ).sort((firstCategory, secondCategory) =>
    firstCategory.localeCompare(secondCategory, "es"),
  );
}

export function filterProducts(products, filters) {
  const normalizedQuery = normalizeText(filters.query);

  return products.filter((product) => {
    if (
      normalizedQuery &&
      ![product.title, product.description, product.category].some((value) =>
        normalizeText(value).includes(normalizedQuery),
      )
    ) {
      return false;
    }

    if (
      filters.category !== "all" &&
      product.category !== filters.category
    ) {
      return false;
    }

    if (filters.status !== "all" && product.status !== filters.status) {
      return false;
    }

    if (!matchesStockFilter(product, filters.stock)) {
      return false;
    }

    if (
      filters.featured !== "all" &&
      product.featured !== (filters.featured === "featured")
    ) {
      return false;
    }

    return true;
  });
}

export function hasActiveProductFilters(filters) {
  return Object.entries(filters).some(
    ([key, value]) =>
      value !== initialProductFilters[key],
  );
}

function matchesStockFilter(product, stockFilter) {
  if (stockFilter === "all") return true;
  if (stockFilter === "infinite") return product.infiniteStock;
  if (stockFilter === "available") {
    return product.infiniteStock || product.stock > 0;
  }
  if (stockFilter === "out") {
    return !product.infiniteStock && product.stock <= 0;
  }

  return true;
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .trim();
}
