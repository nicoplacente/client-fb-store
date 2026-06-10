import { getProducts } from "@/modules/products/libs/product-api";
import { getCreditPackages } from "@/modules/credits/libs/credit-api";
import { getGiveaways } from "@/modules/giveaways/libs/giveaway-api";
import { getSupportTickets } from "@/modules/support/libs/support-api";
import {
  getLiveStatus,
  getStreamHours,
  getStreamRewards,
  normalizeStreamHourState,
  normalizeStreamRewardState,
} from "@/modules/stream/libs/stream-api";
import {
  getPredictions,
  normalizePrediction,
} from "@/modules/predictions/libs/prediction-api";

export async function loadDashboardData() {
  const [
    productData,
    creditPackageData,
    giveawayData,
    ticketData,
    streamHourData,
    streamRewardData,
    liveStatusData,
    predictionData,
  ] = await Promise.all([
    getProducts({ includeDisabled: true }),
    getCreditPackages({ includeDisabled: true }),
    getGiveaways({ includeInactive: true }),
    getSupportTickets({ includeAll: true }),
    getStreamHours().catch(() => null),
    getStreamRewards().catch(() => null),
    getLiveStatus().catch(() => null),
    getPredictions({ includeInactive: true }).catch(() => []),
  ]);

  return {
    productData,
    creditPackageData,
    giveawayData,
    ticketData,
    streamHour: streamHourData ? normalizeStreamHourState(streamHourData) : null,
    streamRewards: streamRewardData
      ? normalizeStreamRewardState(streamRewardData)
      : null,
    liveStatus: liveStatusData,
    predictions: predictionData.map(normalizePrediction),
  };
}
