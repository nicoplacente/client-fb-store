import { Montserrat } from "next/font/google";
import "./globals.css";
import Sidebar from "@/modules/sidebar/components/sidebar";
import Header from "@/modules/header/components/header";
import { AuthProvider } from "@/context/auth-context/auth-context";
import { SidebarProvider } from "@/context/sidebar-context/sidebar-context";
import ContentWrapper from "@/context/content-wrapper";
import { getUserFromSession } from "@/modules/auth/libs/auth";
import { cookies } from "next/headers";
import { Toaster } from "sonner";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata = {
  title: "FrancoBertello74 Store",
  description: "FrancoBertello74 Store",
};

export default async function RootLayout({ children }) {
  const cookieStore = cookies();
  const user = await getUserFromSession(cookieStore);

  return (
    <html lang="es">
      <body className={`${montserrat.className} antialiased flex flex-col`}>
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
