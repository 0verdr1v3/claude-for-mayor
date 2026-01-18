import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Shield } from 'lucide-react';

const SomaliScanPage = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,120,0,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,120,0,0.08)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />
      <div className="fixed top-20 left-[10%] w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="fixed bottom-20 right-[10%] w-80 h-80 bg-orange-600/10 rounded-full blur-3xl animate-pulse" />

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-black/80 backdrop-blur-xl border-b border-orange-500/30 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-gray-400 hover:text-orange-400 transition"
                data-testid="back-home"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Hub</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-orange-500" />
              <span className="font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">CLAUDE FOR MAYOR</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent mb-4">
              SomaliScan
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Access the SomaliScan platform directly within the Claude for Mayor Democracy Hub
            </p>
          </div>

          {/* Iframe Container */}
          <div className="bg-gradient-to-br from-gray-900/90 to-black/90 rounded-2xl border border-orange-500/20 overflow-hidden shadow-2xl shadow-orange-950/30" data-testid="somaliscan-container">
            <div className="bg-gray-900/50 px-4 py-3 border-b border-orange-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <a 
                href="https://somaliscan.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-orange-400 hover:text-orange-300 transition flex items-center gap-1 text-sm"
                data-testid="somaliscan-external"
              >
                <span>Open in new tab</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <iframe
              src="https://somaliscan.com"
              title="SomaliScan"
              className="w-full h-[80vh] bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              data-testid="somaliscan-iframe"
            />
          </div>

          {/* Note */}
          <div className="mt-6 p-4 bg-gradient-to-br from-gray-900/90 to-black/90 rounded-xl border border-orange-500/20 text-center">
            <p className="text-gray-400 text-sm">
              Note: Some features may be limited within the embedded view. 
              <a 
                href="https://somaliscan.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-orange-400 hover:text-orange-300 transition ml-1"
              >
                Visit the full site
              </a>
              {' '}for complete functionality.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SomaliScanPage;
