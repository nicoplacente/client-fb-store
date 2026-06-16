import { envConfig } from "@/config";
import { apiRequest, buildResourceUrl } from "@/modules/api/client";

export async function getMySubscriptions() {
  const data = await apiRequest(envConfig.API_MY_SUBSCRIPTIONS);

  return {
    subscription: data.subscription || null,
    timeline: Array.isArray(data.timeline) ? data.timeline : [],
    rewards: Array.isArray(data.rewards) ? data.rewards : [],
  };
}

export async function getSubscriptions() {
  const data = await apiRequest(envConfig.API_SUBSCRIPTIONS);

  return Array.isArray(data.subscriptions) ? data.subscriptions : [];
}

export async function claimSubscriptionReward(rewardId) {
  return apiRequest(
    `${buildResourceUrl(envConfig.API_SUBSCRIPTION_REWARDS, rewardId)}/claim`,
    {
      method: "POST",
    }
  );
}
