export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-600 via-blue-500 to-blue-700">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-white">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-block mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-semibold border border-white/30">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Powered by MoFlo Cloud
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight text-white drop-shadow-lg">
            Build Knowledge Bases in Minutes
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-blue-50 mb-12 leading-relaxed max-w-3xl mx-auto">
            Scrape company websites, extract structured data, and build comprehensive knowledge bases for your entire business. Powered by intelligent extraction and AI enrichment.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a
              href="/knowledge"
              className="inline-flex items-center justify-center px-10 py-4 bg-white text-blue-600 font-bold rounded-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 shadow-xl hover:bg-blue-50"
            >
              Start Building
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <a
              href="/knowledge/view"
              className="inline-flex items-center justify-center px-10 py-4 bg-white/20 backdrop-blur-md text-white font-bold rounded-lg border-2 border-white/40 hover:bg-white/30 hover:border-white transition-all duration-300 shadow-lg"
            >
              View Knowledge Bases
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Powerful Features Built for Growth
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Everything you need to extract, organize, and manage company intelligence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Smart Scraping",
                description: "Automatically extract company data from websites with AI-powered intelligence and confidence scoring",
                icon: "🔍",
                color: "from-blue-500 to-blue-600",
              },
              {
                title: "Rich Data Extraction",
                description: "Industry detection, business models, positioning, branding, social presence, and more",
                icon: "📊",
                color: "from-cyan-500 to-blue-500",
              },
              {
                title: "Easy Management",
                description: "Organize, search, filter, duplicate, edit, and export all your knowledge bases",
                icon: "✨",
                color: "from-blue-600 to-slate-700",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-8 rounded-xl bg-white border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 hover:border-blue-300"
              >
                <div className={`inline-block p-4 rounded-lg bg-gradient-to-br ${feature.color} mb-6`}>
                  <span className="text-3xl">{feature.icon}</span>
                </div>
                <h3 className="font-bold text-slate-900 mb-3 text-xl">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-16 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-lg text-blue-100 mb-8">
            Build your first knowledge base in minutes. No credit card required.
          </p>
          <a
            href="/knowledge"
            className="inline-flex items-center justify-center px-10 py-4 bg-white text-blue-600 font-bold rounded-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 shadow-xl hover:bg-blue-50"
          >
            Launch Knowledge Builder
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </section>
    </div>
  );
}
