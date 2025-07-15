import type { Metadata } from "next";
import { Source_Serif_4, Noto_Serif_SC } from "next/font/google";
import "./globals.css";

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
        className={`${sourceSerif.className} ${notoSerif.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
