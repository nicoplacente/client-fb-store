export function formatNumber(value) {
  return Number(value || 0).toLocaleString("es-AR");
}

export function clampRedemptionQuantity(value, stock) {
  const maxStock = Math.max(1, Math.floor(Number(stock || 1)));
  const quantity = Math.floor(Number(value || 1));

  if (!Number.isFinite(quantity)) return 1;

  return Math.min(Math.max(quantity, 1), maxStock);
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

export function isVipProduct(product) {
  const category = normalizeText(product?.category);
  const title = normalizeText(product?.title || product?.name);

  return category === "vip" || /\bvip\b/.test(title);
}

export function hasSingleRedemptionEffect(product) {
  return (
    isVipProduct(product) ||
    product?.rewardEffectType === "stream_special_hour" ||
    product?.rewardEffectType === "restore_stream_streak" ||
    product?.rewardEffectType === "kick_timeout_user" ||
    product?.rewardEffectType === "kick_unban_self" ||
    product?.rewardEffectType === "audio_submission" ||
    product?.rewardEffectType === "reward_wheel"
  );
}

export function getRedemptionQuantity(value, product) {
  if (hasSingleRedemptionEffect(product)) return 1;

  if (product?.infiniteStock) {
    const quantity = Math.floor(Number(value || 1));

    return Number.isFinite(quantity) ? Math.max(quantity, 1) : 1;
  }

  return clampRedemptionQuantity(value, product?.stock);
}

export function getCreditPurchaseLimit(creditPackage, availablePoints) {
  const pointsCost = Number(creditPackage?.pointsCost || 0);
  const points = Number(availablePoints || 0);

  if (!Number.isFinite(pointsCost) || pointsCost <= 0) return 0;
  if (!Number.isFinite(points) || points <= 0) return 0;

  return Math.max(0, Math.floor(points / pointsCost));
}

export function getCreditPurchaseQuantity(value, creditPackage, availablePoints) {
  const limit = getCreditPurchaseLimit(creditPackage, availablePoints);
  const quantity = Math.floor(Number(value || 1));
  const safeQuantity = Number.isFinite(quantity) ? Math.max(1, quantity) : 1;

  if (limit <= 0) return 0;

  return Math.min(safeQuantity, limit);
}

export function getMaxCreditPurchasePlan(creditPackages, availablePoints) {
  const points = Math.max(0, Math.floor(Number(availablePoints || 0)));
  const packages = creditPackages
    .filter((creditPackage) => {
      const pointsCost = Number(creditPackage?.pointsCost || 0);
      const credits = Number(creditPackage?.credits || 0);

      return (
        creditPackage?.status === "active" &&
        Number.isSafeInteger(pointsCost) &&
        Number.isSafeInteger(credits) &&
        pointsCost > 0 &&
        credits > 0 &&
        pointsCost <= points
      );
    })
    .map((creditPackage) => ({
      ...creditPackage,
      pointsCost: Math.floor(Number(creditPackage.pointsCost || 0)),
      credits: Math.floor(Number(creditPackage.credits || 0)),
    }))
    .toSorted((first, second) => {
      if (second.pointsCost !== first.pointsCost) {
        return second.pointsCost - first.pointsCost;
      }

      return second.credits - first.credits;
    });

  if (packages.length === 0) return null;

  const plan = buildExactCreditPurchasePlan(packages, points) ||
    buildGreedyCreditPurchasePlan(packages, points);

  if (!plan || plan.totalPacks <= 0) return null;

  return plan;
}

function buildExactCreditPurchasePlan(creditPackages, availablePoints) {
  const divisor = creditPackages
    .map((creditPackage) => creditPackage.pointsCost)
    .reduce(greatestCommonDivisor);
  const limit = Math.floor(availablePoints / divisor);

  if (limit > 250000) return null;

  const packages = creditPackages.map((creditPackage) => ({
    ...creditPackage,
    scaledCost: Math.floor(creditPackage.pointsCost / divisor),
  }));
  const states = Array(limit + 1).fill(null);
  states[0] = {
    totalCredits: 0,
    packCount: 0,
    previousAmount: null,
    packageIndex: null,
  };

  for (let amount = 0; amount <= limit; amount += 1) {
    const state = states[amount];

    if (!state) continue;

    packages.forEach((creditPackage, packageIndex) => {
      const nextAmount = amount + creditPackage.scaledCost;

      if (nextAmount > limit) return;

      const nextState = {
        totalCredits: state.totalCredits + creditPackage.credits,
        packCount: state.packCount + 1,
        previousAmount: amount,
        packageIndex,
      };

      if (isBetterState(nextState, states[nextAmount])) {
        states[nextAmount] = nextState;
      }
    });
  }

  const bestAmount = states.reduce((bestIndex, state, amount) => {
    if (!state || amount === 0) return bestIndex;
    if (bestIndex === 0) return amount;

    const bestState = states[bestIndex];
    const pointsSpent = amount * divisor;
    const bestPointsSpent = bestIndex * divisor;

    if (pointsSpent !== bestPointsSpent) {
      return pointsSpent > bestPointsSpent ? amount : bestIndex;
    }

    if (state.totalCredits !== bestState.totalCredits) {
      return state.totalCredits > bestState.totalCredits ? amount : bestIndex;
    }

    return state.packCount < bestState.packCount ? amount : bestIndex;
  }, 0);

  if (bestAmount === 0) return null;

  const counts = Array(packages.length).fill(0);
  let currentAmount = bestAmount;

  while (currentAmount > 0) {
    const state = states[currentAmount];

    if (!state || state.packageIndex === null) break;

    counts[state.packageIndex] += 1;
    currentAmount = state.previousAmount;
  }

  return buildCreditPurchasePlan(packages, counts, availablePoints);
}

function buildGreedyCreditPurchasePlan(creditPackages, availablePoints) {
  let remainingPoints = availablePoints;
  const counts = Array(creditPackages.length).fill(0);

  creditPackages.forEach((creditPackage, index) => {
    const quantity = Math.floor(remainingPoints / creditPackage.pointsCost);

    if (quantity <= 0) return;

    counts[index] = quantity;
    remainingPoints -= quantity * creditPackage.pointsCost;
  });

  return buildCreditPurchasePlan(creditPackages, counts, availablePoints);
}

function buildCreditPurchasePlan(creditPackages, counts, availablePoints) {
  const items = creditPackages
    .map((creditPackage, index) => {
      const quantity = counts[index];

      if (quantity <= 0) return null;

      return {
        creditPackage,
        quantity,
        pointsCost: creditPackage.pointsCost * quantity,
        credits: creditPackage.credits * quantity,
      };
    })
    .filter(Boolean);

  const totalPointsCost = items.reduce(
    (total, item) => total + item.pointsCost,
    0
  );
  const totalCredits = items.reduce((total, item) => total + item.credits, 0);
  const totalPacks = items.reduce((total, item) => total + item.quantity, 0);

  return {
    items,
    totalCredits,
    totalPacks,
    totalPointsCost,
    remainingPoints: Math.max(0, availablePoints - totalPointsCost),
  };
}

function isBetterState(candidate, current) {
  if (!current) return true;

  if (candidate.totalCredits !== current.totalCredits) {
    return candidate.totalCredits > current.totalCredits;
  }

  return candidate.packCount < current.packCount;
}

function greatestCommonDivisor(firstValue, secondValue) {
  let first = Math.abs(Math.floor(Number(firstValue || 0)));
  let second = Math.abs(Math.floor(Number(secondValue || 0)));

  while (second > 0) {
    const next = first % second;
    first = second;
    second = next;
  }

  return first || 1;
}

export function saveLocalRedemption(redemption) {
  if (typeof window === "undefined" || !redemption?.id) return;

  try {
    const current = JSON.parse(
      window.localStorage.getItem("fbStoreLocalRedemptions") || "[]"
    );
    const next = [
      redemption,
      ...current.filter((item) => String(item.id) !== String(redemption.id)),
    ].slice(0, 30);

    window.localStorage.setItem("fbStoreLocalRedemptions", JSON.stringify(next));
  } catch {
    try {
      window.localStorage.setItem(
        "fbStoreLocalRedemptions",
        JSON.stringify([redemption])
      );
    } catch {
      // Ignore storage write errors.
    }
  }
}

export function getActionConfirmation(action, { availablePoints = 0 } = {}) {
  if (!action) return null;

  if (action.type === "bulkPurchase") {
    const plan = action.plan;
    const hasPurchases = plan?.totalPacks > 0;

    return {
      title: "Confirmar compra maxima",
      description: hasPurchases
        ? `Se descontaran ${formatNumber(plan.totalPointsCost)} puntos de Kick y se acreditaran ${formatNumber(plan.totalCredits)} creditos en tu cuenta.`
        : `No tenes puntos suficientes para comprar packs de creditos.`,
      confirmLabel: "Comprar maximo",
      confirmDisabled: !hasPurchases,
    };
  }

  if (action.type === "purchase") {
    const quantity = getCreditPurchaseQuantity(
      action.quantity,
      action.item,
      availablePoints
    );
    const totalPointsCost = Number(action.item.pointsCost || 0) * quantity;
    const totalCredits = Number(action.item.credits || 0) * quantity;
    const hasEnoughPoints = quantity > 0;

    return {
      title: "Confirmar compra",
      description: hasEnoughPoints
        ? `Se descontaran ${formatNumber(totalPointsCost)} puntos de Kick y se acreditaran ${formatNumber(totalCredits)} creditos en tu cuenta.`
        : `No tenes puntos suficientes para comprar este pack.`,
      confirmLabel: "Comprar",
      confirmDisabled: !hasEnoughPoints,
    };
  }

  const quantity = getRedemptionQuantity(action.quantity, action.item);
  const totalCost = Number(action.item.price || 0) * quantity;
  const singleRedemption = hasSingleRedemptionEffect(action.item);

  return {
    title: "Confirmar canje",
    description: singleRedemption
      ? `Vas a usar ${formatNumber(totalCost)} creditos para activar este canje.`
      : `Vas a usar ${formatNumber(totalCost)} creditos para solicitar ${quantity} ${quantity === 1 ? "unidad" : "unidades"} de este producto.`,
    confirmLabel: "Canjear",
  };
}
