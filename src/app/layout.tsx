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
      <body className="bg-slate-50" suppressHydrationWarning>
        <KnowledgeProvider>
          {/* Header */}
          <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
              <div className="flex justify-between items-center h-16">
                {/* Logo */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
                    <span className="text-white font-bold text-base">M</span>
                  </div>
                  <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-slate-900">MoKnowledge</h1>
                    <p className="text-xs text-slate-500">Powered by MoFlo</p>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                  <a
                    href="/knowledge"
                    className="text-slate-700 hover:text-blue-600 font-medium text-sm transition-colors relative group"
                  >
                    Build
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300" />
                  </a>
                  <a
                    href="/knowledge/view"
                    className="text-slate-700 hover:text-blue-600 font-medium text-sm transition-colors relative group"
                  >
                    View Bases
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300" />
                  </a>
                </nav>

                {/* Mobile menu button */}
                <button className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <svg
                    className="w-6 h-6 text-slate-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-12">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-gradient-to-b from-blue-900 to-blue-950 text-blue-200 border-t border-blue-800/50">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-8">
              <div className="flex flex-col sm:flex-row justify-between items-center text-sm">
                <div className="flex items-center gap-2 mb-4 sm:mb-0">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                    <span className="text-blue-900 font-bold text-xs">M</span>
                  </div>
                  <span className="font-semibold text-white">MoKnowledge</span>
                  <span className="text-blue-400">by MoFlo</span>
                </div>
                <p>&copy; 2026 MoFlo Cloud</p>
              </div>
            </div>
          </footer>
        </KnowledgeProvider>
      </body>
    </html>
  );
}
