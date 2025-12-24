import React, { useState, useEffect } from 'react';
import { Play, ChevronRight, SkipForward } from 'lucide-react';
import { Button } from '../ui/button';

const AnimatedExplainer = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  const steps = [
    {
      title: "A Company Goes Public",
      description: "Today, a tech company is launching its IPO — selling shares to the public for the first time at $100 per share.",
      visual: "ipo",
      duration: 4000
    },
    {
      title: "The Problem",
      description: "On day one, the stock price can swing wildly. If it crashes, investors lose money. If it spikes too high, regulators get suspicious.",
      visual: "volatility",
      duration: 4500
    },
    {
      title: "You're the Stabilizer",
      description: "As the lead underwriter, you have two powerful tools to keep the price stable around $100.",
      visual: "role",
      duration: 3500
    },
    {
      title: "Tool #1: Buy Support",
      description: "HOLD the screen to buy shares when the price drops. This creates demand and pushes the price back up. But you have limited budget.",
      visual: "stabilize",
      duration: 4500
    },
    {
      title: "Tool #2: Greenshoe Option",
      description: "TAP to release extra shares when demand is too hot. This increases supply and cools down an overheating price. You have 3 uses.",
      visual: "greenshoe",
      duration: 4500
    },
    {
      title: "The Order Book",
      description: "Different investors react differently. Retail = regular people. Long-Only = patient funds. Hedge = fast traders. Momentum = trend followers.",
      visual: "orderbook",
      duration: 5000
    },
    {
      title: "Your Goal",
      description: "Keep the price stable near $100 for 90 seconds across 3 market phases. Use your tools wisely!",
      visual: "goal",
      duration: 3500
    }
  ];

  useEffect(() => {
    if (!isAnimating) return;
    
    const timer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setIsAnimating(false);
      }
    }, steps[currentStep].duration);

    return () => clearTimeout(timer);
  }, [currentStep, isAnimating, steps]);

  const step = steps[currentStep];

  const renderVisual = (type) => {
    switch (type) {
      case 'ipo':
        return (
          <div className="relative w-48 h-48">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center animate-pulse shadow-lg shadow-cyan-500/30">
                <span className="text-white text-3xl font-bold">$100</span>
              </div>
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-12 bg-gradient-to-b from-cyan-400 to-transparent" />
            <svg className="absolute inset-0 w-full h-full animate-spin-slow" style={{animationDuration: '8s'}}>
              <circle cx="96" cy="96" r="80" fill="none" stroke="rgba(0,255,170,0.2)" strokeWidth="2" strokeDasharray="10 5" />
            </svg>
          </div>
        );
      
      case 'volatility':
        return (
          <div className="w-64 h-32 relative">
            <svg viewBox="0 0 200 80" className="w-full h-full">
              <path
                d="M0,40 L20,35 L40,55 L60,20 L80,60 L100,25 L120,50 L140,15 L160,55 L180,30 L200,45"
                fill="none"
                stroke="#ff4444"
                strokeWidth="3"
                className="animate-draw"
              />
              <line x1="0" y1="40" x2="200" y2="40" stroke="rgba(255,255,255,0.2)" strokeDasharray="5 5" />
              <text x="100" y="75" textAnchor="middle" fill="#888" fontSize="10">Wild swings = Bad</text>
            </svg>
          </div>
        );
      
      case 'role':
        return (
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
              <span className="text-2xl">👔</span>
            </div>
            <div className="text-left">
              <div className="text-white font-bold">Lead Underwriter</div>
              <div className="text-white/50 text-sm">Price Stabilization Expert</div>
            </div>
          </div>
        );
      
      case 'stabilize':
        return (
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-blue-500/20 border-4 border-blue-400 flex items-center justify-center animate-pulse">
                <span className="text-blue-400 text-sm font-bold">HOLD</span>
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-blue-500 rounded text-xs text-white">Buy Support</div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-red-400">$95</span>
              <span className="text-white">→</span>
              <span className="text-green-400">$100</span>
            </div>
          </div>
        );
      
      case 'greenshoe':
        return (
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-4 border-emerald-400 flex items-center justify-center">
                <span className="text-emerald-400 text-sm font-bold">TAP</span>
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-emerald-500 rounded text-xs text-white">Add Supply</div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-red-400">$115</span>
              <span className="text-white">→</span>
              <span className="text-green-400">$100</span>
            </div>
            <div className="flex gap-1">
              {[1,2,3].map(i => (
                <div key={i} className="w-3 h-3 rounded-full bg-emerald-400" />
              ))}
              <span className="text-white/50 text-xs ml-2">× 3 uses</span>
            </div>
          </div>
        );
      
      case 'orderbook':
        return (
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { name: 'Retail', color: 'bg-blue-500', desc: 'Regular investors' },
              { name: 'Long-Only', color: 'bg-emerald-500', desc: 'Patient funds' },
              { name: 'Hedge', color: 'bg-amber-500', desc: 'Fast traders' },
              { name: 'Momentum', color: 'bg-pink-500', desc: 'Trend followers' }
            ].map(item => (
              <div key={item.name} className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
                <div className={`w-3 h-8 rounded ${item.color}`} />
                <div>
                  <div className="text-white font-medium text-xs">{item.name}</div>
                  <div className="text-white/40 text-xs">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'goal':
        return (
          <div className="text-center">
            <div className="text-6xl font-bold text-white mb-2">$100</div>
            <div className="w-48 h-2 bg-white/10 rounded-full mx-auto mb-4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 w-3/4 rounded-full" />
            </div>
            <div className="text-white/50">Keep it stable for 90 seconds</div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#0a0a12] via-[#0d1020] to-[#0a0a12] flex flex-col">
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
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Step indicator */}
        <div className="text-cyan-400/50 text-xs font-mono mb-8">
          {currentStep + 1} / {steps.length}
        </div>

        {/* Visual */}
        <div className="mb-8 h-48 flex items-center justify-center">
          {renderVisual(step.visual)}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white text-center mb-4 animate-fade-in" key={`title-${currentStep}`}>
          {step.title}
        </h2>

        {/* Description */}
        <p className="text-white/70 text-center text-lg leading-relaxed max-w-sm animate-fade-in" key={`desc-${currentStep}`}>
          {step.description}
        </p>
      </div>

      {/* Navigation */}
      <div className="p-6">
        {!isAnimating ? (
          <Button
            onClick={onComplete}
            size="lg"
            className="w-full h-14 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white font-bold text-lg shadow-lg shadow-cyan-500/25"
          >
            <Play className="w-5 h-5 mr-2 fill-current" />
            Start Playing
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => currentStep > 0 && setCurrentStep(prev => prev - 1)}
              disabled={currentStep === 0}
              className="flex-1 h-12 text-white/50 hover:text-white disabled:opacity-30"
            >
              Back
            </Button>
            <Button
              onClick={() => {
                if (currentStep < steps.length - 1) {
                  setCurrentStep(prev => prev + 1);
                } else {
                  setIsAnimating(false);
                }
              }}
              className="flex-1 h-12 bg-white/10 hover:bg-white/20 text-white"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimatedExplainer;
