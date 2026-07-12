import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Diggy Lessard",
  description: "Official website for Diggy Lessard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
