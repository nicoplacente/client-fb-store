import { envConfig } from "@/config";

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

async function refreshSession() {
  if (!envConfig.API_REFRESH_TOKEN) return false;

  const response = await fetch(envConfig.API_REFRESH_TOKEN, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
  });

  return response.ok;
}

export async function apiRequest(url, options = {}) {
  if (!url) {
    throw new ApiError("Endpoint no configurado", 0, null);
  }

  const { skipRefresh = false, ...requestOptions } = options;
  const headers = new Headers(options.headers);
  const hasBody = options.body !== undefined && options.body !== null;

  if (hasBody && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const request = {
    credentials: "include",
    cache: "no-store",
    ...requestOptions,
    headers,
    body:
      hasBody && !(options.body instanceof FormData)
        ? JSON.stringify(options.body)
        : options.body,
  };

  let response = await fetch(url, request);

  if (response.status === 401 && !skipRefresh && url !== envConfig.API_REFRESH_TOKEN) {
    const refreshed = await refreshSession();

    if (refreshed) {
      response = await fetch(url, request);
    }
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    const message =
      typeof data === "object" && data
        ? data.error || data.message || "Error del servidor"
        : data || "Error del servidor";

    throw new ApiError(message, response.status, data);
  }

  return data;
}

export async function apiBlobRequest(url, options = {}) {
  if (!url) {
    throw new ApiError("Endpoint no configurado", 0, null);
  }

  const { skipRefresh = false, ...requestOptions } = options;
  const request = {
    credentials: "include",
    cache: "no-store",
    ...requestOptions,
  };
  let response = await fetch(url, request);

  if (response.status === 401 && !skipRefresh) {
    const refreshed = await refreshSession();

    if (refreshed) {
      response = await fetch(url, request);
    }
  }

  if (!response.ok) {
    const data = await parseResponse(response);
    const message =
      typeof data === "object" && data
        ? data.error || data.message || "Error del servidor"
        : data || "Error del servidor";

    throw new ApiError(message, response.status, data);
  }

  return response.blob();
}

export function buildResourceUrl(baseUrl, id) {
  return `${baseUrl}/${encodeURIComponent(id)}`;
}
