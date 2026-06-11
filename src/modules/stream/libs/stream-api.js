import { envConfig } from "@/config";
import { apiRequest } from "@/modules/api/client";

const SPECIAL_HOUR_LABELS = {
  opening: "Opening Hour",
  bertello_snack: "Bertello-Snack Hour",
};

function normalizeSpecialHourLabel(hourId, label) {
  if (SPECIAL_HOUR_LABELS[hourId]) return SPECIAL_HOUR_LABELS[hourId];
  if (hourId === "golden" || label === "Golden Hour") return SPECIAL_HOUR_LABELS.opening;
  if (hourId === "netherite" || label === "Netherite Hour") return SPECIAL_HOUR_LABELS.bertello_snack;
  return label || hourId || "Sin hora especial";
}

export async function getStreamHours() {
  const data = await apiRequest(envConfig.API_STREAM_HOURS);
  return data.specialHour;
}

export async function updateStreamHour(payload) {
  const data = await apiRequest(envConfig.API_STREAM_HOURS, {
    method: "PATCH",
    body: payload,
  });

  return data.specialHour;
}

export async function getStreamRewards() {
  const data = await apiRequest(envConfig.API_STREAM_REWARDS);
  return data.rewards;
}

export async function getLiveStatus() {
  const data = await apiRequest(envConfig.API_LIVE_STATUS);

  return {
    isLive: Boolean(data.isLive),
    status: data.status || "unknown",
    manualOverride: data.manualOverride,
    currentStreamId: data.currentStreamId || null,
    details: data.details || null,
  };
}

export async function createStreamChest() {
  const data = await apiRequest(`${envConfig.API_STREAM_REWARDS}/chest`, {
    method: "POST",
  });

  return data.rewards;
}

export async function createStreamChatReward() {
  const data = await apiRequest(`${envConfig.API_STREAM_REWARDS}/chat`, {
    method: "POST",
  });

  return data.rewards;
}

export async function resetRankingPoints() {
  const data = await apiRequest(envConfig.API_RANKING_RESET_POINTS, {
    method: "POST",
  });

  return data;
}

export async function getRewardWheelConfigs() {
  const data = await apiRequest(envConfig.API_REWARD_WHEELS);
  return Array.isArray(data.rewardWheels)
    ? data.rewardWheels.map(normalizeRewardWheelConfig)
    : [];
}

export async function updateRewardWheelConfig(rewardWheelId, prizes) {
  const data = await apiRequest(
    `${envConfig.API_REWARD_WHEELS}/${encodeURIComponent(rewardWheelId)}`,
    {
      method: "PUT",
      body: {
        prizes,
      },
    },
  );

  return normalizeRewardWheelConfig(data.rewardWheel);
}

export async function getRewardWheelModerationStatus() {
  const data = await apiRequest(envConfig.API_REWARD_WHEEL_MODERATION);
  return normalizeRewardWheelModeration(data.moderation);
}

export async function disconnectRewardWheelModeration() {
  await apiRequest(envConfig.API_REWARD_WHEEL_MODERATION, {
    method: "DELETE",
  });

  return normalizeRewardWheelModeration();
}

export function getRewardWheelModerationConnectUrl() {
  return `${envConfig.API_REWARD_WHEEL_MODERATION}/connect`;
}

export function normalizeRewardWheelModeration(state = {}) {
  return {
    connected: Boolean(state.connected),
    configured: state.configured !== false,
    username: state.username || "",
    kickUserId: state.kickUserId || "",
    scopes: Array.isArray(state.scopes) ? state.scopes : [],
    expiresAt: state.expiresAt || null,
    updatedAt: state.updatedAt || null,
  };
}

export function normalizeRewardWheelConfig(state = {}) {
  return {
    id: state.id || null,
    productId: state.productId || state.product?.id || null,
    product: state.product
      ? {
          id: state.product.id,
          name: state.product.name || "Ruleta sin nombre",
          status: state.product.status || "active",
          enabled: state.product.enabled !== false,
        }
      : null,
    prizes: Array.isArray(state.prizes)
      ? state.prizes.map((prize, index) => ({
          id: prize.id || `reward-wheel-prize-${index}`,
          name: prize.name || "",
          probability: String(Number(prize.probability || 0)),
          effectType: prize.effectType || "none",
          effectValue: prize.effectValue ? String(prize.effectValue) : "",
        }))
      : [],
    updatedAt: state.updatedAt || null,
  };
}

export function normalizeStreamHourState(state = {}) {
  const hours = Array.isArray(state.hours) ? state.hours : [];

  return {
    mode: state.mode || "auto",
    hasManualOverride: Boolean(state.hasManualOverride),
    active: state.active || "",
    activeLabel: normalizeSpecialHourLabel(state.active, state.activeLabel),
    manual: state.manual || "",
    expiresAt: state.expiresAt || null,
    automatic: state.automatic || "",
    automaticLabel: normalizeSpecialHourLabel(state.automatic, state.automaticLabel),
    hours: hours.map((hour) => ({
      id: hour.id,
      label: normalizeSpecialHourLabel(hour.id, hour.label),
      watchtimeMultiplier: Number(hour.watchtimeMultiplier || 1),
      chatMultiplier: Number(hour.chatMultiplier || 1),
    })),
  };
}

export function normalizeStreamRewardState(state = {}) {
  const scheduler = state.chestScheduler || {};

  return {
    chest: state.chest || null,
    chatReward: state.chatReward || null,
    chestScheduler: {
      enabled: scheduler.enabled !== false,
      intervalMinutes: Number(scheduler.intervalMinutes || 45),
      durationSeconds: Number(scheduler.durationSeconds || 60),
      streamId: scheduler.streamId || null,
      streamOnlineSince: scheduler.streamOnlineSince || null,
      lastAutoChestAt: scheduler.lastAutoChestAt || null,
      nextCheckAt: scheduler.nextCheckAt || null,
    },
  };
}
