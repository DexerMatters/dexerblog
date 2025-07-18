import type { Metadata } from "next";
import { Source_Serif_4, Noto_Serif_SC } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/top_nav";

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
        <div className="flex flex-col w-lvw h-lvh items-stretch">
          {/* Header */}
          <header className="flex flex-col items-stretch bg-primary text-white">
            <div className="text-2xl mx-4 mt-4 mb-3">Dexer Matters's Blog</div>
            <TopNav />
          </header>
          {/* Main Content */}
          {children}
        </div>
      </body>
    </html>
  );
}
