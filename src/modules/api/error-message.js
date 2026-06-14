const PUBLIC_ERROR_MESSAGES = {
  INSUFFICIENT_CREDITS: "Créditos insuficientes",
  UNIQUE_PRODUCT_ALREADY_REDEEMED: "Ya has canjeado este producto",
  WHEEL_IN_PROGRESS: "Ya hay una ruleta en curso. Espera un momento",
};

export function getErrorMessage(error, fallback) {
  return PUBLIC_ERROR_MESSAGES[error?.data?.code] || fallback;
}
