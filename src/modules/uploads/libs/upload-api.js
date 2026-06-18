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

async function uploadMedia(url, fieldName, file) {
  const formData = new FormData();

  formData.append(fieldName, file);

  const data = await apiRequest(url, {
    method: "POST",
    body: formData,
  });

  return data.url || "";
}

export function uploadScreamerImage(file) {
  return uploadMedia(envConfig.API_UPLOAD_SCREAMER_IMAGE, "image", file);
}

export function uploadScreamerAudio(file) {
  return uploadMedia(envConfig.API_UPLOAD_SCREAMER_AUDIO, "audio", file);
}
