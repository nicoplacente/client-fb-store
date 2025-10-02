import { Montserrat } from "next/font/google";
import "./globals.css";
import Sidebar from "@/modules/sidebar/components/sidebar";
import Header from "@/modules/header/components/header";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata = {
  title: "FrancoBertello74 Store",
  description: "FrancoBertello74 Store",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${montserrat.className} antialiased flex flex-col`}>
        <div className="min-h-screen w-full text-gray-100">
          <Header />
          <Sidebar />
          <main
            className={`transition-all duration-300 pt-20 ${
              isOpen ? "ml-72" : "ml-16"
            } p-6`}
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
