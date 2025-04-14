import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import Nav from "@/components/Nav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Flight Routes Explorer",
  description: "Browse airline flight routes data",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} min-h-screen flex flex-col bg-gray-50`}
      >
        <Header />
        <Nav />
        <main className="flex-1 p-4">{children}</main>
        <footer className="bg-gray-100 p-2 text-center text-gray-600 text-sm">
          Flight Routes API Explorer
        </footer>
      </body>
    </html>
  );
}
