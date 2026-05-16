import { envConfig } from "@/config";
import { apiRequest, buildResourceUrl } from "@/modules/api/client";

export async function getGiveaways({ includeInactive = false } = {}) {
  const url = includeInactive
    ? `${envConfig.API_GIVEAWAYS}?includeInactive=true`
    : envConfig.API_GIVEAWAYS;
  const data = await apiRequest(url);
  return Array.isArray(data) ? data : data.giveaways || [];
}

export async function createGiveaway(giveaway) {
  return apiRequest(envConfig.API_GIVEAWAYS, {
    method: "POST",
    body: giveaway,
  });
}

export async function updateGiveaway(giveawayId, giveaway) {
  return apiRequest(buildResourceUrl(envConfig.API_GIVEAWAYS, giveawayId), {
    method: "PUT",
    body: giveaway,
  });
}

export async function deleteGiveaway(giveawayId) {
  return apiRequest(buildResourceUrl(envConfig.API_GIVEAWAYS, giveawayId), {
    method: "DELETE",
  });
}

export async function joinGiveaway(giveawayId) {
  return apiRequest(`${buildResourceUrl(envConfig.API_GIVEAWAYS, giveawayId)}/join`, {
    method: "POST",
  });
}

export function normalizeGiveaway(giveaway) {
  return {
    id: giveaway.id || giveaway._id || giveaway.slug || giveaway.title,
    title: giveaway.title || "Sorteo sin nombre",
    description: giveaway.description || "",
    prize: giveaway.prize || giveaway.reward || "Premio sorpresa",
    status: giveaway.status || "active",
    imageUrl: giveaway.imageUrl || giveaway.image || "",
    entryCost: Number(giveaway.entryCost || giveaway.price || giveaway.cost || 0),
    hasJoined: Boolean(giveaway.hasJoined || giveaway.currentUserEntry),
    currentUserEntry: giveaway.currentUserEntry || null,
    participants: Number(giveaway.participants || giveaway.participantsCount || 0),
    startsAt: giveaway.startsAt || giveaway.startDate || "",
    endsAt: giveaway.endsAt || giveaway.endDate || "",
  };
}
