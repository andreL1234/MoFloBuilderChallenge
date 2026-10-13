import type { Metadata } from "next";
import { KnowledgeProvider } from "@/context/KnowledgeContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "MoKnowledge - Company Knowledge Base Builder",
  description:
    "Web-based tool to scrape company websites and build comprehensive knowledge bases",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gradient-to-br from-blue-900 via-blue-700 to-blue-900" suppressHydrationWarning>
        <KnowledgeProvider>
          {/* Main content - full height with blue background */}
          <main className="min-h-screen flex flex-col">
            {children}
          </main>
        </KnowledgeProvider>
      </body>
    </html>
  );
}
