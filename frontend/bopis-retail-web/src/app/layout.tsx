import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OmniStore Retail | 1-Hour Click & Collect (BOPIS)",
  description: "Buy Online, Pick Up In Store with live in-store shelf inventory, aisle wayfinding guides, and scannable digital passes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
