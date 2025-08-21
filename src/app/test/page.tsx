export default function TestPage() {
  return (
    <div className="min-h-screen bg-green-100 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-800 mb-4">✅ Test Page Working!</h1>
        <p className="text-green-700 text-lg">If you can see this, Next.js is working correctly.</p>
        <div className="mt-8 p-4 bg-white rounded-lg shadow-lg max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Palestine Pulse Status</h2>
          <ul className="text-left text-sm text-gray-600 space-y-1">
            <li>✅ Next.js Server: Running</li>
            <li>✅ React Components: Working</li>
            <li>✅ Tailwind CSS: Loaded</li>
            <li>⏳ Map Component: Testing...</li>
          </ul>
        </div>
        <div className="mt-6">
          <a 
            href="/" 
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Main App
          </a>
        </div>
      </div>
    </div>
  );
}

