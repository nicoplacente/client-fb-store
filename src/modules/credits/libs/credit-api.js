import { envConfig } from "@/config";
import { apiRequest, buildResourceUrl } from "@/modules/api/client";

export async function getCreditPackages({ includeDisabled = false } = {}) {
  const url = includeDisabled
    ? `${envConfig.API_CREDIT_PACKAGES}?includeDisabled=true`
    : envConfig.API_CREDIT_PACKAGES;
  const data = await apiRequest(url);
  return Array.isArray(data) ? data : data.packages || [];
}

export async function createCreditPackage(creditPackage) {
  return apiRequest(envConfig.API_CREDIT_PACKAGES, {
    method: "POST",
    body: creditPackage,
  });
}

export async function updateCreditPackage(packageId, creditPackage) {
  return apiRequest(buildResourceUrl(envConfig.API_CREDIT_PACKAGES, packageId), {
    method: "PUT",
    body: creditPackage,
  });
}

export async function deleteCreditPackage(packageId) {
  return apiRequest(buildResourceUrl(envConfig.API_CREDIT_PACKAGES, packageId), {
    method: "DELETE",
  });
}

export async function purchaseCreditPackage(packageId, { quantity = 1 } = {}) {
  return apiRequest(
    `${buildResourceUrl(envConfig.API_CREDIT_PACKAGES, packageId)}/purchase`,
    {
      method: "POST",
      body: {
        quantity: Math.max(1, Math.floor(Number(quantity || 1))),
      },
    }
  );
}

export function normalizeCreditPackage(creditPackage) {
  return {
    id: creditPackage.id || creditPackage._id || creditPackage.name,
    name: creditPackage.name || creditPackage.title || "Pack de creditos",
    description: creditPackage.description || "",
    credits: Number(creditPackage.credits || 0),
    pointsCost: Number(creditPackage.pointsCost || creditPackage.cost || 0),
    source: creditPackage.source || "points",
    status:
      creditPackage.status || (creditPackage.enabled === false ? "draft" : "active"),
    enabled: creditPackage.enabled !== false,
    sortOrder: Number(creditPackage.sortOrder || 0),
  };
}
