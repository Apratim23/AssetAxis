import {Inter} from "next/font/google";
import "./globals.css";
import { Footer } from "react-day-picker";
import Header from "@/components/ui/header";
import { ClerkProvider } from "@clerk/nextjs";

const inter=Inter({subsets:["latin"]});

export const metadata = {
  title: "AssetAxis",
  description: "Personal Finance Management App",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body
        className={`${inter.className} bg-background text-foreground antialiased`}
      >{/*header*/}
      <Header />
      <main className="min-h-screen">
        {children}
      </main>
        {/*footer*/}
        <footer className="bg-blue-50 py-12">
          <div className="container mx-auto px-4 text-center text-gray-600">
            <p>
              Made by Apratim Dutta 💪
            </p>
          </div>
        </footer>
      </body>
    </html>
    </ClerkProvider>
  );
}
