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
        return { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-400', icon: CheckCircle };
      case 'false':
        return { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-400', icon: XCircle };
      case 'misleading':
        return { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-400', icon: AlertTriangle };
      default:
        return { bg: 'bg-gray-500/20', border: 'border-gray-500/50', text: 'text-gray-400', icon: Info };
    }
  };

  const dataSources = [
    { name: 'Congress Voting Records', icon: Vote, count: '50+ years', color: 'text-claude-purple' },
    { name: 'Campaign Finance Data', icon: TrendingUp, count: 'Real-time', color: 'text-claude-teal' },
    { name: 'Public Statements', icon: MessageSquare, count: '100K+ speeches', color: 'text-claude-terracotta' },
    { name: 'Government Records', icon: Building, count: 'All branches', color: 'text-claude-violet' }
  ];

  const quickQuestions = [
    "How did Congress vote on the latest infrastructure bill?",
    "What is the current approval rating of the President?",
    "Who are the top campaign donors in 2026?",
    "What bills are currently pending in the Senate?"
  ];

  return (
    <div className="min-h-screen bg-claude-charcoal text-claude-cream relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 bg-animated" />
      <div className="fixed inset-0 grid-pattern" />
      
      {/* Floating orbs */}
      <div className="fixed top-20 left-[10%] w-96 h-96 bg-claude-purple/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="fixed bottom-20 right-[10%] w-80 h-80 bg-claude-teal/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      <div className="fixed top-1/2 left-1/2 w-64 h-64 bg-claude-terracotta/10 rounded-full blur-3xl animate-float" />

      <div className="relative z-10">
        {/* Header */}
        <header className="glass border-b border-claude-purple/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-claude-purple via-claude-teal to-claude-terracotta rounded-xl flex items-center justify-center shadow-lg glow-purple">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-claude-teal rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold gradient-text">
                  CLAUDE FOR MAYOR
                </h1>
                <p className="text-claude-lavender/70 text-xs font-mono tracking-widest">
                  AI DEMOCRACY &amp; TRANSPARENCY HUB
                </p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <Link to="/somaliscan" className="text-claude-cream/70 hover:text-claude-teal transition-colors flex items-center gap-2" data-testid="nav-somaliscan">
                <Globe className="w-4 h-4" />
                SomaliScan
              </Link>
              <button className="px-5 py-2.5 bg-gradient-to-r from-claude-purple to-claude-violet hover:from-claude-violet hover:to-claude-purple text-white font-semibold rounded-lg shadow-lg glow-purple transition-all btn-hover" data-testid="donate-btn">
                DONATE
              </button>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 py-12 md:py-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-claude-purple/30 mb-6">
              <Sparkles className="w-4 h-4 text-claude-teal" />
              <span className="text-sm font-medium text-claude-lavender">Powered by Claude AI</span>
            </div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6 leading-tight">
              <span className="gradient-text">Democracy</span>
              <br />
              <span className="text-claude-cream">Meets Intelligence</span>
            </h2>
            <p className="text-lg md:text-xl text-claude-beige/70 max-w-3xl mx-auto leading-relaxed">
              Access congressional votes, campaign finance, official statements, and real-time fact-checking — 
              all powered by AI that's transparent about its sources.
            </p>
          </div>

          {/* Mission cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16 stagger">
            {[
              { icon: Eye, title: "Radical Transparency", desc: "Every source cited, every claim verifiable", color: 'from-claude-purple to-claude-violet' },
              { icon: Scale, title: "Non-Partisan Analysis", desc: "Facts over faction, data over dogma", color: 'from-claude-teal to-cyan-400' },
              { icon: Users, title: "Democratic Access", desc: "Complex governance made accessible", color: 'from-claude-terracotta to-orange-400' }
            ].map((item, i) => (
              <div key={i} className="glass rounded-2xl p-6 card-hover border border-claude-purple/20">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4`}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-display font-bold text-claude-cream mb-2">{item.title}</h3>
                <p className="text-claude-beige/60">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Data sources */}
          <div className="glass rounded-2xl p-6 mb-16 border border-claude-purple/20">
            <h3 className="text-lg font-display font-semibold text-claude-lavender mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Our Data Sources
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {dataSources.map((source, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-claude-slate/50 hover:bg-claude-slate transition-colors">
                  <source.icon className={`w-5 h-5 ${source.color}`} />
                  <div>
                    <p className="text-sm font-medium text-claude-cream">{source.name}</p>
                    <p className="text-xs text-claude-beige/50">{source.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Tabs Section */}
        <section className="max-w-7xl mx-auto px-4 pb-20">
          {/* Tab navigation */}
          <div className="flex flex-wrap gap-2 mb-8 p-2 glass rounded-xl border border-claude-purple/20" data-testid="main-tabs">
            {[
              { id: 'chat', label: 'Ask Claude', icon: MessageSquare },
              { id: 'factcheck', label: 'Fact Checker', icon: CheckCircle },
              { id: 'xpost', label: 'X Post Analyzer', icon: Twitter },
              { id: 'leaders', label: 'Leader Updates', icon: Users },
              { id: 'issues', label: 'Key Issues', icon: Flag },
              { id: 'calendar', label: 'Calendar', icon: Calendar }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                data-testid={`tab-${tab.id}`}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-claude-purple to-claude-teal text-white shadow-lg'
                    : 'text-claude-beige/70 hover:text-claude-cream hover:bg-claude-slate/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="glass rounded-2xl border border-claude-purple/20 overflow-hidden">
            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <div className="p-6" data-testid="chat-panel">
                <div className="h-[50vh] overflow-y-auto mb-6 space-y-4 pr-2">
                  {messages.length === 0 && (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-claude-purple/20 to-claude-teal/20 flex items-center justify-center">
                        <MessageSquare className="w-10 h-10 text-claude-lavender" />
                      </div>
                      <p className="text-xl text-claude-beige/70 mb-8">Ask anything about US politics, votes, finance, legislation...</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                        {quickQuestions.map((q, i) => (
                          <button
                            key={i}
                            onClick={() => setQuery(q)}
                            className="text-left p-3 rounded-lg bg-claude-slate/50 hover:bg-claude-purple/20 border border-claude-purple/20 text-sm text-claude-beige/80 transition-all flex items-center gap-2"
                            data-testid={`quick-question-${i}`}
                          >
                            <ChevronRight className="w-4 h-4 text-claude-purple flex-shrink-0" />
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} chat-bubble`}>
                      <div className={`max-w-3xl p-4 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-claude-purple/30 to-claude-violet/30 border border-claude-purple/40'
                          : 'bg-claude-slate/70 border border-claude-teal/20'
                      }`}>
                        <p className="text-claude-cream whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        {msg.sources?.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-claude-purple/20">
                            <p className="text-xs text-claude-teal flex items-center gap-1">
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
                      <div className="bg-claude-slate/70 border border-claude-teal/20 px-6 py-4 rounded-2xl">
                        <div className="flex gap-2">
                          <div className="w-3 h-3 bg-claude-purple rounded-full loading-dot" />
                          <div className="w-3 h-3 bg-claude-teal rounded-full loading-dot" />
                          <div className="w-3 h-3 bg-claude-terracotta rounded-full loading-dot" />
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
                    placeholder="Ask about congressional votes, campaign finance, legislation..."
                    className="flex-1 bg-claude-slate/50 border-2 border-claude-purple/30 rounded-xl px-5 py-4 text-claude-cream placeholder-claude-beige/40 focus:outline-none focus:border-claude-purple focus:ring-2 focus:ring-claude-purple/20 transition"
                    disabled={loading}
                    data-testid="chat-input"
                  />
                  <button
                    type="submit"
                    disabled={loading || !query.trim()}
                    className="px-6 bg-gradient-to-r from-claude-purple to-claude-teal hover:from-claude-violet hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition shadow-lg flex items-center gap-2"
                    data-testid="chat-submit"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </form>
              </div>
            )}

            {/* Fact Checker Tab */}
            {activeTab === 'factcheck' && (
              <div className="p-6" data-testid="factcheck-panel">
                <div className="max-w-3xl mx-auto">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-display font-bold gradient-text mb-2">AI Fact Checker</h3>
                    <p className="text-claude-beige/60">Paste any political claim to get an AI-powered fact check</p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex gap-2 flex-wrap">
                      {['statement', 'tweet', 'article', 'speech'].map(type => (
                        <button
                          key={type}
                          onClick={() => setFactCheckType(type)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            factCheckType === type
                              ? 'bg-claude-purple text-white'
                              : 'bg-claude-slate/50 text-claude-beige/70 hover:text-claude-cream'
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
                      className="w-full h-32 bg-claude-slate/50 border-2 border-claude-purple/30 rounded-xl px-5 py-4 text-claude-cream placeholder-claude-beige/40 focus:outline-none focus:border-claude-purple resize-none"
                      data-testid="factcheck-input"
                    />

                    <button
                      onClick={handleFactCheck}
                      disabled={factCheckLoading || !factCheckInput.trim()}
                      className="w-full py-4 bg-gradient-to-r from-claude-purple to-claude-teal hover:from-claude-violet hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition shadow-lg flex items-center justify-center gap-2"
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
                          <p className="text-sm text-claude-beige/60">Verdict</p>
                          <p className={`text-2xl font-bold uppercase ${getVerdictStyles(factCheckResult.verdict).text}`}>
                            {factCheckResult.verdict}
                          </p>
                        </div>
                        <div className="ml-auto">
                          <p className="text-sm text-claude-beige/60">Confidence</p>
                          <p className="text-xl font-bold text-claude-cream">{Math.round(factCheckResult.confidence * 100)}%</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-claude-lavender mb-1">Claim</p>
                          <p className="text-claude-cream/80 italic">"{factCheckResult.claim}"</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-claude-lavender mb-1">Explanation</p>
                          <p className="text-claude-cream/80 whitespace-pre-wrap">{factCheckResult.explanation}</p>
                        </div>
                        {factCheckResult.sources?.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-claude-lavender mb-1">Sources</p>
                            <ul className="space-y-1">
                              {factCheckResult.sources.map((source, i) => (
                                <li key={i} className="text-claude-teal text-sm flex items-center gap-1">
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
                    <div className="rounded-xl p-4 bg-red-500/20 border border-red-500/50 text-red-400">
                      {factCheckResult.error}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* X Post Analyzer Tab */}
            {activeTab === 'xpost' && (
              <div className="p-6" data-testid="xpost-panel">
                <div className="max-w-3xl mx-auto">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-4">
                      <Twitter className="w-8 h-8 text-claude-teal" />
                      <h3 className="text-2xl font-display font-bold gradient-text">X Post Analyzer</h3>
                    </div>
                    <p className="text-claude-beige/60">Paste any political X (Twitter) post for AI analysis</p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <input
                      value={xPostAuthor}
                      onChange={e => setXPostAuthor(e.target.value)}
                      placeholder="Author username (optional)"
                      className="w-full bg-claude-slate/50 border-2 border-claude-purple/30 rounded-xl px-5 py-3 text-claude-cream placeholder-claude-beige/40 focus:outline-none focus:border-claude-purple"
                      data-testid="xpost-author"
                    />

                    <textarea
                      value={xPostContent}
                      onChange={e => setXPostContent(e.target.value)}
                      placeholder="Paste the X post content here..."
                      className="w-full h-40 bg-claude-slate/50 border-2 border-claude-purple/30 rounded-xl px-5 py-4 text-claude-cream placeholder-claude-beige/40 focus:outline-none focus:border-claude-purple resize-none"
                      data-testid="xpost-content"
                    />

                    <button
                      onClick={handleXPostAnalysis}
                      disabled={xPostLoading || !xPostContent.trim()}
                      className="w-full py-4 bg-gradient-to-r from-claude-purple to-claude-teal hover:from-claude-violet hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition shadow-lg flex items-center justify-center gap-2"
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
                    <div className="rounded-xl p-6 bg-claude-slate/50 border border-claude-purple/30" data-testid="xpost-result">
                      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-claude-purple/20">
                        <Twitter className="w-5 h-5 text-claude-teal" />
                        <span className="font-medium text-claude-cream">Analysis Results</span>
                        {xPostAnalysis.author && (
                          <span className="text-claude-beige/60">@{xPostAnalysis.author}</span>
                        )}
                      </div>
                      <div className="prose prose-invert max-w-none">
                        <p className="text-claude-cream/80 whitespace-pre-wrap leading-relaxed">{xPostAnalysis.analysis}</p>
                      </div>
                    </div>
                  )}

                  {xPostAnalysis?.error && (
                    <div className="rounded-xl p-4 bg-red-500/20 border border-red-500/50 text-red-400">
                      {xPostAnalysis.error}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Leader Updates Tab */}
            {activeTab === 'leaders' && (
              <div className="p-6" data-testid="leaders-panel">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-display font-bold gradient-text mb-2">Political Leader Updates</h3>
                    <p className="text-claude-beige/60">Recent communications from key US political figures</p>
                  </div>

                  <div className="flex flex-wrap gap-3 justify-center mb-8">
                    <button
                      onClick={() => handleLeaderUpdates('')}
                      className={`px-6 py-3 rounded-lg font-medium transition flex items-center gap-2 ${
                        selectedParty === '' && leaderUpdates
                          ? 'bg-gradient-to-r from-claude-purple to-claude-teal text-white'
                          : 'bg-claude-slate/50 text-claude-beige/70 hover:text-claude-cream'
                      }`}
                      data-testid="leaders-all"
                    >
                      <Users className="w-4 h-4" />
                      All Leaders
                    </button>
                    <button
                      onClick={() => handleLeaderUpdates('Democratic')}
                      className={`px-6 py-3 rounded-lg font-medium transition flex items-center gap-2 ${
                        selectedParty === 'Democratic'
                          ? 'bg-blue-600 text-white'
                          : 'bg-claude-slate/50 text-claude-beige/70 hover:text-claude-cream'
                      }`}
                      data-testid="leaders-dem"
                    >
                      <Flag className="w-4 h-4" />
                      Democrats
                    </button>
                    <button
                      onClick={() => handleLeaderUpdates('Republican')}
                      className={`px-6 py-3 rounded-lg font-medium transition flex items-center gap-2 ${
                        selectedParty === 'Republican'
                          ? 'bg-red-600 text-white'
                          : 'bg-claude-slate/50 text-claude-beige/70 hover:text-claude-cream'
                      }`}
                      data-testid="leaders-rep"
                    >
                      <Flag className="w-4 h-4" />
                      Republicans
                    </button>
                  </div>

                  {leaderLoading && (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="w-10 h-10 text-claude-purple animate-spin" />
                    </div>
                  )}

                  {leaderUpdates && !leaderUpdates.error && !leaderLoading && (
                    <div className="rounded-xl p-6 bg-claude-slate/50 border border-claude-purple/30" data-testid="leaders-result">
                      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-claude-purple/20">
                        <Clock className="w-5 h-5 text-claude-teal" />
                        <span className="font-medium text-claude-cream">Latest Updates</span>
                        <span className="text-xs text-claude-beige/50 ml-auto">
                          {new Date(leaderUpdates.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="prose prose-invert max-w-none">
                        <p className="text-claude-cream/80 whitespace-pre-wrap leading-relaxed">{leaderUpdates.updates}</p>
                      </div>
                    </div>
                  )}

                  {!leaderUpdates && !leaderLoading && (
                    <div className="text-center py-16 text-claude-beige/50">
                      <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Select a category above to view leader updates</p>
                    </div>
                  )}

                  {leaderUpdates?.error && (
                    <div className="rounded-xl p-4 bg-red-500/20 border border-red-500/50 text-red-400">
                      {leaderUpdates.error}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Key Issues Tab */}
            {activeTab === 'issues' && (
              <div className="p-6" data-testid="issues-panel">
                <div className="max-w-4xl mx-auto">
                  <h3 className="text-2xl font-display font-bold gradient-text text-center mb-8">
                    MAJOR US POLITICAL ISSUES • JANUARY 2026
                  </h3>

                  <div className="space-y-6">
                    <div className="rounded-xl p-6 bg-red-500/10 border-l-4 border-red-500">
                      <div className="flex items-start gap-4">
                        <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="text-xl font-bold text-claude-cream mb-3">Economic Pessimism & Cost-of-Living</h4>
                          <p className="text-claude-beige/80 mb-3">
                            Majority of Americans expect difficult year ahead — rising costs, unemployment fears, persistent inflation perception.
                            Consumer confidence remains near recessionary levels despite no official recession declaration.
                          </p>
                          <p className="text-sm text-claude-teal">
                            Sources: Gallup, Marist/NPR/PBS, University of Michigan Surveys
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl p-6 bg-amber-500/10 border-l-4 border-amber-500">
                      <div className="flex items-start gap-4">
                        <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="text-xl font-bold text-claude-cream mb-3">Healthcare Affordability Crisis</h4>
                          <p className="text-claude-beige/80 mb-3">
                            Enhanced ACA premium tax credits expired Dec 31, 2025 → average premium increases of ~114% for many subsidized enrollees.
                            New healthcare frameworks proposed but lack concrete implementation details.
                          </p>
                          <p className="text-sm text-claude-teal">
                            Sources: KFF, NPR, Reuters, White House Statements
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl p-6 bg-blue-500/10 border-l-4 border-blue-500">
                      <div className="flex items-start gap-4">
                        <Globe className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="text-xl font-bold text-claude-cream mb-3">International Trade & Tariffs</h4>
                          <p className="text-claude-beige/80 mb-3">
                            Ongoing tariff negotiations and trade policy debates affecting consumer prices and international relations.
                            Multiple trade agreements under review with potential impacts on manufacturing and agriculture sectors.
                          </p>
                          <p className="text-sm text-claude-teal">
                            Sources: USTR, Congressional Trade Records, Commerce Department
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl p-6 bg-purple-500/10 border-l-4 border-purple-500">
                      <div className="flex items-start gap-4">
                        <Scale className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="text-xl font-bold text-claude-cream mb-3">AI Regulation & Technology Policy</h4>
                          <p className="text-claude-beige/80 mb-3">
                            Congress debates comprehensive AI legislation affecting tech industry, employment, and national security.
                            Bipartisan efforts to establish guardrails while maintaining innovation competitiveness.
                          </p>
                          <p className="text-sm text-claude-teal">
                            Sources: Senate Commerce Committee, NIST, White House OSTP
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Calendar Tab */}
            {activeTab === 'calendar' && (
              <div className="p-6" data-testid="calendar-panel">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-display font-bold gradient-text mb-2">Political Calendar 2026</h3>
                    <p className="text-claude-beige/60">Upcoming elections, sessions, and important dates</p>
                  </div>

                  {!calendarData && !calendarLoading && (
                    <div className="text-center py-8">
                      <button
                        onClick={handleCalendar}
                        className="px-8 py-4 bg-gradient-to-r from-claude-purple to-claude-teal hover:from-claude-violet hover:to-cyan-400 text-white font-bold rounded-xl transition shadow-lg flex items-center gap-2 mx-auto"
                        data-testid="calendar-load"
                      >
                        <Calendar className="w-5 h-5" />
                        Load Political Calendar
                      </button>
                    </div>
                  )}

                  {calendarLoading && (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="w-10 h-10 text-claude-purple animate-spin" />
                    </div>
                  )}

                  {calendarData && !calendarData.error && !calendarLoading && (
                    <div className="rounded-xl p-6 bg-claude-slate/50 border border-claude-purple/30" data-testid="calendar-result">
                      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-claude-purple/20">
                        <Calendar className="w-5 h-5 text-claude-teal" />
                        <span className="font-medium text-claude-cream">Upcoming Events</span>
                        <button
                          onClick={handleCalendar}
                          className="ml-auto text-claude-beige/60 hover:text-claude-cream transition"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="prose prose-invert max-w-none">
                        <p className="text-claude-cream/80 whitespace-pre-wrap leading-relaxed">{calendarData.calendar}</p>
                      </div>
                    </div>
                  )}

                  {calendarData?.error && (
                    <div className="rounded-xl p-4 bg-red-500/20 border border-red-500/50 text-red-400">
                      {calendarData.error}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="glass border-t border-claude-purple/20 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-claude-purple" />
                <span className="font-display font-bold gradient-text">CLAUDE FOR MAYOR</span>
              </div>
              <p className="text-claude-beige/50 text-sm text-center">
                Powered by Claude AI • Committed to factual, non-partisan political transparency
              </p>
              <div className="flex items-center gap-4">
                <Link to="/somaliscan" className="text-claude-beige/60 hover:text-claude-teal transition flex items-center gap-1">
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
