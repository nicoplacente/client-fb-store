const DASHBOARD_ROLES = new Set(["admin", "mod", "moderator", "streamer"]);

export function hasDashboardAccess(user) {
  if (!user) return false;

  const role = String(user.role || "").toLowerCase();
  const username = String(user.username || "").toLowerCase();
  const mainStreamer = String(
    process.env.NEXT_PUBLIC_MAIN_STREAMER_USERNAME || "francobertello74"
  ).toLowerCase();

  return DASHBOARD_ROLES.has(role) || username === mainStreamer;
}

export function hasKickModerationAccess(user) {
  if (!user) return false;

  const role = String(user.role || "").toLowerCase();
  const username = String(user.username || "").toLowerCase();
  const mainStreamer = String(
    process.env.NEXT_PUBLIC_MAIN_STREAMER_USERNAME || "francobertello74",
  ).toLowerCase();

  return (
    role === "admin" ||
    role === "streamer" ||
    username === mainStreamer
  );
}
