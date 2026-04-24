import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// We will temporarily remove AppShell or conditionally render it later if needed,
// but for now we'll keep it so we don't break existing routing until we replace pages.
import AppShell from "@/components/app-shell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "FlowPilot AI",
  description: "High-velocity automation tools for marketing professionals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`light ${inter.variable} ${plusJakartaSans.variable}`} suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="min-h-screen bg-surface text-on-surface antialiased font-body-base">
        {/* We will let individual pages handle their layout for now, or use AppShell if it's the dashboard */}
        {children}
      </body>
    </html>
  );
}
