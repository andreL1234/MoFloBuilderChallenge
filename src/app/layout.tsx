import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { KnowledgeProvider } from "@/context/KnowledgeContext";
import SiteNav from "@/components/SiteNav";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "MoKnowledge - Company Knowledge Base Builder",
  description:
    "Scrape company websites and turn them into structured knowledge bases",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning: browser extensions (e.g. Grammarly) inject attributes into <html>/<body>
    <html lang="en" className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <KnowledgeProvider>
          <SiteNav />
          <main className="min-h-screen">{children}</main>
        </KnowledgeProvider>
      </body>
    </html>
  );
}
