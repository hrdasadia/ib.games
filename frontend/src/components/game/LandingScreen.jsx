import React from 'react';
import { Play, TrendingUp, Zap, BookOpen, Volume2, VolumeX, Eye, EyeOff, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';

const LandingScreen = ({ onStart, accessibilitySettings, onSettingsChange }) => {
  const [showSettings, setShowSettings] = React.useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a12] via-[#0d1020] to-[#0a0a12] flex flex-col">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a3a5a" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        {/* Glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Settings button */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="absolute top-16 right-4 z-30 w-72 bg-[#1a1a2e] rounded-xl border border-white/10 p-4 shadow-xl animate-in fade-in slide-in-from-top-2">
          <h3 className="text-white font-semibold mb-4">Accessibility</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-white/50" />
                <span className="text-sm text-white/70">Reduce Motion</span>
              </div>
              <Switch
                checked={accessibilitySettings?.reduceMotion || false}
                onCheckedChange={(v) => onSettingsChange?.({ ...accessibilitySettings, reduceMotion: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-white/50" />
                <span className="text-sm text-white/70">Color Blind Mode</span>
              </div>
              <Switch
                checked={accessibilitySettings?.colorBlind || false}
                onCheckedChange={(v) => onSettingsChange?.({ ...accessibilitySettings, colorBlind: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <VolumeX className="w-4 h-4 text-white/50" />
                <span className="text-sm text-white/70">Mute Audio</span>
              </div>
              <Switch
                checked={accessibilitySettings?.muteAudio || false}
                onCheckedChange={(v) => onSettingsChange?.({ ...accessibilitySettings, muteAudio: v })}
              />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo / Brand */}
        <div className="mb-2">
          <span className="text-xs font-mono text-cyan-400/70 tracking-widest">IB.GAMES</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-bold text-white text-center mb-3">
          <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Greenshoe
          </span>
          <br />
          <span className="text-white">Sprint</span>
        </h1>

        {/* Tagline */}
        <p className="text-white/60 text-lg text-center mb-8">
          Stabilize the IPO
        </p>

        {/* Hero graphic - stylized chart */}
        <div className="w-full max-w-xs h-32 mb-10 relative">
          <svg viewBox="0 0 300 100" className="w-full h-full">
            {/* Grid */}
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00ffaa" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#00aaff" stopOpacity="1" />
              </linearGradient>
              <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00ffaa" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#00ffaa" stopOpacity="0" />
              </linearGradient>
            </defs>
            
            {/* Area fill */}
            <path
              d="M0,60 Q30,65 60,50 T120,55 T180,35 T240,40 T300,30 L300,100 L0,100 Z"
              fill="url(#areaGrad)"
            />
            
            {/* Main line */}
            <path
              d="M0,60 Q30,65 60,50 T120,55 T180,35 T240,40 T300,30"
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth="3"
              strokeLinecap="round"
            >
              <animate
                attributeName="d"
                values="M0,60 Q30,65 60,50 T120,55 T180,35 T240,40 T300,30;
                        M0,55 Q30,60 60,55 T120,45 T180,40 T240,35 T300,35;
                        M0,60 Q30,65 60,50 T120,55 T180,35 T240,40 T300,30"
                dur="4s"
                repeatCount="indefinite"
              />
            </path>
            
            {/* Glow */}
            <path
              d="M0,60 Q30,65 60,50 T120,55 T180,35 T240,40 T300,30"
              fill="none"
              stroke="#00ffaa"
              strokeWidth="8"
              strokeLinecap="round"
              opacity="0.2"
              filter="blur(8px)"
            >
              <animate
                attributeName="d"
                values="M0,60 Q30,65 60,50 T120,55 T180,35 T240,40 T300,30;
                        M0,55 Q30,60 60,55 T120,45 T180,40 T240,35 T300,35;
                        M0,60 Q30,65 60,50 T120,55 T180,35 T240,40 T300,30"
                dur="4s"
                repeatCount="indefinite"
              />
            </path>
          </svg>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-white/70">90 Seconds</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-white/70">Real Concepts</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-white/70">Learn IPOs</span>
          </div>
        </div>

        {/* Start button */}
        <Button
          onClick={onStart}
          size="lg"
          className="w-full max-w-xs h-16 text-lg font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95"
        >
          <Play className="w-6 h-6 mr-3 fill-current" />
          Start Run
        </Button>

        {/* Concept preview */}
        <div className="mt-8 text-center">
          <p className="text-white/40 text-sm mb-2">Learn about the</p>
          <p className="text-white/70 font-medium">
            Greenshoe Option (Overallotment)
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 pb-6 text-center">
        <p className="text-white/30 text-xs">
          Educational game • Not financial advice
        </p>
      </div>
    </div>
  );
};

export default LandingScreen;
