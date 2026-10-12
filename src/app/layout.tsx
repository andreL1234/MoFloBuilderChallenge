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
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">M</span>
                  </div>
                  <h1 className="text-xl font-semibold text-slate-900">MoKnowledge</h1>
                </div>

                {/* Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                  <a
                    href="/knowledge"
                    className="text-slate-700 hover:text-blue-600 font-medium text-sm transition-colors"
                  >
                    Build
                  </a>
                  <a
                    href="/knowledge/view"
                    className="text-slate-700 hover:text-blue-600 font-medium text-sm transition-colors"
                  >
                    View Bases
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
          <main className="min-h-screen">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-8">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-slate-900 text-white mt-16 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">M</span>
                    </div>
                    <span className="font-semibold">MoKnowledge</span>
                  </div>
                  <p className="text-slate-400 text-sm">
                    Built for MoFlo. Extract and organize company data with AI-powered scraping.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-sm">Product</h4>
                  <ul className="space-y-2 text-slate-400 text-sm">
                    <li>
                      <a href="/knowledge" className="hover:text-white transition-colors">
                        Build
                      </a>
                    </li>
                    <li>
                      <a href="/knowledge/view" className="hover:text-white transition-colors">
                        View
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-sm">Resources</h4>
                  <ul className="space-y-2 text-slate-400 text-sm">
                    <li>
                      <a href="#" className="hover:text-white transition-colors">
                        Documentation
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-white transition-colors">
                        API
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-sm">Company</h4>
                  <ul className="space-y-2 text-slate-400 text-sm">
                    <li>
                      <a href="#" className="hover:text-white transition-colors">
                        About
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-white transition-colors">
                        Contact
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-slate-800 pt-8 text-slate-400 text-sm text-center">
                <p>&copy; 2026 MoFlo. Built for growth.</p>
              </div>
            </div>
          </footer>
        </KnowledgeProvider>
      </body>
    </html>
  );
}
