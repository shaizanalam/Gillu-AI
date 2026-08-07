import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gillu AI - Wardrobe Scanner",
  description: "Scan your wardrobe with AI-powered clothing recognition",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
