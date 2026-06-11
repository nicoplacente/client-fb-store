import { createPageMetadata } from "@/modules/seo/metadata";

export const metadata = createPageMetadata({
  title: "Ranking",
  description:
    "Consultá la tabla de puntos, watchtime y estadísticas de la comunidad de FrancoBertello74.",
  path: "/ranking",
  keywords: ["ranking", "puntos", "watchtime", "comunidad"],
});

export default function RankingLayout({ children }) {
  return children;
}
