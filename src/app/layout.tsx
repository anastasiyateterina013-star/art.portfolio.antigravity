import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";
import CursorFairyDust from "@/components/CursorFairyDust";

const momo = localFont({
  src: "../fonts/MomoTrustSans-Regular.ttf",
  variable: "--font-heading",
});

const xcharter = localFont({
  src: "../fonts/XCharter-Roman.otf",
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Anastasiya Teterina | Portfolio",
  description: "Graphic designer and student portfolio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${momo.variable} ${xcharter.variable}`}>
      <body>
        <CursorFairyDust />
        <main className="container">
          <Header />
          {children}
        </main>
      </body>
    </html>
  );
}
