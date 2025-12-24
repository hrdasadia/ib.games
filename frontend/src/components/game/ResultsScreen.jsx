import React, { useState, useRef, useEffect } from 'react';
import { Trophy, RefreshCw, Share2, ChevronRight, BookOpen, Star, Zap, Target, Shield, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { SCORING_CONFIG, LEARNING_BULLETS, LINKEDIN_CAPTION_TEMPLATE } from '../../data/mockData';
import html2canvas from 'html2canvas';

const ScoreCard = ({ result, forExport = false }) => {
  const getRankColor = (rank) => {
    switch (rank) {
      case 'Managing Director': return 'from-amber-400 to-yellow-500';
      case 'Director': return 'from-purple-400 to-indigo-500';
      case 'VP': return 'from-cyan-400 to-blue-500';
      case 'Associate': return 'from-emerald-400 to-green-500';
      default: return 'from-gray-400 to-slate-500';
    }
  };

  const rankAbbrev = {
    'Managing Director': 'MD',
    'Director': 'D',
    'VP': 'VP',
    'Associate': 'A',
    'Analyst': 'AN'
  };

  return (
    <div 
      id="score-card"
      className={`bg-gradient-to-br from-[#0d1020] to-[#1a1a2e] rounded-2xl p-6 border border-white/10 ${forExport ? 'w-[400px]' : 'w-full'}`}
      style={forExport ? { padding: '24px', fontFamily: 'system-ui, sans-serif' } : {}}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="text-cyan-400 text-sm font-mono mb-1">IB.GAMES</div>
          <h2 className="text-white text-xl font-bold">Greenshoe Sprint</h2>
        </div>
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getRankColor(result.rank)} flex items-center justify-center shadow-lg`}>
          <span className="text-white font-bold text-lg">{rankAbbrev[result.rank]}</span>
        </div>
      </div>

      {/* Score */}
      <div className="text-center mb-6">
        <div className="text-5xl font-bold text-white mb-2">{result.totalScore}</div>
        <div className="text-white/50 text-sm">out of 1000</div>
        <div className={`inline-block mt-2 px-4 py-1 rounded-full bg-gradient-to-r ${getRankColor(result.rank)} text-white text-sm font-semibold`}>
          {result.rank}
        </div>
      </div>

      {/* Score breakdown */}
      <div className="space-y-3 mb-6">
        {[
          { name: 'Stability', value: Math.round(result.scores.stability), max: 400, icon: Target },
          { name: 'Liquidity', value: Math.round(result.scores.liquidity), max: 200, icon: TrendingUp },
          { name: 'Efficiency', value: Math.round(result.scores.efficiency), max: 200, icon: Zap },
          { name: 'Reputation', value: Math.round(result.scores.reputation), max: 200, icon: Shield }
        ].map(score => (
          <div key={score.name} className="flex items-center gap-3">
            <score.icon className="w-4 h-4 text-white/40" />
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white/70">{score.name}</span>
                <span className="text-white font-mono">{score.value}/{score.max}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-1000"
                  style={{ width: `${(score.value / score.max) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Badges */}
      {result.badges.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
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

      {/* Footer */}
      {forExport && (
        <div className="text-center pt-4 border-t border-white/10">
          <div className="text-white/40 text-xs">Play at ibgames.app</div>
        </div>
      )}
    </div>
  );
};

const ResultsScreen = ({ result, onReplay, onShare, onLearnMore }) => {
  const [activeTab, setActiveTab] = useState('score');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const scoreCardRef = useRef(null);

  const generateShareImage = async () => {
    setIsGeneratingImage(true);
    try {
      // Create a hidden container for export
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.innerHTML = document.getElementById('score-card').outerHTML;
      document.body.appendChild(container);

      const canvas = await html2canvas(container.firstChild, {
        backgroundColor: '#0a0a12',
        scale: 2
      });
      
      document.body.removeChild(container);

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      return blob;
    } catch (error) {
      console.error('Error generating image:', error);
      return null;
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleShare = async () => {
    const caption = LINKEDIN_CAPTION_TEMPLATE
      .replace('{score}', result.totalScore)
      .replace('{rank}', result.rank);

    // Try Web Share API first
    if (navigator.share) {
      try {
        const imageBlob = await generateShareImage();
        const file = imageBlob ? new File([imageBlob], 'greenshoe-score.png', { type: 'image/png' }) : null;
        
        await navigator.share({
          title: 'Greenshoe Sprint - IB.GAMES',
          text: caption,
          ...(file && { files: [file] })
        });
        return;
      } catch (err) {
        console.log('Web Share failed, using fallback');
      }
    }

    // Fallback: Copy caption and open LinkedIn
    try {
      await navigator.clipboard.writeText(caption);
      const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
      window.open(linkedInUrl, '_blank');
      if (onShare) onShare({ caption, method: 'linkedin' });
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a12] via-[#0d1020] to-[#0a0a12] px-4 py-8 overflow-y-auto">
      {/* Confetti effect area */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-white">Run Complete!</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['score', 'learn'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                activeTab === tab 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/50 hover:text-white/70'
              }`}
            >
              {tab === 'score' ? 'Your Score' : 'What You Learned'}
            </button>
          ))}
        </div>

        {/* Score Tab */}
        {activeTab === 'score' && (
          <div className="space-y-6">
            <ScoreCard result={result} />

            {/* Key stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-cyan-400">${result.finalPrice.toFixed(0)}</div>
                <div className="text-xs text-white/50">Final Price</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400">{result.greenshoesUsed}/3</div>
                <div className="text-xs text-white/50">Greenshoes</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-amber-400">{result.budgetRemaining.toFixed(0)}%</div>
                <div className="text-xs text-white/50">Budget Left</div>
              </div>
            </div>
          </div>
        )}

        {/* Learn Tab */}
        {activeTab === 'learn' && (
          <div className="space-y-6">
            {/* What you learned */}
            <div className="bg-white/5 rounded-xl p-5">
              <h3 className="flex items-center gap-2 text-white font-semibold mb-4">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                What You Just Did
              </h3>
              <ul className="space-y-3">
                {LEARNING_BULLETS.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>

            {/* Real world connection */}
            <button
              onClick={onLearnMore}
              className="w-full bg-gradient-to-r from-white/5 to-white/10 hover:from-white/10 hover:to-white/15 rounded-xl p-5 text-left transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white/50 text-xs font-mono mb-1">REAL WORLD STORY</div>
                  <div className="text-white font-semibold">Alibaba's $25B IPO</div>
                  <div className="text-white/50 text-sm">See how this worked in 2014</div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/70 group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-8 space-y-3">
          <Button
            onClick={handleShare}
            disabled={isGeneratingImage}
            className="w-full h-14 bg-[#0077b5] hover:bg-[#006097] text-white font-semibold shadow-lg"
          >
            <Share2 className="w-5 h-5 mr-2" />
            {isGeneratingImage ? 'Generating...' : 'Share on LinkedIn'}
          </Button>
          
          <Button
            variant="outline"
            onClick={onReplay}
            className="w-full h-14 border-white/20 text-white hover:bg-white/5"
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
