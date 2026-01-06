import React, { useState, useEffect } from 'react';
import { Play, ChevronRight, ChevronLeft, SkipForward } from 'lucide-react';
import { Button } from '../ui/button';

const AnimatedExplainer = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Greenshoe Sprint",
      description: "You're the lead underwriter for a company going public (IPO). Your job: keep the stock price stable at $100.",
      visual: "intro",
      icon: "🏦"
    },
    {
      title: "The Challenge",
      description: "On IPO day, the stock price can swing wildly. If it crashes, investors lose money. If it spikes too high, it looks like you priced it wrong.",
      visual: "challenge",
      icon: "📊"
    },
    {
      title: "How to Play",
      description: "You'll face 12 market scenarios. Each round, you have 5 seconds to choose one of three actions based on what's happening to the price.",
      visual: "howto",
      icon: "🎮"
    },
    {
      title: "When Price is FALLING 📉",
      description: "Choose ADD DEMAND (🛡️). This means you're buying shares to create demand and push the price back up. Uses your stabilization budget.",
      visual: "falling",
      icon: "🛡️"
    },
    {
      title: "When Price is RISING 📈",
      description: "Choose ADD SUPPLY (📈). This activates the GREENSHOE OPTION — releasing extra shares to increase supply and cool down the price. You have 3 uses.",
      visual: "rising",
      icon: "📈"
    },
    {
      title: "What is a Greenshoe Option?",
      description: "A greenshoe (or 'overallotment option') lets underwriters sell up to 15% more shares than planned. It's named after Green Shoe Manufacturing Co., the first company to use it in 1963.",
      visual: "greenshoe",
      icon: "👟"
    },
    {
      title: "When Price is STABLE ⚖️",
      description: "Choose DO NOTHING (⏸️). If the market is balanced, intervening wastes your limited resources. Sometimes the best move is no move!",
      visual: "stable",
      icon: "⏸️"
    },
    {
      title: "Scoring",
      description: "Correct decisions stabilize the price. Wrong decisions make things worse! Your final score depends on decision accuracy and how close the price stays to $100.",
      visual: "scoring",
      icon: "🏆"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const step = steps[currentStep];

  const renderVisual = (type) => {
    switch (type) {
      case 'intro':
        return (
          <div className="flex flex-col items-center">
            <div className="text-6xl mb-4">🏦</div>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500/30 to-emerald-500/30 flex items-center justify-center border border-cyan-500/50">
                <span className="text-2xl font-bold text-cyan-400">$100</span>
              </div>
              <span className="text-white/50">Target Price</span>
            </div>
          </div>
        );
      
      case 'challenge':
        return (
          <div className="w-64 h-24 relative">
            <svg viewBox="0 0 200 60" className="w-full h-full">
              <path
                d="M0,30 L20,35 L40,15 L60,45 L80,20 L100,40 L120,25 L140,50 L160,20 L180,35 L200,30"
                fill="none"
                stroke="#ff6644"
                strokeWidth="3"
              />
              <line x1="0" y1="30" x2="200" y2="30" stroke="rgba(0,255,170,0.3)" strokeDasharray="5 5" />
              <text x="100" y="55" textAnchor="middle" fill="#ccc" fontSize="10">Wild price swings = Bad</text>
            </svg>
          </div>
        );
      
      case 'howto':
        return (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-xl text-white">12</div>
              <span className="text-white/90">Rounds</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-xl text-white">5s</div>
              <span className="text-white/90">Per Decision</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-xl text-white">3</div>
              <span className="text-white/90">Choices Each Round</span>
            </div>
          </div>
        );
      
      case 'falling':
        return (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-4">
              <div className="text-3xl text-red-400">📉</div>
              <div className="text-2xl">→</div>
              <div className="w-20 h-20 rounded-xl bg-blue-500/20 border-2 border-blue-500 flex flex-col items-center justify-center">
                <span className="text-2xl">🛡️</span>
                <span className="text-xs text-blue-400 mt-1">ADD DEMAND</span>
              </div>
            </div>
            <div className="text-sm text-white/80">Buy shares to push price UP</div>
          </div>
        );
      
      case 'rising':
        return (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-4">
              <div className="text-3xl text-orange-400">📈</div>
              <div className="text-2xl">→</div>
              <div className="w-20 h-20 rounded-xl bg-emerald-500/20 border-2 border-emerald-500 flex flex-col items-center justify-center">
                <span className="text-2xl">📈</span>
                <span className="text-xs text-emerald-400 mt-1">ADD SUPPLY</span>
              </div>
            </div>
            <div className="text-sm text-white/80">Release shares to push price DOWN</div>
          </div>
        );
      
      case 'greenshoe':
        return (
          <div className="flex flex-col items-center gap-4">
            <div className="text-5xl">👟</div>
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 max-w-xs">
              <div className="text-emerald-400 font-bold text-sm mb-1">Strategic Tool</div>
              <div className="text-white/90 text-xs leading-relaxed">
                Use this to create a supply "buffer" and cool down overheating prices.
              </div>
            </div>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-emerald-500/20">
                  {i}
                </div>
              ))}
            </div>
            <div className="text-sm font-bold text-emerald-400">You have 5 greenshoe uses</div>
          </div>
        );
      
      case 'stable':
        return (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-4">
              <div className="text-3xl text-gray-400">⚖️</div>
              <div className="text-2xl">→</div>
              <div className="w-20 h-20 rounded-xl bg-gray-500/20 border-2 border-gray-500 flex flex-col items-center justify-center">
                <span className="text-2xl">⏸️</span>
                <span className="text-xs text-gray-400 mt-1">DO NOTHING</span>
              </div>
            </div>
            <div className="text-sm text-white/80">Save resources for when you need them!</div>
          </div>
        );
      
      case 'scoring':
        return (
          <div className="flex flex-col items-center gap-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-center">
                <div className="text-emerald-400 font-bold">✓ Correct</div>
                <div className="text-white/80 text-xs mt-1">Price stabilizes</div>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
                <div className="text-red-400 font-bold">✗ Wrong</div>
                <div className="text-white/80 text-xs mt-1">Price gets worse</div>
              </div>
            </div>
            <div className="text-white/80 text-xs mt-2">
              Goal: Keep price close to $100 with high accuracy
            </div>
          </div>
        );
      
      default:
        return <div className="text-6xl">{step.icon}</div>;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-b from-[#0a0a12] via-[#0d1020] to-[#0a0a12] flex flex-col">
      {/* Skip button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onSkip}
          className="flex items-center gap-1 text-white/40 hover:text-white/70 text-sm font-mono transition-colors"
        >
          Skip <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
        <div 
          className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 pt-12">
        {/* Step indicator */}
        <div className="text-white/80 text-xs font-mono mb-6">
          {currentStep + 1} / {steps.length}
        </div>

        {/* Visual */}
        <div className="mb-8 h-40 flex items-center justify-center">
          {renderVisual(step.visual)}
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-white text-center mb-4">
          {step.title}
        </h2>

        {/* Description */}
        <p className="text-white/90 text-center text-base leading-relaxed max-w-sm mb-6">
          {step.description}
        </p>

        {/* Progress dots */}
        <div className="flex gap-1.5 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentStep 
                  ? 'bg-cyan-400 w-6' 
                  : i < currentStep 
                    ? 'bg-cyan-400/50 w-1.5' 
                    : 'bg-white/20 w-1.5'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="p-6 pt-0">
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex-1 h-12 text-white/50 hover:text-white disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </Button>
          
          <Button
            onClick={handleNext}
            className="flex-1 h-12 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white font-semibold"
          >
            {currentStep === steps.length - 1 ? (
              <>
                <Play className="w-5 h-5 mr-2 fill-current" />
                Start Game
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-5 h-5 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnimatedExplainer;
