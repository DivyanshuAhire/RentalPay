import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Banner } from "@/components/Banner";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RentalPay",
  description: "Rent designer clothes from your peers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-slate-50">
            <Banner />
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8">
              {children}
            </main>
            <footer className="bg-white border-t py-8 text-center text-gray-500 text-sm">
              <div className="container mx-auto px-4 flex flex-col md:flex-row justify-center items-center gap-6">
                <p>&copy; {new Date().getFullYear()} RentalPay. All rights reserved.</p>
                <div className="flex gap-4">
                  <a href="/faq" className="hover:text-indigo-600 transition-colors">FAQ</a>
                  <a href="/contact" className="hover:text-indigo-600 transition-colors">Contact Us</a>
                </div>
              </div>
            </footer>
          </div>
        </AuthProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
