import React, { useState } from 'react';
import { Briefcase, Shield, Zap, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { TUTORIAL_SLIDES } from '../../data/mockData';

const iconMap = {
  briefcase: Briefcase,
  shield: Shield,
  zap: Zap
};

const TutorialOverlay = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNext = () => {
    if (isAnimating) return;
    
    if (currentSlide < TUTORIAL_SLIDES.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide(prev => prev + 1);
        setIsAnimating(false);
      }, 200);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (isAnimating || currentSlide === 0) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlide(prev => prev - 1);
      setIsAnimating(false);
    }, 200);
  };

  const slide = TUTORIAL_SLIDES[currentSlide];
  const IconComponent = iconMap[slide.icon] || Briefcase;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#0a0a12] via-[#0d1020] to-[#0a0a12] flex flex-col items-center justify-center p-6">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className={`relative z-10 max-w-sm w-full transition-all duration-200 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <IconComponent className="w-12 h-12 text-cyan-400" strokeWidth={1.5} />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white text-center mb-4">
          {slide.title}
        </h2>

        {/* Description */}
        <p className="text-white/70 text-center text-lg leading-relaxed mb-8">
          {slide.description}
        </p>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {TUTORIAL_SLIDES.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === currentSlide 
                  ? 'bg-cyan-400 w-6' 
                  : i < currentSlide 
                    ? 'bg-cyan-400/50' 
                    : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="lg"
            onClick={handlePrev}
            disabled={currentSlide === 0}
            className="flex-1 h-14 text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          
          <Button
            size="lg"
            onClick={handleNext}
            className="flex-1 h-14 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white font-semibold shadow-lg shadow-cyan-500/25"
          >
            {currentSlide === TUTORIAL_SLIDES.length - 1 ? (
              <>Start Game<Zap className="w-5 h-5 ml-2" /></>
            ) : (
              <>Next<ChevronRight className="w-5 h-5 ml-2" /></>
            )}
          </Button>
        </div>
      </div>

      {/* Skip button */}
      <button
        onClick={onComplete}
        className="absolute top-6 right-6 text-white/40 hover:text-white/70 text-sm font-mono transition-colors"
      >
        Skip →
      </button>
    </div>
  );
};

export default TutorialOverlay;
