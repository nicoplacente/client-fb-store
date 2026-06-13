export const emptyProfile = {
  country: "",
  email: "",
  name: "",
  dni: "",
  city: "",
  province: "",
  direction: "",
  postalCode: "",
  phone: "",
  instagram: "",
  twitter: "",
  discord: "",
};

export const INITIAL_VISIBLE_SUB_MILESTONES = 1;
export const SUB_REWARD_CYCLE_MONTHS = 18;
export const SUB_REWARD_CYCLE_LABELS = [1, 3, 6, 9, 12, 15, 18];
export const emptyLevelStats = {
  xp: 0,
  level: 1,
  levelTier: "Bronce",
  levelProgress: 0,
  levelCurrentXp: 0,
  levelNeededXp: 900,
  levelRemainingXp: 900,
  watchtime: 0,
  messages: 0,
  points: 0,
  streak: 0,
};

export function toProfile(user) {
  return {
    country: user?.country || "",
    email: user?.email || "",
    name: user?.name || "",
    dni: user?.dni || "",
    city: user?.city || "",
    province: user?.province || "",
    direction: user?.direction || "",
    postalCode: user?.postalCode || "",
    phone: user?.phone || "",
    instagram: user?.instagram || "",
    twitter: user?.twitter || "",
    discord: user?.discord || "",
  };
}

export function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatShortDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function normalizeLevelStats(stats) {
  return {
    ...emptyLevelStats,
    xp: Number(stats?.xp || 0),
    level: Number(stats?.level || 1),
    levelTier: stats?.levelTier || "Bronce",
    levelProgress: Number(stats?.levelProgress || 0),
    levelCurrentXp: Number(stats?.levelCurrentXp || 0),
    levelNeededXp: Number(stats?.levelNeededXp || 900),
    levelRemainingXp: Number(stats?.levelRemainingXp || 900),
    watchtime: Number(stats?.watchtime || 0),
    messages: Number(stats?.messages || 0),
    points: Number(stats?.points || stats?.kickPoints || 0),
    streak: Number(stats?.streak || stats?.streamStreak || 0),
  };
}

export function formatCompactNumber(value) {
  return new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function getLocalRedemptions() {
  if (typeof window === "undefined") return [];

  try {
    const data = JSON.parse(
      window.localStorage.getItem("fbStoreLocalRedemptions") || "[]"
    );
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function mergeRedemptions(primary, fallback) {
  const merged = [];
  const indexByKey = new Map();

  [...primary, ...fallback].forEach((redemption) => {
    const productName = String(
      redemption.product?.name || redemption.product?.title || ""
    )
      .trim()
      .toLowerCase();
    const key = `${redemption.id || ""}-${productName}-${redemption.createdAt || ""}`;
    const existingIndex = indexByKey.get(key);

    if (existingIndex === undefined) {
      indexByKey.set(key, merged.length);
      merged.push(redemption);
      return;
    }

    const existing = merged[existingIndex];

    merged[existingIndex] = {
      ...redemption,
      ...existing,
      product: {
        ...redemption.product,
        ...existing.product,
      },
      productEffectTargetKickId:
        existing.productEffectTargetKickId ||
        redemption.productEffectTargetKickId ||
        "",
      productEffectTargetUsername:
        existing.productEffectTargetUsername ||
        redemption.productEffectTargetUsername ||
        "",
    };
  });

  return merged;
}

export function ticketToRedemption(ticket) {
  const productName = String(ticket.subject || "")
    .replace(/^Canje:\s*/i, "")
    .trim();
  const message = String(ticket.message || "");
  const costMatch = message.match(/(\d[\d.]*)\s*cr[eé]ditos/i);
  const wheelPrizeMatch = message.match(/\bgan[oó]\s+(.+?)\.\s*(?:Canje|$)/i);
  const cost = costMatch ? Number(costMatch[1].replace(/\./g, "")) : 0;

  return {
    id: `ticket-${ticket.id}`,
    status: ticket.status || "open",
    cost,
    wheelPrizeName: wheelPrizeMatch?.[1]?.trim() || "",
    createdAt: ticket.createdAt || "",
    product: {
      id: `ticket-product-${ticket.id}`,
      title: productName || ticket.subject || "Canje",
      description: ticket.message || "",
      price: cost,
      stock: 0,
      status: "active",
      category: "Market",
      imageUrl: "",
    },
  };
}

export function getSubscriptionStatusCopy(status) {
  if (status === "available") {
    return {
      label: "Disponible",
      className: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
    };
  }

  if (status === "claimed") {
    return {
      label: "Reclamado",
      className: "border-sky-400/30 bg-sky-500/10 text-sky-200",
    };
  }

  if (status === "missed") {
    return {
      label: "Sin registro",
      className: "border-amber-400/30 bg-amber-500/10 text-amber-200",
    };
  }

  return {
    label: "Bloqueado",
    className: "border-white/10 bg-neutral-950 text-neutral-500",
  };
}

export function buildMilestoneRail(timeline, currentMonths) {
  const rewardByMonth = new Map(
    timeline.map((item) => [Number(item.milestoneMonth), item])
  );
  const cycleStart =
    currentMonths > SUB_REWARD_CYCLE_MONTHS
      ? Math.floor((currentMonths - 1) / SUB_REWARD_CYCLE_MONTHS) *
        SUB_REWARD_CYCLE_MONTHS
      : 0;

  return SUB_REWARD_CYCLE_LABELS.map((label) => {
    const absoluteMonth = cycleStart === 0 ? label : cycleStart + label;
    const item = rewardByMonth.get(absoluteMonth);

    return {
      milestoneMonth: absoluteMonth,
      displayMonth: label,
      status: item?.status || "locked",
    };
  });
}

export function getVisibleSubscriptionTimeline(timeline, showAllMilestones) {
  if (showAllMilestones || timeline.length <= INITIAL_VISIBLE_SUB_MILESTONES) {
    return timeline;
  }

  const activeItems = timeline.filter((item) => item.status !== "claimed");

  return [activeItems[0] || timeline[timeline.length - 1]].filter(Boolean);
}
