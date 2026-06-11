import "./globals.css";
import Sidebar from "@/modules/sidebar/components/sidebar";
import Header from "@/modules/header/components/header";
import { AuthProvider } from "@/context/auth-context/auth-context";
import { SidebarProvider } from "@/context/sidebar-context/sidebar-context";
import ContentWrapper from "@/context/content-wrapper";
import { getUserFromSession } from "@/modules/auth/libs/auth";
import { siteName, siteUrl } from "@/modules/seo/metadata";
import { Toaster } from "sonner";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
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
  category: "community",
  creator: "FrancoBertello74",
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "FrancoBertello74 Store",
    description:
      "Canjeá créditos, participá en sorteos y revisá tus compras de la comunidad.",
    siteName: "FrancoBertello74 Store",
    type: "website",
    locale: "es_AR",
    images: [
      {
        url: "/logo.webp",
        width: 1024,
        height: 1024,
        alt: "Logo de FrancoBertello74 Store",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "FrancoBertello74 Store",
    description:
      "Canjeá créditos, participá en sorteos y gestioná soporte de la comunidad.",
    images: ["/logo.webp"],
  },
};

export default async function RootLayout({ children }) {
  const user = await getUserFromSession();

  return (
    <html lang="es-AR">
      <body className="antialiased flex flex-col">
        <a
          href="#contenido-principal"
          className="skip-link"
        >
          Saltar al contenido principal
        </a>
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
