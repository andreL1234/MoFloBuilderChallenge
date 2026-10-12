export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 opacity-5 pointer-events-none" />

      <div className="text-center max-w-2xl mx-auto relative z-10">
        {/* Badge */}
        <div className="inline-block mb-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 text-cyan-700 text-sm font-medium">
            <span className="w-2 h-2 bg-cyan-600 rounded-full animate-pulse" />
            Powered by MoFlo
          </span>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
          Build Knowledge Bases in Minutes
        </h1>

        {/* Subheading */}
        <p className="text-xl text-slate-600 mb-8 leading-relaxed">
          Scrape company websites, extract structured data, and build comprehensive knowledge bases for your entire business. Powered by intelligent extraction and AI enrichment.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <a
            href="/knowledge"
            className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            Start Building
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <a
            href="/knowledge/view"
            className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-200 hover:bg-blue-50 transition-colors"
          >
            View Knowledge Bases
          </a>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 pt-12 border-t border-slate-200">
          {[
            {
              title: "Smart Scraping",
              description: "Automatically extract company data from websites",
              icon: "🔍",
            },
            {
              title: "Rich Data",
              description: "Industry, business model, positioning, and more",
              icon: "📊",
            },
            {
              title: "Easy Management",
              description: "Organize, search, duplicate, and export your bases",
              icon: "✨",
            },
          ].map((feature, i) => (
            <div key={i} className="text-left">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-slate-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
