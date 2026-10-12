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
    <html lang="en">
      <body className="bg-gray-50">
        <KnowledgeProvider>
          <nav className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">MoKnowledge</h1>
                <div className="flex gap-4">
                  <a
                    href="/knowledge"
                    className="text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Build
                  </a>
                  <a
                    href="/knowledge/view"
                    className="text-gray-700 hover:text-gray-900 font-medium"
                  >
                    View
                  </a>
                </div>
              </div>
            </div>
          </nav>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </KnowledgeProvider>
      </body>
    </html>
  );
}
