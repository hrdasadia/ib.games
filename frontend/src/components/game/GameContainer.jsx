import React, { useEffect, useRef, useState, useCallback } from 'react';
import Phaser from 'phaser';
import { GameScene, createGameConfig } from '../../game/GameEngine';
import { GAME_CONFIG } from '../../data/mockData';

const GameContainer = ({ onGameEnd, onPhaseChange, accessibilitySettings }) => {
  const gameRef = useRef(null);
  const containerRef = useRef(null);
  const [gameState, setGameState] = useState(null);
  const [showPhaseTransition, setShowPhaseTransition] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);

  const handleStateUpdate = useCallback((state) => {
    setGameState(state);
  }, []);

  const handlePhaseChange = useCallback((phase) => {
    setCurrentPhase(phase);
    setShowPhaseTransition(true);
    setTimeout(() => setShowPhaseTransition(false), 1500);
    if (onPhaseChange) onPhaseChange(phase);
  }, [onPhaseChange]);

  const handleGameEnd = useCallback((result) => {
    if (onGameEnd) onGameEnd(result);
  }, [onGameEnd]);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const width = Math.min(window.innerWidth, 420);
    const height = Math.min(window.innerHeight - 60, 700);

    const config = {
      type: Phaser.AUTO,
      width,
      height,
      parent: 'game-container',
      backgroundColor: '#0a0a12',
      scene: [GameScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };

    gameRef.current = new Phaser.Game(config);

    // Pass callbacks to scene
    gameRef.current.events.once('ready', () => {
      const scene = gameRef.current.scene.getScene('GameScene');
      if (scene) {
        scene.setCallbacks({
          onStateUpdate: handleStateUpdate,
          onPhaseChange: handlePhaseChange,
          onGameEnd: handleGameEnd
        });
      }
    });

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [handleStateUpdate, handlePhaseChange, handleGameEnd]);

  const phaseNames = ['Bookbuilding Rush', 'First Print', 'Aftermarket Wave'];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#0a0a12]">
      {/* Phase transition overlay */}
      {showPhaseTransition && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 animate-fade-in">
          <div className="text-center">
            <div className="text-cyan-400 text-sm font-mono mb-2">PHASE {currentPhase + 1}</div>
            <div className="text-white text-2xl font-bold tracking-wider">
              {phaseNames[currentPhase]}
            </div>
          </div>
        </div>
      )}

      {/* Game canvas container */}
      <div 
        id="game-container" 
        ref={containerRef}
        className="w-full max-w-[420px] aspect-[3/4] rounded-lg overflow-hidden shadow-2xl"
        style={{ 
          boxShadow: '0 0 60px rgba(0, 255, 170, 0.15), 0 0 30px rgba(0, 170, 255, 0.1)' 
        }}
      />

      {/* HUD Overlay for mobile controls hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
        <div className="flex items-center gap-4 text-xs text-white/40 font-mono">
          <span className="flex items-center gap-1">
            <span className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center">TAP</span>
            Greenshoe
          </span>
          <span className="flex items-center gap-1">
            <span className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center">HOLD</span>
            Stabilize
          </span>
        </div>
      </div>
    </div>
  );
};

export default GameContainer;
