import { envConfig } from "@/config";
import { apiRequest } from "@/modules/api/client";

export async function getMyRanking() {
  const data = await apiRequest(envConfig.API_MY_RANKING);

  return data.ranking || {};
}

