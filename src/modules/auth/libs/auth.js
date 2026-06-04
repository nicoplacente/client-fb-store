import { cookies } from "next/headers";
import { envConfig } from "@/config";

export async function getUserFromSession() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) return null;

  try {
    const res = await fetch(`${envConfig.API_USER}`, {
      headers: {
        cookie: `accessToken=${accessToken}`,
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  } catch (error) {
    console.warn("No se pudo obtener el usuario de la sesion:", error);
    return null;
  }
}
