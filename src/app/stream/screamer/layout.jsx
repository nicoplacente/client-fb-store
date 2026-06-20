import { createPageMetadata } from "@/modules/seo/metadata";

export const metadata = createPageMetadata({
  title: {
    absolute: "Screamer del stream | FrancoBertello74 Store",
  },
  description: "Fuente técnica de screamers para OBS.",
  path: "/stream/screamer",
  index: false,
});

export default function StreamScreamerLayout({ children }) {
  return children;
}
