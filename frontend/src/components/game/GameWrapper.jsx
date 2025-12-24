import React, { useState, useCallback } from 'react';
import LandingScreen from './LandingScreen';
import TutorialOverlay from './TutorialOverlay';
import GameContainer from './GameContainer';
import ResultsScreen from './ResultsScreen';
import RealWorldStory from './RealWorldStory';

// Game states
const GAME_STATES = {
  LANDING: 'landing',
  TUTORIAL: 'tutorial',
  PLAYING: 'playing',
  RESULTS: 'results',
  STORY: 'story'
};

const GameWrapper = () => {
  const [gameState, setGameState] = useState(GAME_STATES.LANDING);
  const [gameResult, setGameResult] = useState(null);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    reduceMotion: false,
    colorBlind: false,
    muteAudio: false
  });

  const handleStart = useCallback(() => {
    if (!hasSeenTutorial) {
      setGameState(GAME_STATES.TUTORIAL);
    } else {
      setGameState(GAME_STATES.PLAYING);
    }
  }, [hasSeenTutorial]);

  const handleTutorialComplete = useCallback(() => {
    setHasSeenTutorial(true);
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

  const handleShare = useCallback((shareData) => {
    console.log('Shared:', shareData);
    // Analytics tracking would go here
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a12]">
      {/* Landing Screen */}
      {gameState === GAME_STATES.LANDING && (
        <LandingScreen
          onStart={handleStart}
          accessibilitySettings={accessibilitySettings}
          onSettingsChange={setAccessibilitySettings}
        />
      )}

      {/* Tutorial */}
      {gameState === GAME_STATES.TUTORIAL && (
        <TutorialOverlay onComplete={handleTutorialComplete} />
      )}

      {/* Game */}
      {gameState === GAME_STATES.PLAYING && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <GameContainer
            onGameEnd={handleGameEnd}
            accessibilitySettings={accessibilitySettings}
          />
        </div>
      )}

      {/* Results */}
      {gameState === GAME_STATES.RESULTS && gameResult && (
        <ResultsScreen
          result={gameResult}
          onReplay={handleReplay}
          onShare={handleShare}
          onLearnMore={handleLearnMore}
        />
      )}

      {/* Real World Story */}
      {gameState === GAME_STATES.STORY && (
        <RealWorldStory onClose={handleStoryClose} />
      )}
    </div>
  );
};

export default GameWrapper;
