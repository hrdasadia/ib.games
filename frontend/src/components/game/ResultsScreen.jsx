import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';
import { 
  Trophy, RefreshCw, Share2, ChevronRight, ChevronLeft, BookOpen, Star, 
  TrendingUp, TrendingDown, Target, Shield, Zap, Lightbulb, Home,
  CheckCircle, AlertTriangle, XCircle, Info
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover"
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { LEARNING_BULLETS, LINKEDIN_CAPTION_TEMPLATE } from '../../data/mockData';

// Rank explanations
const RANK_INFO = {
  'Managing Director': { abbrev: 'MD', description: 'Exceptional! Top-tier performance.', color: 'from-amber-400 to-yellow-500' },
  'Director': { abbrev: 'D', description: 'Excellent! Senior leadership level.', color: 'from-purple-400 to-indigo-500' },
  'VP': { abbrev: 'VP', description: 'Great job! Vice President level.', color: 'from-cyan-400 to-blue-500' },
  'Associate': { abbrev: 'A', description: 'Good start! Mid-level performance.', color: 'from-emerald-400 to-green-500' },
  'Analyst': { abbrev: 'AN', description: 'Entry level. Keep practicing!', color: 'from-gray-400 to-slate-500' }
};

const ScoreCard = ({ result }) => {
  const rankInfo = RANK_INFO[result.rank] || RANK_INFO['Analyst'];

  // Ensure scores are capped at their maximums
  const scores = {
    stability: Math.min(400, Math.max(0, Math.round(result.scores?.stability || 0))),
    liquidity: Math.min(200, Math.max(0, Math.round(result.scores?.liquidity || 0))),
    efficiency: Math.min(200, Math.max(0, Math.round(result.scores?.efficiency || 0))),
    reputation: Math.min(200, Math.max(0, Math.round(result.scores?.reputation || 0)))
  };

  const scoreItems = [
    { name: 'Stability', value: scores.stability, max: 400, icon: Target, color: 'cyan' },
    { name: 'Liquidity', value: scores.liquidity, max: 200, icon: TrendingUp, color: 'emerald' },
    { name: 'Efficiency', value: scores.efficiency, max: 200, icon: Zap, color: 'amber' },
    { name: 'Reputation', value: scores.reputation, max: 200, icon: Shield, color: 'purple' }
  ];

  return (
    <div id="score-card-node" className="bg-gradient-to-br from-[#0d1020] to-[#1a1a2e] rounded-2xl p-5 border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-cyan-400 text-xs font-mono mb-1">IB.GAMES</div>
          <h2 className="text-white text-lg font-bold">Greenshoe Sprint</h2>
        </div>
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${rankInfo.color} flex items-center justify-center shadow-lg`}>
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-full h-full flex items-center justify-center focus:outline-none">
                <span className="text-white font-bold text-lg">{rankInfo.abbrev}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="bg-slate-900 border-slate-700 text-white w-60">
              <div className="font-bold mb-1">{result.rank}</div>
              <p className="text-sm text-slate-300">{rankInfo.description}</p>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Total Score */}
      <div className="text-center mb-5 py-4 bg-white/5 rounded-xl">
        <div className="text-4xl font-bold text-white mb-1">{result.totalScore}</div>
        <div className="text-white/60 text-sm">out of 1000 points</div>
        <div className={`inline-block mt-2 px-4 py-1 rounded-full bg-gradient-to-r ${rankInfo.color} text-white text-sm font-semibold`}>
          {result.rank}
        </div>
      </div>

      {/* Score breakdown */}
      <div className="space-y-3">
        {scoreItems.map(score => {
          const percentage = (score.value / score.max) * 100;
          return (
            <div key={score.name}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="flex items-center gap-2 text-white/90">
                  <score.icon className="w-4 h-4" />
                  {score.name}
                </span>
                <span className="text-white font-mono font-medium">
                  {score.value}<span className="text-white/60">/{score.max}</span>
                </span>
              </div>
              <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${
                    percentage >= 70 ? 'from-emerald-500 to-emerald-400' :
                    percentage >= 40 ? 'from-amber-500 to-amber-400' :
                    'from-red-500 to-red-400'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Badges */}
      {result.badges && result.badges.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
          {result.badges.map(badge => (
            <Popover key={badge.id}>
              <PopoverTrigger asChild>
                <button 
                  className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs text-amber-400 flex items-center gap-1.5 hover:bg-amber-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <Star className="w-3 h-3" />
                  {badge.name}
                </button>
              </PopoverTrigger>
              <PopoverContent className="bg-slate-900 border-slate-700 text-white w-60">
                <div className="font-bold text-amber-400 mb-1 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  {badge.name}
                </div>
                <p className="text-sm text-slate-300">
                  {BADGE_DESCRIPTIONS[badge.name] || 'Awarded for exceptional gameplay.'}
                </p>
              </PopoverContent>
            </Popover>
          ))}
        </div>
      )}
    </div>
  );
};

const MetricAnalysis = ({ result }) => {
  // Calculate percentages for analysis
  const scores = {
    stability: Math.min(400, Math.max(0, result.scores?.stability || 0)),
    liquidity: Math.min(200, Math.max(0, result.scores?.liquidity || 0)),
    efficiency: Math.min(200, Math.max(0, result.scores?.efficiency || 0)),
    reputation: Math.min(200, Math.max(0, result.scores?.reputation || 0))
  };

  const stabilityPct = (scores.stability / 400) * 100;
  const liquidityPct = (scores.liquidity / 200) * 100;
  const efficiencyPct = (scores.efficiency / 200) * 100;
  const reputationPct = (scores.reputation / 200) * 100;
  
  const accuracy = result.totalDecisions > 0 
    ? Math.round((result.correctDecisions / result.totalDecisions) * 100) 
    : 0;

  const analyses = [
    {
      metric: 'Stability',
      score: scores.stability,
      max: 400,
      icon: Target,
      status: stabilityPct >= 60 ? 'good' : stabilityPct >= 30 ? 'moderate' : 'poor',
      analysis: stabilityPct >= 60 
        ? `Excellent price control! Final price $${result.finalPrice?.toFixed(2) || '100.00'} stayed close to the $100 target.`
        : stabilityPct >= 30
        ? `Moderate stability. Price drifted to $${result.finalPrice?.toFixed(2) || '100.00'}. Try to intervene earlier when price moves away from $100.`
        : `Price became unstable at $${result.finalPrice?.toFixed(2) || '100.00'}. Remember: ADD DEMAND when falling, ADD SUPPLY when rising.`,
      tip: stabilityPct < 60 ? 'React to price movements quickly but choose the RIGHT action based on direction.' : null
    },
    {
      metric: 'Efficiency',
      score: scores.efficiency,
      max: 200,
      icon: Zap,
      status: efficiencyPct >= 60 ? 'good' : efficiencyPct >= 30 ? 'moderate' : 'poor',
      analysis: efficiencyPct >= 60
        ? `Great decision-making! You made ${result.correctDecisions || 0}/${result.totalDecisions || 0} correct calls (${accuracy}% accuracy).`
        : efficiencyPct >= 30
        ? `${accuracy}% accuracy (${result.correctDecisions || 0}/${result.totalDecisions || 0} correct). Some decisions backfired or wasted resources.`
        : `Low accuracy at ${accuracy}%. Many actions were wrong for the situation, making the price worse.`,
      tip: efficiencyPct < 60 ? 'Match your action to the scenario: falling→demand, rising→supply, stable→nothing.' : null
    },
    {
      metric: 'Liquidity',
      score: scores.liquidity,
      max: 200,
      icon: TrendingUp,
      status: liquidityPct >= 60 ? 'good' : liquidityPct >= 30 ? 'moderate' : 'poor',
      analysis: liquidityPct >= 60
        ? 'Strong market liquidity maintained throughout all 12 rounds.'
        : liquidityPct >= 30
        ? 'Moderate liquidity. Some rounds had thin trading conditions.'
        : 'Liquidity was poor. Erratic decisions may have scared off market participants.',
      tip: liquidityPct < 60 ? 'Consistent, well-timed decisions build market confidence.' : null
    },
    {
      metric: 'Reputation',
      score: scores.reputation,
      max: 200,
      icon: Shield,
      status: reputationPct >= 60 ? 'good' : reputationPct >= 30 ? 'moderate' : 'poor',
      analysis: reputationPct >= 60
        ? 'Excellent reputation! Smooth trading with minimal volatility spikes.'
        : reputationPct >= 30
        ? 'Moderate reputation. Some volatile moments hurt your standing.'
        : 'Reputation suffered due to high volatility and poor price control.',
      tip: reputationPct < 60 ? 'Avoid wrong interventions that amplify price swings.' : null
    }
  ];

  const getStatusIcon = (status) => {
    switch(status) {
      case 'good': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'moderate': return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      default: return <XCircle className="w-5 h-5 text-red-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'good': return 'border-emerald-500/30 bg-emerald-500/5';
      case 'moderate': return 'border-amber-500/30 bg-amber-500/5';
      default: return 'border-red-500/30 bg-red-500/5';
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-cyan-400">{result.correctDecisions || 0}/{result.totalDecisions || 0}</div>
          <div className="text-xs text-white/60">Correct</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-emerald-400">${result.finalPrice?.toFixed(0) || '100'}</div>
          <div className="text-xs text-white/60">Final Price</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-amber-400">{5 - (result.greenshoesUsed || 0)}</div>
          <div className="text-xs text-white/60">Greenshoes</div>
        </div>
      </div>

      {/* Per-metric analysis */}
      {analyses.map((item, i) => (
        <div key={i} className={`p-4 rounded-xl border ${getStatusColor(item.status)}`}>
          <div className="flex items-start gap-3">
            {getStatusIcon(item.status)}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-white">{item.metric}</span>
                <span className="text-sm text-white/70">{item.score}/{item.max}</span>
              </div>
              <p className="text-sm text-white/90 mb-2">{item.analysis}</p>
              {item.tip && (
                <div className="flex items-start gap-2 mt-2 pt-2 border-t border-white/10">
                  <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-amber-400/80">{item.tip}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const BADGE_DESCRIPTIONS = {
  'Sharp Instincts': 'Achieved >80% decision accuracy. You read the market like a pro!',
  'Price Master': 'Kept the final price within $3 of the target. Precision stabilization.',
  'Budget Hawk': 'Maintained >40% of your stabilization budget. Efficiency expert.',
  'Reserved Power': 'Saved at least 1 Greenshoe option for emergencies. Strategic reserve.'
};

const ResultsScreen = ({ result, onReplay, onLearnMore }) => {
  const [activeTab, setActiveTab] = useState('score');
  const [shareStatus, setShareStatus] = useState(null);
  const navigate = useNavigate();
  
  // Calculate max possible scores for progress bars
  const MAX_SCORES = {
      stability: 400,
      liquidity: 200,
      efficiency: 200,
      reputation: 200
  };

  React.useEffect(() => {
    if (result.totalScore >= 700) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults, 
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults, 
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [result.totalScore]);

  const handleShare = async () => {
    const caption = LINKEDIN_CAPTION_TEMPLATE
      .replace('{score}', result.totalScore)
      .replace('{rank}', result.rank);

    // Find the score card element
    const scoreCardElement = document.getElementById('score-card-node');
    
    try {
      // Prioritize sharing logic
      // 1. Try to open LinkedIn URL immediately (popup blocker friendly)
      const shareUrl = window.location.origin + '/play/greenshoe';
      const linkedInUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(caption + ' ' + shareUrl)}`;
      
      // We open this FIRST if possible, but we want to download image too.
      // If we await image, popup might be blocked.
      // Strategy: Open window first, then do background work.
      const shareWindow = window.open(linkedInUrl, '_blank', 'width=600,height=600');
      
      // 2. Copy caption
      try {
         await navigator.clipboard.writeText(caption);
         setShareStatus('copied');
         setTimeout(() => setShareStatus(null), 3000);
      } catch (e) {
         console.error("Clipboard copy failed", e);
      }

      // 3. Try to download image (background task)
      if (scoreCardElement) {
        // Create canvas from the score card
        const canvas = await html2canvas(scoreCardElement, {
            backgroundColor: '#1a1a2e',
            scale: 2 // Higher quality
        });
        
        // Convert to blob and download
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `IB_Games_Scorecard_${result.totalScore}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
      }

      if (!shareWindow) {
         // If popup blocked, try to navigate or show message
         console.warn("Popup blocked");
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const handleHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a12] via-[#0d1020] to-[#0a0a12] px-4 py-6 overflow-y-auto">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-5">
          <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-white">Game Complete!</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-5 bg-white/5 rounded-lg p-1">
          {[
            { id: 'score', label: 'Score' },
            { id: 'analysis', label: 'Analysis' },
            { id: 'learn', label: 'Learn More' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 px-3 rounded-md font-medium text-sm transition-all ${
                activeTab === tab.id 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/50 hover:text-white/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'score' && <ScoreCard result={result} />}
        
        {activeTab === 'analysis' && <MetricAnalysis result={result} />}

        {activeTab === 'learn' && (
          <div className="space-y-4">
            <div className="bg-white/5 rounded-xl p-5">
              <h3 className="flex items-center gap-2 text-white font-semibold mb-4">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                Key Concepts You Practiced
              </h3>
              <ul className="space-y-3">
                {LEARNING_BULLETS.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={onLearnMore}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 text-left transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white/50 text-xs font-mono mb-1">REAL WORLD EXAMPLE</div>
                  <div className="text-white font-semibold">Alibaba's $25B IPO (2014)</div>
                  <div className="text-white/50 text-sm">See the greenshoe option in action</div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/70 transition-all" />
              </div>
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleShare}
              className="h-12 bg-[#0077b5] hover:bg-[#006097] text-white font-medium"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              onClick={onReplay}
              variant="outline"
              className="h-12 border-white/20 text-white hover:bg-white/5"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Replay
            </Button>
          </div>
          
          {shareStatus === 'copied' && (
            <div className="text-center text-emerald-400 text-sm">✓ Caption copied to clipboard!</div>
          )}
          
          <Button
            onClick={handleHome}
            variant="ghost"
            className="w-full h-12 text-white/50 hover:text-white hover:bg-white/5"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to IB.GAMES
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;
