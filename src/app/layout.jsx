import "./globals.css";
import Sidebar from "@/modules/sidebar/components/sidebar";
import Header from "@/modules/header/components/header";
import { AuthProvider } from "@/context/auth-context/auth-context";
import { SidebarProvider } from "@/context/sidebar-context/sidebar-context";
import ContentWrapper from "@/context/content-wrapper";
import { getUserFromSession } from "@/modules/auth/libs/auth";
import { Toaster } from "sonner";

export const metadata = {
  title: "FrancoBertello74 Store",
  description: "FrancoBertello74 Store",
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
