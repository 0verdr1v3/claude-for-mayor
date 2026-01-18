import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, CheckCircle, XCircle, AlertCircle, TrendingUp,
  Users, FileText, MessageSquare, Shield, Calendar, Send,
  Sparkles, Globe, Twitter, ExternalLink, ChevronRight,
  Zap, Eye, Flag, Vote, Building, Scale, BookOpen, 
  Clock, RefreshCw, Loader2, AlertTriangle, Info
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  
  // Fact checker state
  const [factCheckInput, setFactCheckInput] = useState('');
  const [factCheckType, setFactCheckType] = useState('statement');
  const [factCheckResult, setFactCheckResult] = useState(null);
  const [factCheckLoading, setFactCheckLoading] = useState(false);
  
  // X Post analyzer state
  const [xPostContent, setXPostContent] = useState('');
  const [xPostAuthor, setXPostAuthor] = useState('');
  const [xPostAnalysis, setXPostAnalysis] = useState(null);
  const [xPostLoading, setXPostLoading] = useState(false);
  
  // Leader updates state
  const [leaderUpdates, setLeaderUpdates] = useState(null);
  const [leaderLoading, setLeaderLoading] = useState(false);
  const [selectedParty, setSelectedParty] = useState('');
  
  // Calendar state
  const [calendarData, setCalendarData] = useState(null);
  const [calendarLoading, setCalendarLoading] = useState(false);
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!query.trim() || loading) return;

    const userMessage = { role: 'user', content: query, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, message: query })
      });

      if (!res.ok) throw new Error('Failed to get response');

      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.content,
        sources: data.sources,
        timestamp: data.timestamp
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        sources: [],
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFactCheck = async () => {
    if (!factCheckInput.trim() || factCheckLoading) return;
    setFactCheckLoading(true);
    setFactCheckResult(null);

    try {
      const res = await fetch(`${API_URL}/api/fact-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim: factCheckInput, source_type: factCheckType })
      });

      if (!res.ok) throw new Error('Fact check failed');
      const data = await res.json();
      setFactCheckResult(data);
    } catch (err) {
      setFactCheckResult({ error: 'Failed to fact-check. Please try again.' });
    } finally {
      setFactCheckLoading(false);
    }
  };

  const handleXPostAnalysis = async () => {
    if (!xPostContent.trim() || xPostLoading) return;
    setXPostLoading(true);
    setXPostAnalysis(null);

    try {
      const res = await fetch(`${API_URL}/api/analyze-x-post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_content: xPostContent, author: xPostAuthor })
      });

      if (!res.ok) throw new Error('Analysis failed');
      const data = await res.json();
      setXPostAnalysis(data);
    } catch (err) {
      setXPostAnalysis({ error: 'Failed to analyze. Please try again.' });
    } finally {
      setXPostLoading(false);
    }
  };

  const handleLeaderUpdates = async (party = '') => {
    setLeaderLoading(true);
    setLeaderUpdates(null);
    setSelectedParty(party);

    try {
      const url = party ? `${API_URL}/api/leader-updates?party=${party}` : `${API_URL}/api/leader-updates`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch updates');
      const data = await res.json();
      setLeaderUpdates(data);
    } catch (err) {
      setLeaderUpdates({ error: 'Failed to fetch updates.' });
    } finally {
      setLeaderLoading(false);
    }
  };

  const handleCalendar = async () => {
    setCalendarLoading(true);
    setCalendarData(null);

    try {
      const res = await fetch(`${API_URL}/api/political-calendar`);
      if (!res.ok) throw new Error('Failed to fetch calendar');
      const data = await res.json();
      setCalendarData(data);
    } catch (err) {
      setCalendarData({ error: 'Failed to fetch calendar.' });
    } finally {
      setCalendarLoading(false);
    }
  };

  const getVerdictStyles = (verdict) => {
    switch (verdict?.toLowerCase()) {
      case 'true':
        return { bg: 'bg-emerald-950/50', border: 'border-emerald-500/50', text: 'text-emerald-400', icon: CheckCircle };
      case 'false':
        return { bg: 'bg-red-950/50', border: 'border-red-500/50', text: 'text-red-400', icon: XCircle };
      case 'misleading':
        return { bg: 'bg-amber-950/50', border: 'border-amber-500/50', text: 'text-amber-400', icon: AlertTriangle };
      default:
        return { bg: 'bg-gray-950/50', border: 'border-gray-500/50', text: 'text-gray-400', icon: Info };
    }
  };

  const dataSources = [
    { name: 'Congress Voting Records', icon: Vote, count: '50+ years' },
    { name: 'Campaign Finance Data', icon: TrendingUp, count: 'Real-time' },
    { name: 'Public Statements', icon: MessageSquare, count: '100K+ speeches' },
    { name: 'Government Records', icon: Building, count: 'All branches' }
  ];

  const quickQuestions = [
    "How did Congress vote on the latest infrastructure bill?",
    "What is the current approval rating of the President?",
    "Who are the top campaign donors in 2026?",
    "What bills are currently pending in the Senate?"
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,120,0,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,120,0,0.08)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />
      <div className="fixed top-[-10%] left-[20%] w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="fixed bottom-[-10%] right-[20%] w-96 h-96 bg-orange-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.8s' }} />

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-black/80 backdrop-blur-xl border-b border-orange-500/30 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                  CLAUDE FOR MAYOR
                </h1>
                <p className="text-orange-300/70 text-sm font-mono tracking-wider">
                  AI POLITICAL TRANSPARENCY SYSTEM
                </p>
              </div>
            </div>

            <nav className="flex items-center gap-4">
              <Link to="/somaliscan" className="text-gray-400 hover:text-orange-400 transition-colors flex items-center gap-2" data-testid="nav-somaliscan">
                <Globe className="w-4 h-4" />
                SomaliScan
              </Link>
              <button className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-lg shadow-lg shadow-orange-500/20 transition-all" data-testid="donate-btn">
                DONATE
              </button>
            </nav>
          </div>
        </header>

        {/* Mission Section */}
        <section className="max-w-7xl mx-auto px-4 py-10 md:py-14">
          <div className="text-center mb-10 md:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/30 mb-6">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-300">Powered by Claude AI</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-5">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                OUR MISSION
              </span>
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Making buried government data conversational — congressional votes, campaign finance, official statements — for everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-12">
            {[
              { icon: FileText, title: "Data Transparency", desc: "Public data made truly accessible" },
              { icon: CheckCircle, title: "Public Accountability", desc: "Holding officials to records & promises" },
              { icon: Users, title: "Democratic Access", desc: "Everyone deserves to understand governance" }
            ].map((item, i) => (
              <div key={i} className="bg-gradient-to-br from-gray-900/90 to-black/90 p-6 rounded-xl border-2 border-orange-500/30 backdrop-blur-sm hover:shadow-[0_0_30px_rgba(255,120,0,0.3)] transition-all card-hover">
                <item.icon className="w-12 h-12 text-orange-500 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Data sources */}
          <div className="bg-gradient-to-br from-gray-900/90 to-black/90 rounded-2xl p-6 mb-12 border border-orange-500/20">
            <h3 className="text-lg font-semibold text-orange-300 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Our Data Sources
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {dataSources.map((source, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-black/50 hover:bg-orange-500/10 border border-orange-500/20 transition-colors">
                  <source.icon className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium text-white">{source.name}</p>
                    <p className="text-xs text-gray-500">{source.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Tabs Section */}
        <section className="max-w-7xl mx-auto px-4 pb-20">
          {/* Tab navigation */}
          <div className="flex flex-wrap gap-2 md:gap-4 mb-6 pb-2 overflow-x-auto" data-testid="main-tabs">
            {[
              { id: 'chat', label: 'ASK CLAUDE', icon: MessageSquare },
              { id: 'factcheck', label: 'FACT CHECKER', icon: CheckCircle },
              { id: 'xpost', label: 'X POST ANALYZER', icon: Twitter },
              { id: 'leaders', label: 'LEADER UPDATES', icon: Users },
              { id: 'issues', label: 'KEY ISSUES', icon: Flag },
              { id: 'calendar', label: 'CALENDAR', icon: Calendar }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                data-testid={`tab-${tab.id}`}
                className={`flex items-center gap-2 px-5 py-3 rounded-lg font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-[0_0_20px_rgba(255,120,0,0.5)]'
                    : 'bg-gray-900 text-gray-400 hover:text-white hover:bg-orange-950/40'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content Container */}
          <div className="bg-gradient-to-br from-gray-900/90 to-black/90 rounded-2xl border border-orange-500/20 shadow-2xl shadow-orange-950/30 overflow-hidden">
            
            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <div className="p-5 md:p-7" data-testid="chat-panel">
                <div className="h-[60vh] overflow-y-auto mb-6 space-y-5 pr-2">
                  {messages.length === 0 && (
                    <div className="text-center text-gray-500 py-24">
                      <MessageSquare className="w-20 h-20 mx-auto mb-6 text-orange-500/40" />
                      <p className="text-xl mb-8">Ask anything about US politics, votes, finance, bills...</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                        {quickQuestions.map((q, i) => (
                          <button
                            key={i}
                            onClick={() => setQuery(q)}
                            className="text-left p-3 rounded-lg bg-black/50 hover:bg-orange-500/20 border border-orange-500/20 text-sm text-gray-400 transition-all flex items-center gap-2"
                            data-testid={`quick-question-${i}`}
                          >
                            <ChevronRight className="w-4 h-4 text-orange-500 flex-shrink-0" />
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} chat-bubble`}>
                      <div className={`max-w-3xl p-5 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-orange-600/20 border border-orange-500/30'
                          : 'bg-gray-800/60 border border-gray-700/50'
                      }`}>
                        <p className="text-white whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        {msg.sources?.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-700">
                            <p className="text-xs text-orange-400 flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              Sources: {msg.sources.join(' • ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-800/60 border border-gray-700/50 px-6 py-4 rounded-2xl">
                        <div className="flex gap-2">
                          <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" />
                          <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                          <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSubmit} className="flex gap-3">
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="e.g., How did my representative vote on the latest budget bill?"
                    className="flex-1 bg-black/60 border-2 border-orange-500/30 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition"
                    disabled={loading}
                    data-testid="chat-input"
                  />
                  <button
                    type="submit"
                    disabled={loading || !query.trim()}
                    className="px-7 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition shadow-lg shadow-orange-500/20 flex items-center gap-2"
                    data-testid="chat-submit"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
                  </button>
                </form>
              </div>
            )}

            {/* Fact Checker Tab */}
            {activeTab === 'factcheck' && (
              <div className="p-5 md:p-7" data-testid="factcheck-panel">
                <div className="max-w-3xl mx-auto">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 mb-2">AI Fact Checker</h3>
                    <p className="text-gray-400">Paste any political claim to get an AI-powered fact check</p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex gap-2 flex-wrap">
                      {['statement', 'tweet', 'article', 'speech'].map(type => (
                        <button
                          key={type}
                          onClick={() => setFactCheckType(type)}
                          className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                            factCheckType === type
                              ? 'bg-orange-500 text-white'
                              : 'bg-gray-900 text-gray-400 hover:text-white hover:bg-orange-950/40'
                          }`}
                          data-testid={`factcheck-type-${type}`}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={factCheckInput}
                      onChange={e => setFactCheckInput(e.target.value)}
                      placeholder="Paste a political claim, statement, or quote to fact-check..."
                      className="w-full h-32 bg-black/60 border-2 border-orange-500/30 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 resize-none"
                      data-testid="factcheck-input"
                    />

                    <button
                      onClick={handleFactCheck}
                      disabled={factCheckLoading || !factCheckInput.trim()}
                      className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                      data-testid="factcheck-submit"
                    >
                      {factCheckLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Search className="w-5 h-5" />
                          Fact Check This Claim
                        </>
                      )}
                    </button>
                  </div>

                  {factCheckResult && !factCheckResult.error && (
                    <div className={`rounded-xl p-6 border ${getVerdictStyles(factCheckResult.verdict).bg} ${getVerdictStyles(factCheckResult.verdict).border}`} data-testid="factcheck-result">
                      <div className="flex items-center gap-3 mb-4">
                        {React.createElement(getVerdictStyles(factCheckResult.verdict).icon, {
                          className: `w-8 h-8 ${getVerdictStyles(factCheckResult.verdict).text}`
                        })}
                        <div>
                          <p className="text-sm text-gray-400">Verdict</p>
                          <p className={`text-2xl font-bold uppercase ${getVerdictStyles(factCheckResult.verdict).text}`}>
                            {factCheckResult.verdict}
                          </p>
                        </div>
                        <div className="ml-auto">
                          <p className="text-sm text-gray-400">Confidence</p>
                          <p className="text-xl font-bold text-white">{Math.round(factCheckResult.confidence * 100)}%</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-orange-400 mb-1">Claim</p>
                          <p className="text-gray-300 italic">"{factCheckResult.claim}"</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-orange-400 mb-1">Explanation</p>
                          <p className="text-gray-300 whitespace-pre-wrap">{factCheckResult.explanation}</p>
                        </div>
                        {factCheckResult.sources?.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-orange-400 mb-1">Sources</p>
                            <ul className="space-y-1">
                              {factCheckResult.sources.map((source, i) => (
                                <li key={i} className="text-orange-300 text-sm flex items-center gap-1">
                                  <ChevronRight className="w-3 h-3" />
                                  {source}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {factCheckResult?.error && (
                    <div className="rounded-xl p-4 bg-red-950/50 border border-red-500/50 text-red-400">
                      {factCheckResult.error}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* X Post Analyzer Tab */}
            {activeTab === 'xpost' && (
              <div className="p-5 md:p-7" data-testid="xpost-panel">
                <div className="max-w-3xl mx-auto">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-4">
                      <Twitter className="w-8 h-8 text-orange-500" />
                      <h3 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">X Post Analyzer</h3>
                    </div>
                    <p className="text-gray-400">Paste any political X (Twitter) post for AI analysis</p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <input
                      value={xPostAuthor}
                      onChange={e => setXPostAuthor(e.target.value)}
                      placeholder="Author username (optional)"
                      className="w-full bg-black/60 border-2 border-orange-500/30 rounded-xl px-5 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                      data-testid="xpost-author"
                    />

                    <textarea
                      value={xPostContent}
                      onChange={e => setXPostContent(e.target.value)}
                      placeholder="Paste the X post content here..."
                      className="w-full h-40 bg-black/60 border-2 border-orange-500/30 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 resize-none"
                      data-testid="xpost-content"
                    />

                    <button
                      onClick={handleXPostAnalysis}
                      disabled={xPostLoading || !xPostContent.trim()}
                      className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                      data-testid="xpost-submit"
                    >
                      {xPostLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5" />
                          Analyze Post
                        </>
                      )}
                    </button>
                  </div>

                  {xPostAnalysis && !xPostAnalysis.error && (
                    <div className="rounded-xl p-6 bg-gray-900/50 border border-orange-500/30" data-testid="xpost-result">
                      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-orange-500/20">
                        <Twitter className="w-5 h-5 text-orange-500" />
                        <span className="font-bold text-white">Analysis Results</span>
                        {xPostAnalysis.author && (
                          <span className="text-gray-500">@{xPostAnalysis.author}</span>
                        )}
                      </div>
                      <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{xPostAnalysis.analysis}</p>
                    </div>
                  )}

                  {xPostAnalysis?.error && (
                    <div className="rounded-xl p-4 bg-red-950/50 border border-red-500/50 text-red-400">
                      {xPostAnalysis.error}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Leader Updates Tab */}
            {activeTab === 'leaders' && (
              <div className="p-5 md:p-7" data-testid="leaders-panel">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 mb-2">Political Leader Updates</h3>
                    <p className="text-gray-400">Recent communications from key US political figures</p>
                  </div>

                  <div className="flex flex-wrap gap-3 justify-center mb-8">
                    <button
                      onClick={() => handleLeaderUpdates('')}
                      className={`px-6 py-3 rounded-lg font-bold transition flex items-center gap-2 ${
                        selectedParty === '' && leaderUpdates
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-[0_0_20px_rgba(255,120,0,0.5)]'
                          : 'bg-gray-900 text-gray-400 hover:text-white hover:bg-orange-950/40'
                      }`}
                      data-testid="leaders-all"
                    >
                      <Users className="w-4 h-4" />
                      All Leaders
                    </button>
                    <button
                      onClick={() => handleLeaderUpdates('Democratic')}
                      className={`px-6 py-3 rounded-lg font-bold transition flex items-center gap-2 ${
                        selectedParty === 'Democratic'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-900 text-gray-400 hover:text-white hover:bg-blue-950/40'
                      }`}
                      data-testid="leaders-dem"
                    >
                      <Flag className="w-4 h-4" />
                      Democrats
                    </button>
                    <button
                      onClick={() => handleLeaderUpdates('Republican')}
                      className={`px-6 py-3 rounded-lg font-bold transition flex items-center gap-2 ${
                        selectedParty === 'Republican'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-900 text-gray-400 hover:text-white hover:bg-red-950/40'
                      }`}
                      data-testid="leaders-rep"
                    >
                      <Flag className="w-4 h-4" />
                      Republicans
                    </button>
                  </div>

                  {leaderLoading && (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                    </div>
                  )}

                  {leaderUpdates && !leaderUpdates.error && !leaderLoading && (
                    <div className="rounded-xl p-6 bg-gray-900/50 border border-orange-500/30" data-testid="leaders-result">
                      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-orange-500/20">
                        <Clock className="w-5 h-5 text-orange-500" />
                        <span className="font-bold text-white">Latest Updates</span>
                        <span className="text-xs text-gray-500 ml-auto">
                          {new Date(leaderUpdates.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{leaderUpdates.updates}</p>
                    </div>
                  )}

                  {!leaderUpdates && !leaderLoading && (
                    <div className="text-center py-16 text-gray-500">
                      <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Select a category above to view leader updates</p>
                    </div>
                  )}

                  {leaderUpdates?.error && (
                    <div className="rounded-xl p-4 bg-red-950/50 border border-red-500/50 text-red-400">
                      {leaderUpdates.error}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Key Issues Tab */}
            {activeTab === 'issues' && (
              <div className="p-5 md:p-7" data-testid="issues-panel">
                <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 mb-8 text-center">
                  MAJOR US POLITICAL ISSUES • JANUARY 2026
                </h2>

                <div className="space-y-7">
                  <div className="border-l-4 border-red-500 pl-5 bg-red-950/20 p-5 rounded-r-xl">
                    <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-3">
                      <AlertCircle className="w-6 h-6 text-red-400" />
                      Economic Pessimism & Cost-of-Living Concerns
                    </h3>
                    <p className="text-gray-300 mb-3">
                      Majority of Americans expect difficult year ahead — rising costs, unemployment fears, persistent inflation perception.
                      Consumer confidence remains near recessionary levels despite no official recession declaration.
                    </p>
                    <p className="text-gray-300 mb-3">
                      Trump economic approval ratings range between 38–43% in recent surveys (net negative on economy).
                    </p>
                    <p className="text-sm text-orange-400">
                      Sources: Gallup, Marist/NPR/PBS, University of Michigan Surveys (Dec 2025 – Jan 18, 2026)
                    </p>
                  </div>

                  <div className="border-l-4 border-amber-500 pl-5 bg-amber-950/20 p-5 rounded-r-xl">
                    <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-3">
                      <XCircle className="w-6 h-6 text-amber-400" />
                      Healthcare Affordability Crisis
                    </h3>
                    <p className="text-gray-300 mb-3">
                      Enhanced ACA premium tax credits expired Dec 31, 2025 → average premium increases of ~114% (~$1,000+/year more) for many subsidized enrollees.
                    </p>
                    <p className="text-gray-300 mb-3">
                      Trump announced "Great Healthcare Plan" framework on Jan 15, 2026 — focuses on transparency, direct consumer payments, drug price reduction, insurer accountability.
                      Widely criticized as lacking concrete details and immediate relief for ACA premium spike.
                    </p>
                    <p className="text-sm text-orange-400">
                      Sources: White House (Jan 15, 2026), KFF, NPR, The Guardian, Reuters (Jan 2026)
                    </p>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-5 bg-blue-950/20 p-5 rounded-r-xl">
                    <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-3">
                      <Globe className="w-6 h-6 text-blue-400" />
                      International Trade & Tariffs
                    </h3>
                    <p className="text-gray-300 mb-3">
                      Ongoing tariff negotiations and trade policy debates affecting consumer prices and international relations.
                      Multiple trade agreements under review with potential impacts on manufacturing and agriculture sectors.
                    </p>
                    <p className="text-sm text-orange-400">
                      Sources: USTR, Congressional Trade Records, Commerce Department
                    </p>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-5 bg-purple-950/20 p-5 rounded-r-xl">
                    <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-3">
                      <Scale className="w-6 h-6 text-purple-400" />
                      AI Regulation & Technology Policy
                    </h3>
                    <p className="text-gray-300 mb-3">
                      Congress debates comprehensive AI legislation affecting tech industry, employment, and national security.
                      Bipartisan efforts to establish guardrails while maintaining innovation competitiveness.
                    </p>
                    <p className="text-sm text-orange-400">
                      Sources: Senate Commerce Committee, NIST, White House OSTP
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Calendar Tab */}
            {activeTab === 'calendar' && (
              <div className="p-5 md:p-7" data-testid="calendar-panel">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 mb-2">Political Calendar 2026</h3>
                    <p className="text-gray-400">Upcoming elections, sessions, and important dates</p>
                  </div>

                  {!calendarData && !calendarLoading && (
                    <div className="text-center py-8">
                      <button
                        onClick={handleCalendar}
                        className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition shadow-lg shadow-orange-500/20 flex items-center gap-2 mx-auto"
                        data-testid="calendar-load"
                      >
                        <Calendar className="w-5 h-5" />
                        Load Political Calendar
                      </button>
                    </div>
                  )}

                  {calendarLoading && (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                    </div>
                  )}

                  {calendarData && !calendarData.error && !calendarLoading && (
                    <div className="rounded-xl p-6 bg-gray-900/50 border border-orange-500/30" data-testid="calendar-result">
                      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-orange-500/20">
                        <Calendar className="w-5 h-5 text-orange-500" />
                        <span className="font-bold text-white">Upcoming Events</span>
                        <button
                          onClick={handleCalendar}
                          className="ml-auto text-gray-500 hover:text-white transition"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{calendarData.calendar}</p>
                    </div>
                  )}

                  {calendarData?.error && (
                    <div className="rounded-xl p-4 bg-red-950/50 border border-red-500/50 text-red-400">
                      {calendarData.error}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-black/80 backdrop-blur-xl border-t border-orange-500/30 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-orange-500" />
                <span className="font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">CLAUDE FOR MAYOR</span>
              </div>
              <p className="text-gray-500 text-sm text-center">
                Powered by Claude AI • Committed to factual, non-partisan political transparency
              </p>
              <div className="flex items-center gap-4">
                <Link to="/somaliscan" className="text-gray-500 hover:text-orange-400 transition flex items-center gap-1">
                  <ExternalLink className="w-4 h-4" />
                  SomaliScan
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
