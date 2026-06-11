const DEFAULT_SITE_URL = "https://francobertello-store.codeluxe.tech";

export const siteUrl = DEFAULT_SITE_URL.replace(/\/+$/, "");

export const siteName = "FrancoBertello74 Store";

export function createPageMetadata({
  title,
  description,
  path,
  keywords = [],
  index = true,
}) {
  const canonical = new URL(path, `${siteUrl}/`).href;
  const socialTitle =
    typeof title === "string" ? title : title.absolute || siteName;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
    },
    robots: index
      ? {
          index: true,
          follow: true,
        }
      : {
          index: false,
          follow: false,
          noarchive: true,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        },
    openGraph: {
      title: socialTitle,
      description,
      url: canonical,
      siteName,
      type: "website",
      locale: "es_AR",
      images: [
        {
          url: "/logo.webp",
          width: 1024,
          height: 1024,
          alt: `Logo de ${siteName}`,
        },
      ],
    },
    twitter: {
      card: "summary",
      title: socialTitle,
      description,
      images: ["/logo.webp"],
    },
  };
}
