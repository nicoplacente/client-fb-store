import { envConfig } from "@/config";

export async function handleLogout(setUsername) {
  try {
    await fetch(`${envConfig.API_LOGOUT}`, {
      method: "POST",
      credentials: "include",
    });

    setUsername(null);
  } catch (err) {
    console.error("Error al cerrar sesión:", err);
  }
}
