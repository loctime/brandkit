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
  title: "BrandKit",
  description: "Generador gratuito de brand kits (favicon, SVG, PNG, wordmark, paleta) a partir de un logo.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        {children}
        <footer>
          <a href="https://github.com/loctime/brandkit" target="_blank" rel="noopener noreferrer">
            Código fuente
          </a>
        </footer>
      </body>
    </html>
  );
}
