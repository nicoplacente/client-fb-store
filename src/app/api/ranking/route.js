import { envConfig } from "@/config";

export async function GET() {
  const res = await fetch(envConfig.API_RANKING, {
    cache: "no-store",
  });
  const data = await res.json();
  return Response.json(data);
}
