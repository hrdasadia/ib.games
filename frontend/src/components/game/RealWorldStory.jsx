import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { REAL_WORLD_STORY, GLOSSARY } from '../../data/mockData';

const RealWorldStory = ({ onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showNuance, setShowNuance] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);

  const handleNext = () => {
    if (currentSlide < REAL_WORLD_STORY.slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const slide = REAL_WORLD_STORY.slides[currentSlide];

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#0a0a12] via-[#0d1020] to-[#0a0a12] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <button onClick={onClose} className="text-white/50 hover:text-white">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <div className="text-cyan-400 text-xs font-mono">REAL WORLD STORY</div>
          <div className="text-white font-semibold">{REAL_WORLD_STORY.title}</div>
        </div>
        <button 
          onClick={() => setShowGlossary(true)}
          className="text-white/50 hover:text-white"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Year badge */}
        <div className="mb-6">
          <span className="px-4 py-2 rounded-full bg-amber-500/20 text-amber-400 text-sm font-mono">
            {REAL_WORLD_STORY.year}
          </span>
        </div>

        {/* Stat display */}
        <div className="mb-8 text-center">
          <div className="text-6xl font-bold text-white mb-2 animate-pulse">
            {slide.stat}
          </div>
          <div className="text-white/50 text-sm">{slide.statLabel}</div>
        </div>

        {/* Headline */}
        <h2 className="text-2xl font-bold text-white text-center mb-4">
          {slide.headline}
        </h2>

        {/* Content */}
        <p className="text-white/70 text-center text-lg leading-relaxed max-w-sm mb-8">
          {slide.content}
        </p>

        {/* Progress */}
        <div className="flex gap-2 mb-6">
          {REAL_WORLD_STORY.slides.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === currentSlide ? 'bg-amber-400 w-8' : 'bg-white/20 w-4'
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            disabled={currentSlide === 0}
            className="w-12 h-12 rounded-full text-white/50 hover:text-white disabled:opacity-30"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            disabled={currentSlide === REAL_WORLD_STORY.slides.length - 1}
            className="w-12 h-12 rounded-full text-white/50 hover:text-white disabled:opacity-30"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Footer with nuance */}
      <div className="p-4 border-t border-white/10">
        {!showNuance ? (
          <button
            onClick={() => setShowNuance(true)}
            className="w-full text-center text-white/40 text-sm hover:text-white/60 transition-colors"
          >
            <Info className="w-4 h-4 inline mr-2" />
            It doesn't always work this way...
          </button>
        ) : (
          <div className="bg-white/5 rounded-lg p-4 animate-in fade-in slide-in-from-bottom-2">
            <h4 className="text-white font-semibold text-sm mb-2">
              {REAL_WORLD_STORY.nuance.title}
            </h4>
            <p className="text-white/60 text-sm">
              {REAL_WORLD_STORY.nuance.content}
            </p>
          </div>
        )}

        <div className="mt-4">
          <Button
            onClick={onClose}
            className="w-full h-12 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white font-semibold"
          >
            Back to Results
          </Button>
        </div>
      </div>

      {/* Glossary modal */}
      {showGlossary && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-end justify-center p-4">
          <div className="w-full max-w-md bg-[#1a1a2e] rounded-t-2xl max-h-[70vh] overflow-hidden animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-white font-bold">Glossary</h3>
              <button onClick={() => setShowGlossary(false)} className="text-white/50 hover:text-white">
                ×
              </button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto max-h-[50vh]">
              {GLOSSARY.map((item, i) => (
                <div key={i} className="pb-4 border-b border-white/10 last:border-0">
                  <h4 className="text-cyan-400 font-semibold mb-1">{item.term}</h4>
                  <p className="text-white/60 text-sm">{item.definition}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealWorldStory;
