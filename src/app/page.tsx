export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Gradient background with enhanced visual depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-slate-100 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full opacity-20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-100 to-cyan-100 rounded-full opacity-20 blur-3xl pointer-events-none" />

      <div className="text-center max-w-3xl mx-auto relative z-10 px-6">
        {/* Badge */}
        <div className="inline-block mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-100 to-blue-100 text-blue-900 text-sm font-semibold border border-blue-200 shadow-sm">
            <span className="w-2 h-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full animate-pulse" />
            Powered by MoFlo Cloud
          </span>
        </div>

        {/* Main heading with gradient */}
        <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-900 via-blue-700 to-cyan-600 bg-clip-text text-transparent mb-6 leading-tight">
          Build Knowledge Bases in Minutes
        </h1>

        {/* Subheading */}
        <p className="text-xl text-slate-700 mb-10 leading-relaxed max-w-2xl mx-auto">
          Scrape company websites, extract structured data, and build comprehensive knowledge bases for your entire business. Powered by intelligent extraction and AI enrichment.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <a
            href="/knowledge"
            className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Start Building
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <a
            href="/knowledge/view"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-700 font-bold rounded-lg border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 shadow-md"
          >
            View Knowledge Bases
          </a>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 pt-12 border-t border-blue-200">
          {[
            {
              title: "Smart Scraping",
              description: "Automatically extract company data from websites with AI-powered intelligence",
              icon: "🔍",
            },
            {
              title: "Rich Data",
              description: "Industry, business model, positioning, branding, and comprehensive insights",
              icon: "📊",
            },
            {
              title: "Easy Management",
              description: "Organize, search, duplicate, filter, and export all your knowledge bases",
              icon: "✨",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="text-left p-6 rounded-lg bg-white/80 backdrop-blur border border-blue-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 hover:scale-105"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="font-bold text-slate-900 mb-3 text-lg">{feature.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
