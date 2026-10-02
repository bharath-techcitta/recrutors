import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TalentGPT | AI Recruitment Assistant",
  description:
    "AI recruitment workspace for job description matching, candidate discovery, and profile management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="h-screen w-screen overflow-hidden bg-[#F7F6F2] text-[#1D2521] antialiased selection:bg-[#164A3A] selection:text-white">
        {children}
      </body>
    </html>
  );
}
