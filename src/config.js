// Configuration for environment variables

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  process.env.SERVER_URL ||
  "http://localhost:3001";

export const envConfig = {
  SERVER_URL,
  CHAT_POPUOT: "https://kick.com/popout/francobertello74-verify/chat",
  API_MY_RANKING: `${SERVER_URL}/api/ranking/me`,
  API_RANKING: `${SERVER_URL}/api/ranking`,
  API_PRODUCTS: `${SERVER_URL}/api/products`,
  API_PRODUCT_REDEMPTIONS: `${SERVER_URL}/api/products/redemptions/me`,
  API_GIVEAWAYS: `${SERVER_URL}/api/giveaways`,
  API_CREDIT_PACKAGES: `${SERVER_URL}/api/credit-packages`,
  API_SUPPORT: `${SERVER_URL}/api/support`,
  API_SUPPORT_TICKETS: `${SERVER_URL}/api/support/tickets`,
  API_USER: `${SERVER_URL}/api/user`,
  API_USER_REDEMPTIONS: `${SERVER_URL}/api/user/redemptions`,
  API_LOGOUT: `${SERVER_URL}/api/logout`,
  API_KICK_AUTH: `${SERVER_URL}/api/auth/kick`,
  API_LINK_EXTENSION_VIEWER: `${SERVER_URL}/api/auth/link-extension-viewer`,
  API_REFRESH_USER: `${SERVER_URL}/api/refresh`,
  API_COMPLETE_VERIFY: `${SERVER_URL}/api/complete-verify`,
  API_REQUEST_TOKEN: `${SERVER_URL}/api/request-token`,
  API_REFRESH_TOKEN: `${SERVER_URL}/api/refresh-token`,
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV,
};
