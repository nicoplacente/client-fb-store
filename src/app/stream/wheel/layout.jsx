import { createPageMetadata } from "@/modules/seo/metadata";

export const metadata = createPageMetadata({
  title: {
    absolute: "Ruleta del stream | FrancoBertello74 Store",
  },
  description: "Vista técnica de la ruleta de recompensas del stream.",
  path: "/stream/wheel",
  index: false,
});

export default function StreamWheelLayout({ children }) {
  return children;
}
