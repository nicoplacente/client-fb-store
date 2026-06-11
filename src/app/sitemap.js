import { siteUrl } from "@/modules/seo/metadata";

const publicRoutes = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/market", priority: 0.9, changeFrequency: "weekly" },
  { path: "/predictions", priority: 0.85, changeFrequency: "daily" },
  { path: "/ranking", priority: 0.8, changeFrequency: "weekly" },
  { path: "/gifts", priority: 0.8, changeFrequency: "weekly" },
  { path: "/support", priority: 0.7, changeFrequency: "weekly" },
  { path: "/stream", priority: 0.7, changeFrequency: "daily" },
  { path: "/terms", priority: 0.5, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.5, changeFrequency: "monthly" },
];

export default function sitemap() {
  return publicRoutes.map((route) => ({
    url: new URL(route.path, `${siteUrl}/`).href,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
