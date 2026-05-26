import { envConfig } from "@/config";
import { apiRequest } from "@/modules/api/client";

export async function uploadImage(file) {
  const formData = new FormData();

  formData.append("image", file);

  const data = await apiRequest(envConfig.API_UPLOAD_IMAGE, {
    method: "POST",
    body: formData,
  });

  return data.url || "";
}
