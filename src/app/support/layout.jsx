import { createPageMetadata } from "@/modules/seo/metadata";

export const metadata = createPageMetadata({
  title: "Soporte",
  description:
    "Abrí tickets para resolver consultas sobre canjes, créditos, sorteos y tu cuenta.",
  path: "/support",
  keywords: ["soporte", "tickets", "créditos", "cuenta"],
});

export default function SupportLayout({ children }) {
  return children;
}
