import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shree · यशूची मराठी व्हॉइस साथी",
  description:
    "Shree हा यशूचा शांत, आत्मविश्वासपूर्ण मराठी व्हॉइस सहाय्यक आहे; प्रेरणा, संपत्ती मानसिकता आणि कृतीशील सवयींसाठी तयार.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
