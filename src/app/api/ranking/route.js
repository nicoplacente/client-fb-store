import { envConfig } from "@/config";

export async function GET() {
  const res = await fetch(`${envConfig.SERVER_URL}/ranking`);
  const data = await res.json();
  return Response.json(data);
}
