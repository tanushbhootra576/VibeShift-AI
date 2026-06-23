import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VibeShift AI",
  description: "Your proactive productivity operations partner.",
};

import { AuthProvider } from "@/context/AuthContext";
import { TimerProvider } from "@/context/TimerContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${jetBrainsMono.variable} antialiased h-full dark`}>
      <body className="h-full bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col font-body">
        <AuthProvider>
          <TimerProvider>
            {children}
          </TimerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
