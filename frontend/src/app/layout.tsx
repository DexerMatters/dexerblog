import type { Metadata } from "next";
import { Source_Serif_4, Noto_Serif_SC } from "next/font/google";
import "./globals.css";
import Menu from "./menu";
import CacheProvider from "@/components/cache-provider";
import CacheDebug from "@/components/cache-debug";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  weight: "500"
});

const notoSerif = Noto_Serif_SC({
  subsets: ["latin"],
  display: "swap",
  weight: "500"
});

export const metadata: Metadata = {
  title: "dexer-matte.rs",
  description: "Dexer's running ideas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sourceSerif.className} ${notoSerif.className} antialiased overflow-hidden`}
      >
        <CacheProvider>
          <Menu>{children}</Menu>
          <CacheDebug />
        </CacheProvider>
      </body>
    </html>
  );
}
