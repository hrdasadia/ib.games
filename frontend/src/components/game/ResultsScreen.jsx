import React, { useState } from 'react';
import { 
  Trophy, RefreshCw, Share2, ChevronRight, BookOpen, Star, 
  TrendingUp, TrendingDown, Target, Shield, Zap, AlertTriangle,
  CheckCircle, Lightbulb, DollarSign, Clock
} from 'lucide-react';
import { Button } from '../ui/button';
import { LEARNING_BULLETS, LINKEDIN_CAPTION_TEMPLATE } from '../../data/mockData';

// Rank explanations
const RANK_INFO = {
  'Managing Director': { abbrev: 'MD', description: 'Top performer! Like a senior executive at a bank.', color: 'from-amber-400 to-yellow-500' },
  'Director': { abbrev: 'D', description: 'Excellent work! Senior leadership level.', color: 'from-purple-400 to-indigo-500' },
  'VP': { abbrev: 'VP', description: 'Great job! Vice President level performance.', color: 'from-cyan-400 to-blue-500' },
  'Associate': { abbrev: 'A', description: 'Good start! Mid-level banker performance.', color: 'from-emerald-400 to-green-500' },
  'Analyst': { abbrev: 'AN', description: 'Entry level. Keep practicing!', color: 'from-gray-400 to-slate-500' }
};

const ScoreCard = ({ result }) => {
  const rankInfo = RANK_INFO[result.rank];

  return (
    <div 
      id="score-card"
      className="bg-gradient-to-br from-[#0d1020] to-[#1a1a2e] rounded-2xl p-6 border border-white/10 w-full"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-cyan-400 text-sm font-mono mb-1">IB.GAMES</div>
          <h2 className="text-white text-xl font-bold">Greenshoe Sprint</h2>
        </div>
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${rankInfo.color} flex items-center justify-center shadow-lg`}>
          <span className="text-white font-bold text-lg">{rankInfo.abbrev}</span>
        </div>
      </div>

      {/* Score */}
      <div className="text-center mb-4">
        <div className="text-5xl font-bold text-white mb-1">{result.totalScore}</div>
        <div className="text-white/50 text-sm">out of 1000</div>
        <div className={`inline-block mt-2 px-4 py-1 rounded-full bg-gradient-to-r ${rankInfo.color} text-white text-sm font-semibold`}>
          {result.rank}
        </div>
        <div className="text-white/40 text-xs mt-1">{rankInfo.description}</div>
      </div>

      {/* Score breakdown */}
      <div className="space-y-2 mb-4">
        {[
          { name: 'Stability', value: Math.round(result.scores.stability), max: 400, icon: Target, tip: 'How close price stayed to $100' },
          { name: 'Liquidity', value: Math.round(result.scores.liquidity), max: 200, icon: TrendingUp, tip: 'Healthy trading volume' },
          { name: 'Efficiency', value: Math.round(result.scores.efficiency), max: 200, icon: Zap, tip: 'Smart use of your tools' },
          { name: 'Reputation', value: Math.round(result.scores.reputation), max: 200, icon: Shield, tip: 'Avoided wild swings' }
        ].map(score => (
          <div key={score.name} className="group">
            <div className="flex items-center gap-2">
              <score.icon className="w-4 h-4 text-white/40" />
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/70">{score.name}</span>
                  <span className="text-white font-mono">{score.value}/{score.max}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full"
                    style={{ width: `${(score.value / score.max) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="text-white/30 text-xs ml-6 mt-0.5">{score.tip}</div>
          </div>
        ))}
      </div>

      {/* Badges */}
      {result.badges && result.badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {result.badges.map(badge => (
            <div 
              key={badge.id}
              className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/70 flex items-center gap-1"
            >
              <Star className="w-3 h-3 text-yellow-400" />
              {badge.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PerformanceBreakdown = ({ result }) => {
  const insights = [];
  const improvements = [];

  // Calculate performance thresholds based on actual scores
  const stabilityPercent = (result.scores.stability / 400) * 100;
  const efficiencyPercent = (result.scores.efficiency / 200) * 100;
  const reputationPercent = (result.scores.reputation / 200) * 100;
  const liquidityPercent = (result.scores.liquidity / 200) * 100;

  const priceDeviation = Math.abs(result.finalPrice - 100);

  // === PRICE STABILITY ANALYSIS ===
  if (stabilityPercent >= 70) {
    insights.push({
      type: 'success',
      title: 'Strong Price Stability',
      message: `Final price $${result.finalPrice.toFixed(2)} — you kept it close to the $100 target.`,
      icon: CheckCircle
    });
  } else if (result.finalPrice > 108) {
    insights.push({
      type: 'warning',
      title: 'Price Ran Too High',
      message: `Final price $${result.finalPrice.toFixed(2)} — demand overheated beyond the target.`,
      icon: TrendingUp
    });
    improvements.push('Use greenshoes earlier when you see price climbing above $105 to release more shares and cool demand.');
  } else if (result.finalPrice < 95) {
    insights.push({
      type: 'warning',
      title: 'Price Dropped Too Low',
      message: `Final price $${result.finalPrice.toFixed(2)} — insufficient support during selloffs.`,
      icon: TrendingDown
    });
    improvements.push('Hold longer during price dips to provide buy support. Watch for the price turning red as your cue.');
  } else {
    insights.push({
      type: 'info',
      title: 'Price Stability',
      message: `Final price $${result.finalPrice.toFixed(2)} — moderate deviation from target.`,
      icon: Target
    });
    improvements.push('Try to keep price within $98-$102 for best stability scores.');
  }

  // === GREENSHOE ANALYSIS (Based on efficiency score) ===
  if (result.greenshoesUsed === 0) {
    insights.push({
      type: 'warning',
      title: 'Greenshoes Not Used',
      message: 'You didn\'t tap to use any greenshoe options during the run.',
      icon: AlertTriangle
    });
    improvements.push('TAP when price spikes above $105 to release extra shares. This cools overheating demand.');
  } else if (efficiencyPercent >= 60) {
    insights.push({
      type: 'success',
      title: 'Well-Timed Greenshoes',
      message: `Used ${result.greenshoesUsed}/3 greenshoes at good moments to manage supply.`,
      icon: CheckCircle
    });
  } else if (efficiencyPercent >= 30) {
    insights.push({
      type: 'info',
      title: 'Greenshoe Timing Could Improve',
      message: `Used ${result.greenshoesUsed}/3 greenshoes, but timing wasn't optimal.`,
      icon: Clock
    });
    improvements.push('Greenshoes work best when price is spiking above $105. Using them when price is stable or low wastes their effect.');
  } else {
    insights.push({
      type: 'warning',
      title: 'Poor Greenshoe Timing',
      message: `Used ${result.greenshoesUsed}/3 greenshoes at suboptimal times — low efficiency score.`,
      icon: AlertTriangle
    });
    improvements.push('Don\'t panic-tap greenshoes. Wait for clear demand surges (price >$105) before releasing extra shares.');
  }

  // === BUDGET USAGE ANALYSIS ===
  const budgetUsed = 100 - result.budgetRemaining;
  if (budgetUsed < 20 && result.finalPrice < 98) {
    insights.push({
      type: 'warning',
      title: 'Stabilization Underused',
      message: `Only used ${budgetUsed.toFixed(0)}% of budget while price was falling.`,
      icon: DollarSign
    });
    improvements.push('HOLD the screen longer when price drops below $98. Your buy support pushes the price back up.');
  } else if (budgetUsed > 80 && result.budgetRemaining < 20) {
    insights.push({
      type: 'info',
      title: 'Heavy Stabilization',
      message: `Used ${budgetUsed.toFixed(0)}% of your budget — you were very active.`,
      icon: Shield
    });
    if (stabilityPercent < 50) {
      improvements.push('You spent a lot on stabilization but price still drifted. Try combining holds with greenshoes for better effect.');
    }
  } else if (result.budgetRemaining > 40 && stabilityPercent >= 60) {
    insights.push({
      type: 'success',
      title: 'Efficient Budget Use',
      message: `${result.budgetRemaining.toFixed(0)}% budget remaining — balanced intervention.`,
      icon: CheckCircle
    });
  }

  // === VOLATILITY ANALYSIS ===
  if (result.maxVolatility > 0.15) {
    insights.push({
      type: 'warning',
      title: 'High Volatility Periods',
      message: 'Market got very choppy during your run, hurting reputation.',
      icon: AlertTriangle
    });
    improvements.push('React faster to demand surges. When volatility spikes (indicator turns red), immediately stabilize or use greenshoe.');
  } else if (reputationPercent >= 70) {
    insights.push({
      type: 'success',
      title: 'Smooth Trading',
      message: 'You kept volatility under control — good for reputation.',
      icon: CheckCircle
    });
  }

  return (
    <div className="space-y-4">
      {/* What Happened */}
      <div className="space-y-3">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          What Happened
        </h3>
        
        {insights.map((insight, i) => (
          <div 
            key={i}
            className={`p-4 rounded-xl border ${
              insight.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20' :
              insight.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20' :
              'bg-white/5 border-white/10'
            }`}
          >
            <div className="flex items-start gap-3">
              <insight.icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                insight.type === 'success' ? 'text-emerald-400' :
                insight.type === 'warning' ? 'text-amber-400' :
                'text-cyan-400'
              }`} />
              <div>
                <div className="text-white font-medium text-sm">{insight.title}</div>
                <div className="text-white/60 text-sm mt-0.5">{insight.message}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* How to Improve */}
      {improvements.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            How to Improve
          </h3>
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-xl p-4 border border-amber-500/20">
            <ul className="space-y-3">
              {improvements.map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-white/80">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

const ResultsScreen = ({ result, onReplay, onShare, onLearnMore }) => {
  const [activeTab, setActiveTab] = useState('score');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [shareStatus, setShareStatus] = useState(null);

  const handleShare = async () => {
    setIsGeneratingImage(true);
    setShareStatus(null);
    
    const caption = LINKEDIN_CAPTION_TEMPLATE
      .replace('{score}', result.totalScore)
      .replace('{rank}', result.rank);

    // Copy caption to clipboard first
    try {
      await navigator.clipboard.writeText(caption);
      setShareStatus('copied');
    } catch (err) {
      console.log('Clipboard failed');
    }

    // Try Web Share API (works on mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Greenshoe Sprint - IB.GAMES',
          text: caption,
          url: window.location.origin + '/play/greenshoe'
        });
        setIsGeneratingImage(false);
        return;
      } catch (err) {
        console.log('Web Share cancelled/failed, opening LinkedIn');
      }
    }

    // Open LinkedIn share page
    const shareUrl = window.location.origin + '/play/greenshoe';
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=600,scrollbars=yes');
    
    if (onShare) onShare({ caption, method: 'linkedin' });
    setIsGeneratingImage(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a12] via-[#0d1020] to-[#0a0a12] px-4 py-6 overflow-y-auto">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <Trophy className="w-10 h-10 text-yellow-400 mx-auto mb-2" />
          <h1 className="text-xl font-bold text-white">Run Complete!</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {[
            { id: 'score', label: 'Score' },
            { id: 'breakdown', label: 'What Happened' },
            { id: 'learn', label: 'Learn' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                activeTab === tab.id 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/50 hover:text-white/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Score Tab */}
        {activeTab === 'score' && (
          <div className="space-y-4">
            <ScoreCard result={result} />

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-cyan-400">${result.finalPrice.toFixed(0)}</div>
                <div className="text-xs text-white/50">Final Price</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-emerald-400">{result.greenshoesUsed}/3</div>
                <div className="text-xs text-white/50">Greenshoes</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-amber-400">{result.budgetRemaining.toFixed(0)}%</div>
                <div className="text-xs text-white/50">Budget Left</div>
              </div>
            </div>
          </div>
        )}

        {/* Breakdown Tab */}
        {activeTab === 'breakdown' && (
          <PerformanceBreakdown result={result} />
        )}

        {/* Learn Tab */}
        {activeTab === 'learn' && (
          <div className="space-y-4">
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="flex items-center gap-2 text-white font-semibold mb-3">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                Key Takeaways
              </h3>
              <ul className="space-y-2">
                {LEARNING_BULLETS.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={onLearnMore}
              className="w-full bg-gradient-to-r from-white/5 to-white/10 hover:from-white/10 hover:to-white/15 rounded-xl p-4 text-left transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white/50 text-xs font-mono mb-1">REAL WORLD STORY</div>
                  <div className="text-white font-semibold">Alibaba's $25B IPO</div>
                  <div className="text-white/50 text-sm">See this in action</div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/70 group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <Button
            onClick={handleShare}
            disabled={isGeneratingImage}
            className="w-full h-12 bg-[#0077b5] hover:bg-[#006097] text-white font-semibold"
          >
            <Share2 className="w-5 h-5 mr-2" />
            {isGeneratingImage ? 'Preparing...' : 'Share on LinkedIn'}
          </Button>
          
          {shareStatus === 'copied' && (
            <div className="text-center text-emerald-400 text-sm">✓ Caption copied! Paste it in LinkedIn.</div>
          )}
          
          <Button
            variant="outline"
            onClick={onReplay}
            className="w-full h-12 border-white/20 text-white hover:bg-white/5"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Play Again
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;
