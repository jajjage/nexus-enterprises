import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";


export const metadata: Metadata = {
  title: "Nexus Enterprises | Business Consultancy",
  description:
    "Simplifying Business Registration, Tax, and Regulatory Compliance in Nigeria.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
