import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rentillect — Intelligent Rental Management for Pakistan",
  description: "Digital lease agreements, PKR rent tracking, AI lease legal compliance, and verified tenant workflows built for Pakistani landlords and tenants.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
