import { createPageMetadata } from "@/modules/seo/metadata";

export const metadata = createPageMetadata({
  title: "Sorteos",
  description:
    "Revisá sorteos activos, premios y tu participación en la comunidad de FrancoBertello74.",
  path: "/gifts",
  keywords: ["sorteos", "premios", "comunidad", "participación"],
});

export default function GiftsLayout({ children }) {
  return children;
}
