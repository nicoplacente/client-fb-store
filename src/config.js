// Configuration for environment variables

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL 

export const envConfig = {
  SERVER_URL,
  CHAT_POPUOT: "https://kick.com/popout/francobertello74-verify/chat",
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
  API_STREAM_HOURS: `${SERVER_URL}/stream/hours`,
  API_STREAM_REWARDS: `${SERVER_URL}/stream/rewards`,
  API_LOGOUT: `${SERVER_URL}/logout`,
  API_KICK_AUTH: `${SERVER_URL}/auth/kick`,
  API_LINK_EXTENSION_VIEWER: `${SERVER_URL}/auth/link-extension-viewer`,
  API_REFRESH_USER: `${SERVER_URL}/refresh`,
  API_COMPLETE_VERIFY: `${SERVER_URL}/complete-verify`,
  API_REQUEST_TOKEN: `${SERVER_URL}/request-token`,
  API_REFRESH_TOKEN: `${SERVER_URL}/refresh-token`,
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV,
};
