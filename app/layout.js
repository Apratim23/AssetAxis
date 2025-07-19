import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/header";
import { ClerkClientProvider } from "@/components/providers/clerk-provider"; // 👈 new
import { ClientProviders } from "@/components/providers/client-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AssetAxis",
  description: "Personal Finance Management App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-background text-foreground antialiased`}
      >
        <ClerkClientProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <ClientProviders />
          <footer className="bg-blue-50 py-12">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p>Made by Apratim Dutta 💪</p>
            </div>
          </footer>
        </ClerkClientProvider>
      </body>
    </html>
  );
}
