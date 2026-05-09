import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";

import { Toaster } from "@/components/ui/sonner";
import { SupportChat } from "@/components/support/SupportChat";


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

            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8">
              {children}
            </main>
            <footer className="bg-white border-t py-12 text-sm text-gray-500">
              <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">RentalPay</h3>
                  <p className="mb-4">Rent designer clothes from your peers.</p>
                  <p>&copy; {new Date().getFullYear()} RentalPay. All rights reserved.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
                  <ul className="space-y-2 flex flex-col">
                    <li><a href="/faq" className="hover:text-indigo-600 transition-colors">FAQ</a></li>
                    <li><a href="/contact" className="hover:text-indigo-600 transition-colors">Contact Us</a></li>
                    <li><a href="/terms" className="hover:text-indigo-600 transition-colors">Terms & Conditions</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
                  <ul className="space-y-2 flex flex-col">
                    <li><a href="/privacy" className="hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
                    <li><a href="/refund" className="hover:text-indigo-600 transition-colors">Refund & Cancellation Policy</a></li>
                    <li><a href="/shipping" className="hover:text-indigo-600 transition-colors">Shipping/Delivery Policy</a></li>
                    <li><a href="/community" className="hover:text-indigo-600 transition-colors">Community Guidelines</a></li>
                    <li><a href="/dmca" className="hover:text-indigo-600 transition-colors">DMCA/IP Complaint Policy</a></li>
                    <li><a href="/seller-agreement" className="hover:text-indigo-600 transition-colors">Seller Agreement</a></li>
                    <li><a href="/data-consent" className="hover:text-indigo-600 transition-colors">Data Processing & Cookies</a></li>
                  </ul>
                </div>
              </div>
            </footer>
          </div>
        </AuthProvider>
        <Toaster position="bottom-right" />
        <SupportChat />
      </body>
    </html>
  );
}
