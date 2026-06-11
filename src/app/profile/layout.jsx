import { createPageMetadata } from "@/modules/seo/metadata";

export const metadata = createPageMetadata({
  title: "Perfil",
  description: "Perfil privado de usuario de FrancoBertello74 Store.",
  path: "/profile",
  index: false,
});

export default function ProfileLayout({ children }) {
  return children;
}
