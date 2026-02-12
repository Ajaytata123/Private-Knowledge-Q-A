import { useState, useCallback } from 'react';
import StatusBadge from './components/StatusBadge';
import UploadSection from './components/UploadSection';
import DocumentList from './components/DocumentList';
import ChatInterface from './components/ChatInterface';
import { BookOpen, Sparkles } from 'lucide-react';

function App() {
  const [refreshDocs, setRefreshDocs] = useState(0);

  const handleUploadSuccess = useCallback(() => {
    setRefreshDocs(prev => prev + 1);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-2 rounded-lg shadow-lg" role="img" aria-label="App Logo">
              <BookOpen className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Private Knowledge Q&A
              </h1>
              <p className="text-xs text-gray-600 hidden sm:block">AI-Powered Document Intelligence</p>
            </div>
          </div>
          <StatusBadge />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">

          {/* Left Column: Documents */}
          <div className="lg:col-span-4 space-y-4 fade-in">
            <UploadSection onUploadSuccess={handleUploadSuccess} />
            <DocumentList refreshTrigger={refreshDocs} />

            {/* Tip Card */}
            <div className="glass rounded-xl p-4 border border-blue-100/50">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div>
                  <h2 className="text-sm font-semibold text-gray-800 mb-1">Pro Tip</h2>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    Upload multiple documents and ask questions. The system will search across all files and show you the most relevant information with source citations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Chat */}
          <div className="lg:col-span-8 h-[calc(100vh-140px)] min-h-[500px] fade-in">
            <ChatInterface />
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="glass border-t border-white/20 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-700">
            Built with React, Node.js & AI • Secure & Private
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
