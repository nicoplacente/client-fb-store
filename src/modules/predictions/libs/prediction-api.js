import { envConfig } from "@/config";
import { apiRequest, buildResourceUrl } from "@/modules/api/client";

export async function getPredictions({ includeInactive = false } = {}) {
  const url = includeInactive
    ? `${envConfig.API_PREDICTIONS}?includeInactive=true`
    : envConfig.API_PREDICTIONS;
  const data = await apiRequest(url);
  return Array.isArray(data) ? data : data.predictions || [];
}

export async function createPrediction(prediction) {
  const data = await apiRequest(envConfig.API_PREDICTIONS, {
    method: "POST",
    body: prediction,
  });

  return data.prediction || data;
}

export async function votePrediction(predictionId, payload) {
  return apiRequest(
    `${buildResourceUrl(envConfig.API_PREDICTIONS, predictionId)}/vote`,
    {
      method: "POST",
      body: payload,
    },
  );
}

export async function deletePredictionHistoryItem(predictionId) {
  const data = await apiRequest(
    `${buildResourceUrl(envConfig.API_PREDICTIONS, predictionId)}/history`,
    {
      method: "DELETE",
    },
  );

  return data.prediction || data;
}

export async function clearPredictionHistory() {
  const data = await apiRequest(`${envConfig.API_PREDICTIONS}/history`, {
    method: "DELETE",
  });

  return Array.isArray(data) ? data : data.predictions || [];
}

export async function deleteAllPredictionHistory() {
  return apiRequest(`${envConfig.API_PREDICTIONS}/history/all`, {
    method: "DELETE",
  });
}

export async function closePrediction(predictionId) {
  const data = await apiRequest(
    `${buildResourceUrl(envConfig.API_PREDICTIONS, predictionId)}/close`,
    {
      method: "POST",
    },
  );

  return data.prediction || data;
}

export async function resolvePrediction(predictionId, optionId) {
  const data = await apiRequest(
    `${buildResourceUrl(envConfig.API_PREDICTIONS, predictionId)}/resolve`,
    {
      method: "POST",
      body: {
        optionId,
      },
    },
  );

  return data.prediction || data;
}

export function normalizePrediction(prediction) {
  const options = Array.isArray(prediction.options) ? prediction.options : [];
  const totalPool = Number(
    prediction.totalPool ||
      options.reduce((sum, option) => sum + Number(option.totalPoints || 0), 0),
  );

  return {
    id: prediction.id || prediction._id || prediction.title,
    title: prediction.title || "Prediccion sin titulo",
    description: prediction.description || "",
    status: prediction.status || "active",
    payoutMultiplier: Number(prediction.payoutMultiplier || 2),
    minBetPoints: Number(prediction.minBetPoints || 1),
    maxBetPoints: prediction.maxBetPoints ? Number(prediction.maxBetPoints) : null,
    totalPool,
    players: Number(prediction.players || 0),
    startsAt: prediction.startsAt || "",
    endsAt: prediction.endsAt || "",
    resolvedAt: prediction.resolvedAt || "",
    winningOptionId: prediction.winningOptionId || null,
    winningOption: prediction.winningOption || null,
    hasVoted: Boolean(prediction.hasVoted || prediction.currentUserBet),
    currentUserBet: prediction.currentUserBet || null,
    options: options.map((option, index) => ({
      id: option.id,
      label: option.label || `Opcion ${index + 1}`,
      sortOrder: Number(option.sortOrder || index),
      totalPoints: Number(option.totalPoints || 0),
      players: Number(option.players || 0),
      percent: Number(option.percent || 0),
      isUserChoice: Boolean(option.isUserChoice),
    })),
  };
}
