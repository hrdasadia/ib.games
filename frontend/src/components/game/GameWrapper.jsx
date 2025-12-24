import React, { useState, useCallback } from 'react';
import LandingScreen from './LandingScreen';
import AnimatedExplainer from './AnimatedExplainer';
import GameContainer from './GameContainer';
import ResultsScreen from './ResultsScreen';
import RealWorldStory from './RealWorldStory';

const GAME_STATES = {
  LANDING: 'landing',
  EXPLAINER: 'explainer',
  PLAYING: 'playing',
  RESULTS: 'results',
  STORY: 'story'
};

const GameWrapper = () => {
  const [gameState, setGameState] = useState(GAME_STATES.LANDING);
  const [gameResult, setGameResult] = useState(null);
  const [hasSeenExplainer, setHasSeenExplainer] = useState(false);
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    reduceMotion: false,
    colorBlind: false,
    muteAudio: false
  });

  const handleStart = useCallback(() => {
    if (!hasSeenExplainer) {
      setGameState(GAME_STATES.EXPLAINER);
    } else {
      setGameState(GAME_STATES.PLAYING);
    }
  }, [hasSeenExplainer]);

  const handleExplainerComplete = useCallback(() => {
    setHasSeenExplainer(true);
    setGameState(GAME_STATES.PLAYING);
  }, []);

  const handleExplainerSkip = useCallback(() => {
    setHasSeenExplainer(true);
    setGameState(GAME_STATES.PLAYING);
  }, []);

  const handleGameEnd = useCallback((result) => {
    setGameResult(result);
    setGameState(GAME_STATES.RESULTS);
  }, []);

  const handleReplay = useCallback(() => {
    setGameResult(null);
    setGameState(GAME_STATES.PLAYING);
  }, []);

  const handleLearnMore = useCallback(() => {
    setGameState(GAME_STATES.STORY);
  }, []);

  const handleStoryClose = useCallback(() => {
    setGameState(GAME_STATES.RESULTS);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a12]">
      {gameState === GAME_STATES.LANDING && (
        <LandingScreen
          onStart={handleStart}
          accessibilitySettings={accessibilitySettings}
          onSettingsChange={setAccessibilitySettings}
        />
      )}

      {gameState === GAME_STATES.EXPLAINER && (
        <AnimatedExplainer 
          onComplete={handleExplainerComplete} 
          onSkip={handleExplainerSkip}
        />
      )}

      {gameState === GAME_STATES.PLAYING && (
        <div className="min-h-screen flex items-center justify-center p-2">
          <GameContainer
            onGameEnd={handleGameEnd}
            accessibilitySettings={accessibilitySettings}
          />
        </div>
      )}

      {gameState === GAME_STATES.RESULTS && gameResult && (
        <ResultsScreen
          result={gameResult}
          onReplay={handleReplay}
          onLearnMore={handleLearnMore}
        />
      )}

      {gameState === GAME_STATES.STORY && (
        <RealWorldStory onClose={handleStoryClose} />
      )}
    </div>
  );
};

export default GameWrapper;
