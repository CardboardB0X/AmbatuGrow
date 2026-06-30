import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { InventoryProvider } from "../context/InventoryContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AMBATUGROW ERP System - Inventory & Warehouse Tracking Terminal",
  description: "Enterprise-grade Inventory and Warehouse Management ERP Terminal. Features multi-location occupancy metrics, ledger timelines, FEFO expiration alerts, and auto-requisitioning.",
  keywords: "ERP, Inventory Tracking, Warehouse Management, Stock Transactions, FEFO, Supply Chain, Vercel",
  authors: [{ name: "Ambatugrow Systems" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="min-h-full bg-slate-50 text-slate-900 font-sans antialiased">
        <InventoryProvider>
          {children}
        </InventoryProvider>
      </body>
    </html>
  );
}
