import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Clock, Zap, BookOpen, ChevronRight, Lock, Sparkles } from 'lucide-react';

const IBGamesLanding = () => {
  const navigate = useNavigate();

  const games = [
    {
      id: 'greenshoe',
      title: 'Greenshoe Sprint',
      subtitle: 'Stabilize the IPO',
      description: 'Learn how underwriters use the greenshoe option to stabilize IPO prices',
      icon: '📈',
      color: 'from-emerald-500 to-cyan-500',
      status: 'available',
      duration: '3 min',
      difficulty: 'Beginner',
      concepts: ['IPO', 'Overallotment', 'Price Stabilization']
    },
    {
      id: 'dcf',
      title: 'DCF Dash',
      subtitle: 'Value the Company',
      description: 'Master discounted cash flow analysis through interactive scenarios',
      icon: '💰',
      color: 'from-amber-500 to-orange-500',
      status: 'coming_soon',
      concepts: ['Valuation', 'Cash Flow', 'Discount Rate']
    },
    {
      id: 'ma',
      title: 'M&A Mayhem',
      subtitle: 'Close the Deal',
      description: 'Navigate merger negotiations and understand deal structures',
      icon: '🤝',
      color: 'from-purple-500 to-pink-500',
      status: 'coming_soon',
      concepts: ['Mergers', 'Acquisitions', 'Synergies']
    },
    {
      id: 'lbo',
      title: 'LBO Launch',
      subtitle: 'Leverage the Buyout',
      description: 'Structure leveraged buyouts and optimize returns',
      icon: '🚀',
      color: 'from-red-500 to-rose-500',
      status: 'coming_soon',
      concepts: ['Leverage', 'Debt', 'Returns']
    },
    {
      id: 'pitchbook',
      title: 'Pitch Perfect',
      subtitle: 'Win the Client',
      description: 'Build compelling pitch books under time pressure',
      icon: '📊',
      color: 'from-blue-500 to-indigo-500',
      status: 'coming_soon',
      concepts: ['Pitch Books', 'Client Relations', 'Presentation']
    },
    {
      id: 'trading',
      title: 'Trading Floor',
      subtitle: 'Execute the Order',
      description: 'Experience the fast-paced world of securities trading',
      icon: '⚡',
      color: 'from-cyan-500 to-teal-500',
      status: 'coming_soon',
      concepts: ['Trading', 'Execution', 'Market Making']
    }
  ];

  const handleGameClick = (game) => {
    if (game.status === 'available') {
      navigate(`/play/${game.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a12] via-[#0d1020] to-[#0a0a12]">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="w-full h-full">
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="pt-12 pb-8 px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-white/70">Learn investment banking through play</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              IB.GAMES
            </span>
          </h1>
          
          <p className="text-xl text-white/60 max-w-md mx-auto leading-relaxed">
            Master Wall Street concepts in minutes, not months.
          </p>
          
          {/* Stats */}
          <div className="flex justify-center gap-8 mt-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">12</div>
              <div className="text-xs text-white/40">Concepts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">3 min</div>
              <div className="text-xs text-white/40">Per Game</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">Free</div>
              <div className="text-xs text-white/40">Always</div>
            </div>
          </div>
        </header>

        {/* Games Grid */}
        <main className="px-4 pb-12 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-lg font-semibold text-white">Games</h2>
            <span className="text-sm text-white/40">{games.filter(g => g.status === 'available').length} of {games.length} available</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {games.map((game) => (
              <button
                key={game.id}
                onClick={() => handleGameClick(game)}
                disabled={game.status !== 'available'}
                className={`group relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-300 ${
                  game.status === 'available' 
                    ? 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 hover:scale-[1.02] cursor-pointer' 
                    : 'bg-white/[0.02] border border-white/5 cursor-not-allowed opacity-60'
                }`}
              >
                {/* Gradient glow for available games */}
                {game.status === 'available' && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                )}
                
                <div className="relative z-10">
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center text-2xl shadow-lg`}>
                      {game.icon}
                    </div>
                    
                    {game.status === 'available' ? (
                      <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/70 group-hover:translate-x-1 transition-all" />
                    ) : (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 text-xs text-white/40">
                        <Lock className="w-3 h-3" />
                        <span>Soon</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg font-bold text-white mb-1">{game.title}</h3>
                  <p className="text-sm text-white/50 mb-3">{game.subtitle}</p>
                  
                  {/* Description */}
                  <p className="text-sm text-white/40 mb-4 line-clamp-2">{game.description}</p>
                  
                  {/* Meta info */}
                  {game.status === 'available' && (
                    <div className="flex items-center gap-4 text-xs text-white/50">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {game.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {game.difficulty}
                      </span>
                    </div>
                  )}
                  
                  {/* Concepts tags */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {game.concepts.map((concept, i) => (
                      <span 
                        key={i}
                        className="px-2 py-0.5 rounded-full bg-white/5 text-xs text-white/40"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-8 text-center border-t border-white/5">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-white/30" />
            <span className="text-sm text-white/30">Educational purposes only • Not financial advice</span>
          </div>
          <p className="text-xs text-white/20">
            New games added regularly • Built for aspiring investment bankers
          </p>
        </footer>
      </div>
    </div>
  );
};

export default IBGamesLanding;
