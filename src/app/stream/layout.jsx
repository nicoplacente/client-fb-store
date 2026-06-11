import { createPageMetadata } from "@/modules/seo/metadata";

export const metadata = createPageMetadata({
  title: "Stream",
  description:
    "Consultá el estado del stream y las recompensas activas de la comunidad de FrancoBertello74.",
  path: "/stream",
  keywords: ["stream", "Kick", "recompensas", "FrancoBertello74"],
});

export default function StreamLayout({ children }) {
  return children;
}
