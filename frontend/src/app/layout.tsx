import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sima Arome ERP Lite",
  description: "A lightweight ERP system for material tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
