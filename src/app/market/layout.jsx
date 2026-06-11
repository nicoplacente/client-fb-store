import { createPageMetadata } from "@/modules/seo/metadata";

export const metadata = createPageMetadata({
  title: "Tienda",
  description:
    "Canjeá créditos del canal por productos, packs y recompensas de la comunidad de FrancoBertello74.",
  path: "/market",
  keywords: ["tienda", "créditos", "canjes", "productos"],
});

export default function MarketLayout({ children }) {
  return children;
}
