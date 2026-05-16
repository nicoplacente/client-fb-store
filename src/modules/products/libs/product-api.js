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

export async function redeemProduct(productId) {
  return apiRequest(`${buildResourceUrl(envConfig.API_PRODUCTS, productId)}/redeem`, {
    method: "POST",
  });
}

export function normalizeProduct(product) {
  return {
    id: product.id || product._id || product.slug || product.title,
    title: product.title || product.name || "Producto sin nombre",
    description: product.description || "",
    price: Number(product.price || product.cost || 0),
    stock: Number(product.stock || product.quantity || 0),
    category: product.category || "General",
    imageUrl: product.imageUrl || product.image || product.img || "",
    status: product.status || (product.enabled === false ? "draft" : "active"),
    featured: Boolean(product.featured),
  };
}
