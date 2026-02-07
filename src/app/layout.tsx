import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { PlayerProvider } from "@/components/player/GlobalPlayer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PromptSD - SDキャラギャラリー",
  description: "音楽付きSDキャラのための、ノイズのない鑑賞特化ギャラリー",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50 dark:bg-zinc-950`}
      >
        <PlayerProvider>
          <Header />
          <main className="min-h-screen pt-16 pb-28">
            {children}
          </main>
        </PlayerProvider>
      </body>
    </html>
  );
}
