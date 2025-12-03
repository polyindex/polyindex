import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Polyindex - Create Custom Polymarket Indexes",
    template: "%s | Polyindex"
  },
  description: "Create and share custom diversified indexes of Polymarket prediction markets. Filter by category, closing date, and more.",
  keywords: ['Polymarket', 'index', 'prediction markets', 'diversification', 'portfolio', 'betting'],
  icons: {
    icon: '/polyindex_logo.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased bg-gray-900 text-gray-100`}
      >
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
