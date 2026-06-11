import { createPageMetadata } from "@/modules/seo/metadata";

export const metadata = createPageMetadata({
  title: "Predicciones",
  description:
    "Participá en predicciones de la comunidad, apostá puntos y consultá los resultados.",
  path: "/predictions",
  keywords: ["predicciones", "puntos", "Kick", "comunidad"],
});

export default function PredictionsLayout({ children }) {
  return children;
}
