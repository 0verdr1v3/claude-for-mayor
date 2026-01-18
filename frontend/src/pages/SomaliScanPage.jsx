import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Shield } from 'lucide-react';

const SomaliScanPage = () => {
  return (
    <div className="min-h-screen bg-claude-charcoal text-claude-cream">
      {/* Background */}
      <div className="fixed inset-0 bg-animated" />
      <div className="fixed inset-0 grid-pattern" />
      <div className="fixed top-20 left-[10%] w-96 h-96 bg-claude-purple/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="fixed bottom-20 right-[10%] w-80 h-80 bg-claude-teal/15 rounded-full blur-3xl animate-pulse-slow" />

      <div className="relative z-10">
        {/* Header */}
        <header className="glass border-b border-claude-purple/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-claude-beige/70 hover:text-claude-cream transition"
                data-testid="back-home"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Hub</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-claude-purple" />
              <span className="font-display font-bold gradient-text">CLAUDE FOR MAYOR</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text mb-4">
              SomaliScan
            </h1>
            <p className="text-claude-beige/60 max-w-2xl mx-auto">
              Access the SomaliScan platform directly within the Claude for Mayor Democracy Hub
            </p>
          </div>

          {/* Iframe Container */}
          <div className="glass rounded-2xl border border-claude-purple/20 overflow-hidden" data-testid="somaliscan-container">
            <div className="bg-claude-slate/50 px-4 py-3 border-b border-claude-purple/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <a 
                href="https://somaliscan.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-claude-teal hover:text-cyan-400 transition flex items-center gap-1 text-sm"
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
          <div className="mt-6 p-4 glass rounded-xl border border-claude-purple/20 text-center">
            <p className="text-claude-beige/60 text-sm">
              Note: Some features may be limited within the embedded view. 
              <a 
                href="https://somaliscan.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-claude-teal hover:text-cyan-400 transition ml-1"
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
