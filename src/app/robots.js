const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://francobertello74.store";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: ["/dashboard", "/profile", "/stream", "/api"],
      },
    ],
    sitemap: `${SITE_URL.replace(/\/+$/, "")}/sitemap.xml`,
  };
}
