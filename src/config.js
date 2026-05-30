// Configuration for environment variables

function normalizeUrl(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function ensureApiUrl(value) {
  const normalized = normalizeUrl(value);

  if (!normalized) return "http://localhost:3001/api";
  if (normalized.endsWith("/api")) return normalized;

  return `${normalized}/api`;
}

const rawServerUrl = process.env.NEXT_PUBLIC_SERVER_URL
const SERVER_URL = ensureApiUrl(rawServerUrl);
const SOCKET_URL = normalizeUrl(SERVER_URL).replace(/\/api$/, "");

export const envConfig = {
  SERVER_URL,
  SOCKET_URL,
  CHAT_POPUP_URL: "https://kick.com/popout/francobertello74-verify/chat",
  API_MY_RANKING: `${SERVER_URL}/ranking/me`,
  API_RANKING: `${SERVER_URL}/ranking`,
  API_PRODUCTS: `${SERVER_URL}/products`,
  API_PRODUCT_REDEMPTIONS: `${SERVER_URL}/products/redemptions/me`,
  API_GIVEAWAYS: `${SERVER_URL}/giveaways`,
  API_CREDIT_PACKAGES: `${SERVER_URL}/credit-packages`,
  API_SUPPORT: `${SERVER_URL}/support`,
  API_SUPPORT_TICKETS: `${SERVER_URL}/support/tickets`,
  API_USER: `${SERVER_URL}/user`,
  API_USER_REDEMPTIONS: `${SERVER_URL}/user/redemptions`,
  API_MY_SUBSCRIPTIONS: `${SERVER_URL}/subscriptions/me`,
  API_SUBSCRIPTION_REWARDS: `${SERVER_URL}/subscriptions/rewards`,
  API_STREAM_HOURS: `${SERVER_URL}/stream/hours`,
  API_STREAM_REWARDS: `${SERVER_URL}/stream/rewards`,
  API_UPLOAD_IMAGE: `${SERVER_URL}/uploads/image`,
  API_LOGOUT: `${SERVER_URL}/logout`,
  API_KICK_AUTH: `${SERVER_URL}/auth/kick`,
  API_LINK_EXTENSION_VIEWER: `${SERVER_URL}/auth/link-extension-viewer`,
  API_REFRESH_USER: `${SERVER_URL}/refresh`,
  API_COMPLETE_VERIFY: `${SERVER_URL}/complete-verify`,
  API_REQUEST_TOKEN: `${SERVER_URL}/request-token`,
  API_REFRESH_TOKEN: `${SERVER_URL}/refresh-token`,
  NODE_ENV: process.env.NODE_ENV,
};
