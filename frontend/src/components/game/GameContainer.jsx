import React, { useEffect, useRef, useState, useCallback } from 'react';
import Phaser from 'phaser';

// Inline Game Scene to avoid import issues
class GreenshoeGameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GreenshoeGameScene' });
    this.gameState = null;
    this.callbacks = {};
  }

  init(data) {
    this.callbacks = data?.callbacks || {};
  }

  create() {
    this.cameras.main.setBackgroundColor('#0a0a12');
    
    // Initialize game state
    this.gameState = {
      phase: 0,
      totalTime: 0,
      price: 100,
      targetPrice: 100,
      volatility: 0.05,
      stabilizationBudget: 100,
      greenshoesRemaining: 3,
      isStabilizing: false,
      priceHistory: [{ time: 0, price: 100 }],
      gameOver: false,
      budgetUsed: 0,
      greenshoesUsed: 0,
      maxVolatility: 0,
      stabilizationTime: 0,
      perfectGreenshoes: 0,
      score: { stability: 0, liquidity: 0, efficiency: 0, reputation: 0 }
    };

    this.pointerDownTime = 0;
    this.isHolding = false;
    this.holdIndicator = null;

    this.createBackground();
    this.createParticles();
    this.createUI();
    this.createPriceChart();
    this.createOrderBook();
    this.createHoldIndicator();
    this.setupInput();

    // Game timer
    this.gameTimer = this.time.addEvent({
      delay: 100,
      callback: this.gameLoop,
      callbackScope: this,
      loop: true
    });

    // Phase transitions
    this.time.delayedCall(25000, () => this.transitionToPhase(1));
    this.time.delayedCall(60000, () => this.transitionToPhase(2));
    this.time.delayedCall(90000, () => this.endGame());

    // Random events
    for (let i = 0; i < 6; i++) {
      this.time.delayedCall(8000 + i * 12000, () => {
        if (!this.gameState.gameOver) this.triggerDemandSurge();
      });
    }

    this.time.delayedCall(65000, () => this.triggerNewsEvent(true));
    this.time.delayedCall(78000, () => this.triggerNewsEvent(false));
  }

  createBackground() {
    const graphics = this.add.graphics();
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Grid
    graphics.lineStyle(1, 0x1a2a4a, 0.3);
    for (let x = 0; x < width; x += 30) {
      graphics.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 30) {
      graphics.lineBetween(0, y, width, y);
    }
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < 20; i++) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, this.cameras.main.width),
        Phaser.Math.Between(0, this.cameras.main.height),
        Phaser.Math.Between(1, 2),
        0x00ffaa,
        0.3
      );
      particle.velocity = { x: Phaser.Math.FloatBetween(-0.2, 0.2), y: Phaser.Math.FloatBetween(-0.3, -0.1) };
      this.particles.push(particle);
    }
  }

  createUI() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Phase text
    this.phaseText = this.add.text(15, 15, 'PHASE 1: Bookbuilding', {
      fontFamily: 'monospace', fontSize: '12px', color: '#00aaff'
    });
    this.phaseDescText = this.add.text(15, 32, 'Orders flowing in — manage allocation', {
      fontFamily: 'monospace', fontSize: '10px', color: '#888'
    });

    // Timer
    this.timerText = this.add.text(width - 15, 15, '90s', {
      fontFamily: 'monospace', fontSize: '18px', fontStyle: 'bold', color: '#fff'
    }).setOrigin(1, 0);

    // Price display
    this.priceText = this.add.text(width / 2, 55, '$100.00', {
      fontFamily: 'monospace', fontSize: '28px', fontStyle: 'bold', color: '#00ffaa'
    }).setOrigin(0.5);
    this.targetText = this.add.text(width / 2, 80, 'Target: $100', {
      fontFamily: 'monospace', fontSize: '11px', color: '#666'
    }).setOrigin(0.5);

    // Budget bar
    this.budgetY = height - 110;
    this.add.text(15, this.budgetY, 'STABILIZATION BUDGET', {
      fontFamily: 'monospace', fontSize: '10px', color: '#888'
    });
    this.add.text(15, this.budgetY + 12, 'HOLD to buy support when price drops', {
      fontFamily: 'monospace', fontSize: '8px', color: '#555'
    });
    this.budgetBarBg = this.add.rectangle(15, this.budgetY + 30, 150, 10, 0x1a2a3a).setOrigin(0, 0.5);
    this.budgetBarFill = this.add.rectangle(15, this.budgetY + 30, 150, 10, 0x00aaff).setOrigin(0, 0.5);

    // Greenshoe indicators
    this.greenshoeY = height - 55;
    this.add.text(15, this.greenshoeY, 'GREENSHOE OPTIONS', {
      fontFamily: 'monospace', fontSize: '10px', color: '#888'
    });
    this.add.text(15, this.greenshoeY + 12, 'TAP to release shares when price spikes', {
      fontFamily: 'monospace', fontSize: '8px', color: '#555'
    });
    this.greenshoeIcons = [];
    for (let i = 0; i < 3; i++) {
      const icon = this.add.circle(30 + i * 25, this.greenshoeY + 35, 8, 0x00ff88);
      this.greenshoeIcons.push(icon);
    }

    // Volatility indicator
    this.volText = this.add.text(width - 15, this.budgetY, 'VOLATILITY: LOW', {
      fontFamily: 'monospace', fontSize: '10px', color: '#00ff88'
    }).setOrigin(1, 0);

    // Action hint area
    this.hintBg = this.add.rectangle(width / 2, height - 15, width - 30, 24, 0x000000, 0).setOrigin(0.5);
    this.hintText = this.add.text(width / 2, height - 15, '', {
      fontFamily: 'monospace', fontSize: '11px', color: '#ffaa00'
    }).setOrigin(0.5);
  }

  createPriceChart() {
    const width = this.cameras.main.width;
    this.chartX = 15;
    this.chartY = 100;
    this.chartWidth = width - 30;
    this.chartHeight = 120;

    // Chart background
    this.add.rectangle(this.chartX + this.chartWidth / 2, this.chartY + this.chartHeight / 2, 
      this.chartWidth, this.chartHeight, 0x0a1520, 0.5);

    // Target band
    this.targetBand = this.add.rectangle(this.chartX + this.chartWidth / 2, this.chartY + this.chartHeight / 2,
      this.chartWidth, this.chartHeight * 0.3, 0x00ff88, 0.1);

    this.priceLine = this.add.graphics();
  }

  createOrderBook() {
    const width = this.cameras.main.width;
    this.orderBookY = this.chartY + this.chartHeight + 20;

    this.add.text(15, this.orderBookY, 'ORDER BOOK — Who\'s buying', {
      fontFamily: 'monospace', fontSize: '10px', color: '#888'
    });

    const lanes = [
      { name: 'Retail', color: 0x00aaff, desc: 'Regular investors' },
      { name: 'Long-Only', color: 0x00ff88, desc: 'Patient funds' },
      { name: 'Hedge', color: 0xffaa00, desc: 'Fast traders' },
      { name: 'Momentum', color: 0xff6688, desc: 'Trend followers' }
    ];

    const laneWidth = (width - 40) / 4;
    this.laneBars = [];

    lanes.forEach((lane, i) => {
      const x = 20 + laneWidth * i + laneWidth / 2;
      
      this.add.text(x, this.orderBookY + 18, lane.name, {
        fontFamily: 'monospace', fontSize: '9px', color: '#aaa'
      }).setOrigin(0.5, 0);

      const bar = this.add.rectangle(x, this.orderBookY + 65, 35, 30, lane.color, 0.7).setOrigin(0.5, 1);
      this.laneBars.push({ bar, color: lane.color, demand: 40 + Math.random() * 30 });
    });
  }

  createHoldIndicator() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Create hold ring indicator
    this.holdRing = this.add.graphics();
    this.holdProgress = 0;
    this.holdRing.setVisible(false);

    // Stabilizing flash effect
    this.stabilizeOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x00aaff, 0);
  }

  setupInput() {
    this.input.on('pointerdown', (pointer) => {
      this.pointerDownTime = this.time.now;
      this.isHolding = true;
      this.holdRing.setVisible(true);
    });

    this.input.on('pointerup', () => {
      const holdDuration = this.time.now - this.pointerDownTime;

      if (holdDuration < 250) {
        this.activateGreenshoe();
      }

      this.isHolding = false;
      this.gameState.isStabilizing = false;
      this.holdRing.setVisible(false);
      this.holdProgress = 0;
      this.stabilizeOverlay.setAlpha(0);
    });
  }

  activateGreenshoe() {
    if (this.gameState.greenshoesRemaining <= 0 || this.gameState.gameOver) return;

    this.gameState.greenshoesRemaining--;
    this.gameState.greenshoesUsed++;

    // Visual feedback
    const iconIndex = 2 - this.gameState.greenshoesRemaining;
    if (this.greenshoeIcons[iconIndex]) {
      this.tweens.add({
        targets: this.greenshoeIcons[iconIndex],
        alpha: 0.2,
        scale: 0.5,
        duration: 300
      });
    }

    // Effect: reduce volatility and price if too high
    if (this.gameState.price > 105) {
      this.gameState.price *= 0.96;
      this.gameState.perfectGreenshoes++;
      this.showHint('✓ Greenshoe cooled the price!', '#00ff88');
    } else {
      this.showHint('Greenshoe used — shares released', '#ffaa00');
    }
    this.gameState.volatility *= 0.7;

    // Flash effect
    this.cameras.main.flash(150, 0, 255, 136);

    if (this.callbacks.onGreenshoe) {
      this.callbacks.onGreenshoe(this.gameState.greenshoesRemaining);
    }
  }

  showHint(text, color = '#ffaa00') {
    this.hintText.setText(text);
    this.hintText.setColor(color);
    this.time.delayedCall(2000, () => {
      this.hintText.setText('');
    });
  }

  transitionToPhase(phase) {
    if (this.gameState.gameOver) return;

    this.gameState.phase = phase;
    const phases = [
      { name: 'Bookbuilding', desc: 'Orders flowing in — manage allocation' },
      { name: 'First Print', desc: 'Trading begins — stabilize the price!' },
      { name: 'Aftermarket', desc: 'News events — react quickly!' }
    ];

    this.phaseText.setText(`PHASE ${phase + 1}: ${phases[phase].name}`);
    this.phaseDescText.setText(phases[phase].desc);

    // Increase volatility on phase change
    this.gameState.volatility += 0.03;

    this.cameras.main.flash(300, 0, 170, 255);

    if (this.callbacks.onPhaseChange) {
      this.callbacks.onPhaseChange(phase);
    }
  }

  triggerDemandSurge() {
    const surge = 0.5 + Math.random() * 0.5;
    this.gameState.volatility += surge * 0.08;
    
    const randomLane = Math.floor(Math.random() * 4);
    this.laneBars[randomLane].demand += 25;

    this.showHint('⚡ Demand surge!', '#ffaa00');
  }

  triggerNewsEvent(positive) {
    const impact = 0.08 + Math.random() * 0.07;
    this.gameState.price *= positive ? (1 + impact) : (1 - impact);
    this.gameState.volatility += 0.05;

    if (positive) {
      this.showHint('📈 Positive news! Price jumping', '#00ff88');
      this.cameras.main.flash(200, 0, 255, 100);
    } else {
      this.showHint('📉 Negative news! Price dropping', '#ff4444');
      this.cameras.main.shake(300, 0.01);
    }
  }

  gameLoop() {
    if (this.gameState.gameOver) return;

    this.gameState.totalTime += 0.1;

    // Handle holding (stabilization)
    if (this.isHolding) {
      const holdDuration = this.time.now - this.pointerDownTime;
      if (holdDuration > 250 && this.gameState.stabilizationBudget > 0) {
        this.gameState.isStabilizing = true;
        this.gameState.stabilizationBudget -= 0.4;
        this.gameState.budgetUsed += 0.4;
        this.gameState.stabilizationTime += 0.1;
        this.gameState.volatility *= 0.98;

        // Support price if dropping
        if (this.gameState.price < 98) {
          this.gameState.price += 0.25;
        }

        // Visual feedback for holding
        this.stabilizeOverlay.setAlpha(0.05);
        this.holdProgress = Math.min(1, holdDuration / 1000);
      }
    }

    // Price dynamics
    this.updatePrice();
    this.updateUI();
    this.updateScore();
    this.updateParticles();

    if (this.callbacks.onStateUpdate) {
      this.callbacks.onStateUpdate({ ...this.gameState });
    }
  }

  updatePrice() {
    const noise = (Math.random() - 0.5) * 2 * this.gameState.volatility;
    const meanReversion = (this.gameState.targetPrice - this.gameState.price) * 0.008;
    this.gameState.price += this.gameState.price * (noise + meanReversion);
    this.gameState.price = Math.max(85, Math.min(120, this.gameState.price));

    this.gameState.priceHistory.push({ time: this.gameState.totalTime, price: this.gameState.price });
    if (this.gameState.priceHistory.length > 200) this.gameState.priceHistory.shift();

    this.gameState.volatility = Math.max(0.03, this.gameState.volatility * 0.997);
    this.gameState.maxVolatility = Math.max(this.gameState.maxVolatility, this.gameState.volatility);
  }

  updateUI() {
    // Price
    const priceColor = this.gameState.price >= 98 && this.gameState.price <= 102 ? '#00ff88' :
                       this.gameState.price >= 95 && this.gameState.price <= 105 ? '#ffaa00' : '#ff4444';
    this.priceText.setText(`$${this.gameState.price.toFixed(2)}`);
    this.priceText.setColor(priceColor);

    // Timer
    const remaining = Math.max(0, 90 - this.gameState.totalTime);
    this.timerText.setText(`${Math.ceil(remaining)}s`);

    // Budget bar
    const budgetRatio = this.gameState.stabilizationBudget / 100;
    this.budgetBarFill.setScale(budgetRatio, 1);
    this.budgetBarFill.setFillStyle(budgetRatio > 0.5 ? 0x00aaff : budgetRatio > 0.25 ? 0xffaa00 : 0xff4444);

    // Volatility
    let volLabel = 'LOW', volColor = '#00ff88';
    if (this.gameState.volatility > 0.12) { volLabel = 'HIGH'; volColor = '#ff4444'; }
    else if (this.gameState.volatility > 0.07) { volLabel = 'MED'; volColor = '#ffaa00'; }
    this.volText.setText(`VOLATILITY: ${volLabel}`);
    this.volText.setColor(volColor);

    // Price chart
    this.drawPriceChart();

    // Order book
    this.laneBars.forEach(lb => {
      lb.demand += (Math.random() - 0.5) * 3;
      lb.demand = Math.max(15, Math.min(80, lb.demand));
      lb.bar.setScale(1, lb.demand / 50);
    });

    // Hold indicator
    if (this.isHolding && this.holdProgress > 0) {
      this.holdRing.clear();
      this.holdRing.lineStyle(4, 0x00aaff, 0.8);
      const cx = this.cameras.main.width / 2;
      const cy = this.cameras.main.height / 2;
      this.holdRing.beginPath();
      this.holdRing.arc(cx, cy, 40, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * this.holdProgress);
      this.holdRing.strokePath();
    }
  }

  drawPriceChart() {
    this.priceLine.clear();
    const history = this.gameState.priceHistory;
    if (history.length < 2) return;

    const minPrice = 90, maxPrice = 115;
    const priceRange = maxPrice - minPrice;
    const points = history.slice(-80);
    const xStep = this.chartWidth / 80;

    // Draw line
    this.priceLine.lineStyle(2, 0x00ffaa, 1);
    this.priceLine.beginPath();
    points.forEach((point, i) => {
      const x = this.chartX + i * xStep;
      const y = this.chartY + this.chartHeight - ((point.price - minPrice) / priceRange) * this.chartHeight;
      if (i === 0) this.priceLine.moveTo(x, y);
      else this.priceLine.lineTo(x, y);
    });
    this.priceLine.strokePath();

    // Glow
    this.priceLine.lineStyle(6, 0x00ffaa, 0.15);
    this.priceLine.beginPath();
    points.forEach((point, i) => {
      const x = this.chartX + i * xStep;
      const y = this.chartY + this.chartHeight - ((point.price - minPrice) / priceRange) * this.chartHeight;
      if (i === 0) this.priceLine.moveTo(x, y);
      else this.priceLine.lineTo(x, y);
    });
    this.priceLine.strokePath();
  }

  updateParticles() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    this.particles.forEach(p => {
      p.x += p.velocity.x;
      p.y += p.velocity.y - this.gameState.volatility * 1.5;
      if (p.y < 0) p.y = height;
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
    });
  }

  updateScore() {
    const priceDev = Math.abs(this.gameState.price - 100) / 100;
    const stabInc = (1 - priceDev * 5) * 0.45;
    this.gameState.score.stability = Math.min(400, this.gameState.score.stability + Math.max(0, stabInc));

    const avgDemand = this.laneBars.reduce((s, b) => s + b.demand, 0) / 4;
    this.gameState.score.liquidity = Math.min(200, this.gameState.score.liquidity + (avgDemand > 40 ? 0.25 : 0.1));

    if (this.gameState.volatility < 0.1) {
      this.gameState.score.reputation = Math.min(200, this.gameState.score.reputation + 0.25);
    }
  }

  endGame() {
    this.gameState.gameOver = true;
    this.gameTimer.remove();

    // Efficiency score
    const budgetEff = this.gameState.stabilizationBudget / 100;
    const gsEff = this.gameState.perfectGreenshoes / Math.max(1, this.gameState.greenshoesUsed);
    this.gameState.score.efficiency = Math.min(200, (budgetEff * 100) + (gsEff * 100));

    const totalScore = Math.round(
      this.gameState.score.stability + this.gameState.score.liquidity +
      this.gameState.score.efficiency + this.gameState.score.reputation
    );

    let rank = 'Analyst';
    if (totalScore >= 850) rank = 'Managing Director';
    else if (totalScore >= 700) rank = 'Director';
    else if (totalScore >= 550) rank = 'VP';
    else if (totalScore >= 350) rank = 'Associate';

    const badges = [];
    if (this.gameState.maxVolatility < 0.1) badges.push({ id: 'smooth', name: 'Smooth Operator' });
    if (this.gameState.score.liquidity >= 180) badges.push({ id: 'demand', name: 'Demand Master' });
    if (this.gameState.budgetUsed < 50) badges.push({ id: 'budget', name: 'Budget Hawk' });
    if (this.gameState.perfectGreenshoes >= 2) badges.push({ id: 'timing', name: 'Perfect Timing' });

    const finalResult = {
      totalScore,
      rank,
      badges,
      scores: this.gameState.score,
      priceHistory: this.gameState.priceHistory,
      finalPrice: this.gameState.price,
      budgetRemaining: this.gameState.stabilizationBudget,
      greenshoesUsed: this.gameState.greenshoesUsed,
      maxVolatility: this.gameState.maxVolatility
    };

    if (this.callbacks.onGameEnd) {
      this.callbacks.onGameEnd(finalResult);
    }
  }
}

const GameContainer = ({ onGameEnd, onPhaseChange, accessibilitySettings }) => {
  const gameRef = useRef(null);
  const containerRef = useRef(null);
  const [showPhaseTransition, setShowPhaseTransition] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);

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

    const width = Math.min(window.innerWidth, 400);
    const height = Math.min(window.innerHeight - 40, 650);

    const config = {
      type: Phaser.AUTO,
      width,
      height,
      parent: 'game-container',
      backgroundColor: '#0a0a12',
      scene: GreenshoeGameScene,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };

    gameRef.current = new Phaser.Game(config);

    gameRef.current.events.once('ready', () => {
      const scene = gameRef.current.scene.getScene('GreenshoeGameScene');
      if (scene) {
        scene.callbacks = {
          onPhaseChange: handlePhaseChange,
          onGameEnd: handleGameEnd
        };
      }
    });

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [handlePhaseChange, handleGameEnd]);

  const phaseNames = ['Bookbuilding Rush', 'First Print', 'Aftermarket Wave'];
  const phaseDescs = [
    'Orders flowing in',
    'Trading begins — stabilize!',
    'News events — react quickly!'
  ];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#0a0a12]">
      {/* Phase transition overlay */}
      {showPhaseTransition && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 animate-fade-in">
          <div className="text-center">
            <div className="text-cyan-400 text-sm font-mono mb-2">PHASE {currentPhase + 1}</div>
            <div className="text-white text-2xl font-bold tracking-wider mb-2">
              {phaseNames[currentPhase]}
            </div>
            <div className="text-white/50 text-sm">{phaseDescs[currentPhase]}</div>
          </div>
        </div>
      )}

      {/* Game canvas */}
      <div 
        id="game-container" 
        ref={containerRef}
        className="w-full max-w-[400px] rounded-xl overflow-hidden shadow-2xl"
        style={{ 
          boxShadow: '0 0 40px rgba(0, 255, 170, 0.1), 0 0 20px rgba(0, 170, 255, 0.08)',
          touchAction: 'none'
        }}
      />
    </div>
  );
};

export default GameContainer;
