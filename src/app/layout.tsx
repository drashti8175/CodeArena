import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import { GameProvider } from "@/store/GameContext";
import { AuthProvider } from "@/store/AuthContext";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "CodeArena — Competitive Programming Meets Gaming",
  description: "Level up your coding skills through epic battles and quests",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} font-sans bg-[#0a0a0f] text-white min-h-screen`}>
        <AuthProvider>
          <GameProvider>
            <Navbar />
            <main className="pt-14">{children}</main>
          </GameProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
