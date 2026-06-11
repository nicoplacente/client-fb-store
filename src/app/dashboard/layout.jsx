import { createPageMetadata } from "@/modules/seo/metadata";

export const metadata = createPageMetadata({
  title: "Dashboard",
  description: "Panel privado de administración de FrancoBertello74 Store.",
  path: "/dashboard",
  index: false,
});

export default function DashboardLayout({ children }) {
  return children;
}
