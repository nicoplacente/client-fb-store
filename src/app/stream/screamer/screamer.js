const MAX_EVENT_ID_LENGTH = 128;
const MIN_DURATION_MS = 2000;
const MAX_DURATION_MS = 30000;

function normalizeMediaUrl(value) {
  if (typeof value !== "string") return "";

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : "";
  } catch {
    return "";
  }
}

export function normalizeScreamer(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  const id = typeof payload.id === "string" ? payload.id.trim() : "";
  const gifUrl = normalizeMediaUrl(payload.gifUrl);
  const audioUrl = normalizeMediaUrl(payload.audioUrl);
  const durationMs = Number(payload.durationMs ?? 5000);
  const volume = Number(payload.volume ?? 1);

  if (
    !id ||
    id.length > MAX_EVENT_ID_LENGTH ||
    !gifUrl ||
    !audioUrl ||
    !Number.isFinite(durationMs) ||
    !Number.isFinite(volume)
  ) {
    return null;
  }

  return {
    id,
    gifUrl,
    audioUrl,
    durationMs: Math.min(MAX_DURATION_MS, Math.max(MIN_DURATION_MS, durationMs)),
    volume: Math.min(1, Math.max(0, volume)),
  };
}
