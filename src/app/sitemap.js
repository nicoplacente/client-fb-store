const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://francobertello74.store";

const publicRoutes = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/market", priority: 0.9, changeFrequency: "weekly" },
  { path: "/predictions", priority: 0.85, changeFrequency: "daily" },
  { path: "/ranking", priority: 0.8, changeFrequency: "weekly" },
  { path: "/gifts", priority: 0.8, changeFrequency: "weekly" },
  { path: "/support", priority: 0.7, changeFrequency: "weekly" },
  { path: "/terms", priority: 0.5, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.5, changeFrequency: "monthly" },
];

export default function sitemap() {
  const baseUrl = SITE_URL.replace(/\/+$/, "");

  return publicRoutes.map((route) => ({
    url: new URL(route.path, `${baseUrl}/`).href,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
