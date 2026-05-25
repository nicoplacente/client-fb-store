import "./globals.css";
import Sidebar from "@/modules/sidebar/components/sidebar";
import Header from "@/modules/header/components/header";
import { AuthProvider } from "@/context/auth-context/auth-context";
import { SidebarProvider } from "@/context/sidebar-context/sidebar-context";
import ContentWrapper from "@/context/content-wrapper";
import { getUserFromSession } from "@/modules/auth/libs/auth";
import { Toaster } from "sonner";

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://francobertello74.store"
  ),
  title: {
    default: "FrancoBertello74 Store",
    template: "%s | FrancoBertello74 Store",
  },
  description:
    "Tienda de la comunidad de FrancoBertello74 para canjear créditos, participar en sorteos y gestionar soporte.",
  keywords: [
    "FrancoBertello74",
    "Kick",
    "tienda",
    "créditos",
    "sorteos",
    "canjes",
  ],
  applicationName: "FrancoBertello74 Store",
  openGraph: {
    title: "FrancoBertello74 Store",
    description:
      "Canjeá créditos, participá en sorteos y revisá tus compras de la comunidad.",
    siteName: "FrancoBertello74 Store",
    type: "website",
    locale: "es_AR",
  },
  twitter: {
    card: "summary",
    title: "FrancoBertello74 Store",
    description:
      "Canjeá créditos, participá en sorteos y gestioná soporte de la comunidad.",
  },
};

export default async function RootLayout({ children }) {
  const user = await getUserFromSession();

  return (
    <html lang="es">
      <body className="antialiased flex flex-col">
        <AuthProvider initialUser={user}>
          <SidebarProvider>
            <div className="min-h-screen w-full text-gray-100">
              <Header />
              <Sidebar />
              <ContentWrapper>{children}</ContentWrapper>
            </div>
            <Toaster position="bottom-right" richColors closeButton />
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
