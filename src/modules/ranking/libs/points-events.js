export const KICK_POINTS_UPDATED_EVENT = "kickPointsUpdated";

export function emitKickPointsUpdated(points) {
  if (typeof window === "undefined") return;

  const nextPoints = Number(points);

  if (!Number.isFinite(nextPoints)) return;

  window.dispatchEvent(
    new CustomEvent(KICK_POINTS_UPDATED_EVENT, {
      detail: {
        points: nextPoints,
      },
    })
  );
}
