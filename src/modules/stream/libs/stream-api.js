import { envConfig } from "@/config";
import { apiRequest } from "@/modules/api/client";

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

export function normalizeStreamHourState(state = {}) {
  const hours = Array.isArray(state.hours) ? state.hours : [];

  return {
    mode: state.mode || "auto",
    hasManualOverride: Boolean(state.hasManualOverride),
    active: state.active || "",
    activeLabel: state.activeLabel || "Sin hora especial",
    manual: state.manual || "",
    expiresAt: state.expiresAt || null,
    automatic: state.automatic || "",
    automaticLabel: state.automaticLabel || "Sin hora especial",
    hours: hours.map((hour) => ({
      id: hour.id,
      label: hour.label || hour.id,
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
      lastAutoChestAt: scheduler.lastAutoChestAt || null,
      nextCheckAt: scheduler.nextCheckAt || null,
    },
  };
}
