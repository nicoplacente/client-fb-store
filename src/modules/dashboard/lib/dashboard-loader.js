import { getProducts } from "@/modules/products/libs/product-api";
import { getCreditPackages } from "@/modules/credits/libs/credit-api";
import { getGiveaways } from "@/modules/giveaways/libs/giveaway-api";
import { getSupportTickets } from "@/modules/support/libs/support-api";
import {
  getStreamHours,
  getStreamRewards,
  normalizeStreamHourState,
  normalizeStreamRewardState,
} from "@/modules/stream/libs/stream-api";

export async function loadDashboardData() {
  const [
    productData,
    creditPackageData,
    giveawayData,
    ticketData,
    streamHourData,
    streamRewardData,
  ] = await Promise.all([
    getProducts({ includeDisabled: true }),
    getCreditPackages({ includeDisabled: true }),
    getGiveaways({ includeInactive: true }),
    getSupportTickets({ includeAll: true }),
    getStreamHours().catch(() => null),
    getStreamRewards().catch(() => null),
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
  };
}
