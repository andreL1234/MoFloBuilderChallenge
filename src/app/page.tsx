export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 via-blue-700 to-blue-900 text-white">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-block mb-8">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/15 backdrop-blur-lg text-white text-sm font-bold border border-white/20 hover:bg-white/25 transition-all">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              AI-Powered Knowledge Builder
            </span>
          </div>

          {/* Main heading - Large and Bold */}
          <h1 className="text-7xl md:text-8xl font-black mb-6 leading-tight text-white drop-shadow-2xl">
            Build <span className="bg-gradient-to-r from-cyan-300 to-blue-200 bg-clip-text text-transparent">Knowledge Bases</span> in Minutes
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-blue-100 mb-12 leading-relaxed max-w-3xl mx-auto font-light">
            Scrape company websites, extract structured data, and build comprehensive knowledge bases for your entire business
          </p>

          {/* CTA Buttons - Matching MoFlo Style */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-2">
            <a
              href="/knowledge"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-900 font-bold rounded-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 shadow-xl text-lg"
            >
              Start Building
            </a>
            <a
              href="/knowledge/view"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/20 backdrop-blur-lg text-white font-bold rounded-full border-2 border-white/40 hover:bg-white/30 hover:border-white transition-all duration-300 text-lg"
            >
              View My Bases
            </a>
          </div>

          {/* Trust message */}
          <p className="text-sm text-blue-200 mt-8">No credit card required</p>
        </div>
      </section>

      {/* Features Grid - Blue background maintained */}
      <section className="relative z-10 px-6 py-20 bg-gradient-to-b from-transparent to-blue-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-black text-center mb-16 text-white">Powerful Features</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Smart Scraping",
                description: "Automatically extract industry, business model, positioning, and company data",
              },
              {
                title: "Rich Data Extraction",
                description: "Industry detection, branding, social presence, key people, and more",
              },
              {
                title: "Easy Management",
                description: "Organize, search, filter, edit, and export all your knowledge bases",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 hover:border-white/40 transition-all duration-300"
              >
                <h3 className="font-bold text-white mb-3 text-xl">{feature.title}</h3>
                <p className="text-blue-100 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 px-6 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-lg text-blue-200 mb-8">Scale your business intelligence with AI-powered knowledge extraction</p>
          <a
            href="/knowledge"
            className="inline-flex items-center justify-center px-8 py-4 bg-cyan-400 text-blue-900 font-black rounded-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 shadow-xl text-lg"
          >
            Get Started Free
          </a>
        </div>
      </section>
    </div>
  );
}
