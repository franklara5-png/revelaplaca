import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Header, Footer, VisitTracker } from "@/components/layout";
import { getDefaultMetadata } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = getDefaultMetadata();

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-rp-bg text-rp-ink">
        {/* Primeiro elemento focavel da pagina: quem navega por teclado pula o
            menu inteiro em vez de tabular por ele em toda visita. Invisivel
            ate receber foco. */}
        <a
          href="#conteudo"
          className="sr-only rounded-full bg-rp-primary px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60]"
        >
          Pular para o conteúdo
        </a>
        <Header />
        <main id="conteudo" className="flex-1">
          {children}
        </main>
        <Footer />
        <VisitTracker />
        <Analytics />
      </body>
    </html>
  );
}
