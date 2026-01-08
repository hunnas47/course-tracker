import type { Metadata } from "next";
import { Libre_Baskerville, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const libre = Libre_Baskerville({
  variable: "--font-libre",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IHYA - Level Up Your Knowledge",
  description: "Track progress, earn XP, unlock achievements, and climb the leaderboard. Islamic education for Gen Z.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${libre.variable} ${jakarta.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
