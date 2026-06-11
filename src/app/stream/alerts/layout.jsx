import { createPageMetadata } from "@/modules/seo/metadata";

export const metadata = createPageMetadata({
  title: {
    absolute: "Alertas del stream | FrancoBertello74 Store",
  },
  description: "Vista técnica de alertas del stream.",
  path: "/stream/alerts",
  index: false,
});

export default function StreamAlertsLayout({ children }) {
  return children;
}
