export default function Home() {
  return (
    <div className="text-center py-12">
      <h2 className="text-4xl font-bold text-gray-900 mb-4">
        Welcome to MoKnowledge
      </h2>
      <p className="text-lg text-gray-600 mb-8">
        Build comprehensive company knowledge bases from website scraping
      </p>
      <div className="flex gap-4 justify-center">
        <a
          href="/knowledge"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
        >
          Start Building
        </a>
        <a
          href="/knowledge/view"
          className="bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-300"
        >
          View Knowledge Bases
        </a>
      </div>
    </div>
  );
}
