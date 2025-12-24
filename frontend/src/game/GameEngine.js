// Greenshoe Sprint - Game Engine using Phaser 3
import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.gameState = {
      phase: 0,
      time: 0,
      price: 100,
      targetPrice: 100,
      volatility: 0,
      stabilizationBudget: 100,
      greenshoesRemaining: 3,
      score: { stability: 0, liquidity: 0, efficiency: 0, reputation: 0 },
      isStabilizing: false,
      orders: [],
      priceHistory: [],
      events: [],
      demandSurges: [],
      newsEvents: []
    };
    this.callbacks = {};
  }

  setCallbacks(callbacks) {
    this.callbacks = callbacks;
  }

  init(data) {
    this.gameConfig = data.config;
    this.callbacks = data.callbacks || {};
  }

  preload() {
    // Generate procedural assets
  }

  create() {
    this.cameras.main.setBackgroundColor('#0a0a12');
    
    // Initialize game state
    this.gameState = {
      phase: 0,
      time: 0,
      totalTime: 0,
      price: 100,
      targetPrice: 100,
      volatility: 0.05,
      stabilizationBudget: 100,
      greenshoesRemaining: 3,
      score: { stability: 0, liquidity: 0, efficiency: 0, reputation: 0 },
      isStabilizing: false,
      orders: [],
      priceHistory: [{ time: 0, price: 100 }],
      events: [],
      demandSurges: [],
      newsEvents: [],
      gameOver: false,
      budgetUsed: 0,
      greenshoesUsed: 0,
      maxVolatility: 0,
      stabilizationTime: 0,
      perfectGreenshoes: 0
    };

    // Create visual elements
    this.createBackground();
    this.createParticles();
    this.createPriceChart();
    this.createOrderBook();
    this.createUI();
    
    // Set up input
    this.setupInput();
    
    // Start game loop
    this.gameTimer = this.time.addEvent({
      delay: 100,
      callback: this.gameLoop,
      callbackScope: this,
      loop: true
    });

    // Schedule phase transitions
    this.schedulePhases();
    
    // Schedule random events
    this.scheduleEvents();
  }

  createBackground() {
    // Create gradient background
    const graphics = this.add.graphics();
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Dark gradient
    for (let i = 0; i < height; i++) {
      const t = i / height;
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        { r: 10, g: 10, b: 18 },
        { r: 15, g: 20, b: 35 },
        100,
        t * 100
      );
      graphics.lineStyle(1, Phaser.Display.Color.GetColor(color.r, color.g, color.b));
      graphics.lineBetween(0, i, width, i);
    }
    
    // Grid lines
    graphics.lineStyle(1, 0x1a2a4a, 0.3);
    for (let x = 0; x < width; x += 40) {
      graphics.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 40) {
      graphics.lineBetween(0, y, width, y);
    }
  }

  createParticles() {
    // Create floating particles for ambient effect
    this.particles = [];
    for (let i = 0; i < 30; i++) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, this.cameras.main.width),
        Phaser.Math.Between(0, this.cameras.main.height),
        Phaser.Math.Between(1, 3),
        0x00ffaa,
        0.3
      );
      particle.velocity = { x: Phaser.Math.FloatBetween(-0.3, 0.3), y: Phaser.Math.FloatBetween(-0.5, -0.1) };
      this.particles.push(particle);
    }
  }

  createPriceChart() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Chart area
    this.chartGraphics = this.add.graphics();
    this.chartX = 20;
    this.chartY = 80;
    this.chartWidth = width - 40;
    this.chartHeight = height * 0.35;
    
    // Price line container
    this.priceLine = this.add.graphics();
    
    // Current price display
    this.priceText = this.add.text(width / 2, 50, '$100.00', {
      fontFamily: 'monospace',
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#00ffaa'
    }).setOrigin(0.5);
    
    // Target band
    this.targetBandText = this.add.text(width - 20, 50, 'Target: $100', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#666'
    }).setOrigin(1, 0.5);
  }

  createOrderBook() {
    const height = this.cameras.main.height;
    this.orderBookY = this.chartY + this.chartHeight + 30;
    
    // Order book visualization
    this.orderGraphics = this.add.graphics();
    
    // Lane labels
    const lanes = ['Retail', 'Long-Only', 'Hedge', 'Momentum'];
    const laneWidth = (this.cameras.main.width - 40) / 4;
    
    this.laneLabels = [];
    this.laneBars = [];
    
    lanes.forEach((lane, i) => {
      const x = 20 + laneWidth * i + laneWidth / 2;
      
      const label = this.add.text(x, this.orderBookY, lane, {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#888'
      }).setOrigin(0.5, 0);
      this.laneLabels.push(label);
      
      // Lane demand bars
      const bar = this.add.graphics();
      this.laneBars.push({ graphics: bar, x: x, demand: 50 + Math.random() * 30 });
    });
  }

  createUI() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Phase indicator
    this.phaseText = this.add.text(20, 20, 'PHASE 1: Bookbuilding Rush', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#00aaff'
    });
    
    // Timer
    this.timerText = this.add.text(width - 20, 20, '90s', {
      fontFamily: 'monospace',
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#fff'
    }).setOrigin(1, 0);
    
    // Budget meter
    this.budgetY = height - 120;
    this.budgetLabel = this.add.text(20, this.budgetY, 'STABILIZATION', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#888'
    });
    this.budgetBar = this.add.graphics();
    this.updateBudgetBar();
    
    // Greenshoe indicator
    this.greenshoeY = height - 70;
    this.greenshoeLabel = this.add.text(20, this.greenshoeY, 'GREENSHOE', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#888'
    });
    this.greenshoeIcons = [];
    for (let i = 0; i < 3; i++) {
      const icon = this.add.circle(40 + i * 30, this.greenshoeY + 25, 10, 0x00ff88);
      this.greenshoeIcons.push(icon);
    }
    
    // Action hint
    this.hintText = this.add.text(width / 2, height - 30, 'HOLD to stabilize • TAP for greenshoe', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#555'
    }).setOrigin(0.5);
    
    // Volatility indicator
    this.volatilityText = this.add.text(width - 20, this.budgetY, 'VOL: LOW', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#00ff88'
    }).setOrigin(1, 0);
  }

  setupInput() {
    // Tap for greenshoe
    this.input.on('pointerdown', (pointer) => {
      this.pointerDownTime = this.time.now;
      this.isHolding = true;
    });
    
    this.input.on('pointerup', (pointer) => {
      const holdDuration = this.time.now - this.pointerDownTime;
      
      if (holdDuration < 200) {
        // Quick tap - activate greenshoe
        this.activateGreenshoe();
      }
      
      this.isHolding = false;
      this.gameState.isStabilizing = false;
    });
    
    // Swipe detection for lane routing
    let startX = 0;
    this.input.on('pointerdown', (pointer) => {
      startX = pointer.x;
    });
    
    this.input.on('pointermove', (pointer) => {
      if (this.isHolding) {
        const holdDuration = this.time.now - this.pointerDownTime;
        if (holdDuration > 200) {
          // Holding - stabilization
          this.gameState.isStabilizing = true;
        }
      }
    });
  }

  schedulePhases() {
    // Phase transitions
    this.time.delayedCall(25000, () => this.transitionToPhase(1));
    this.time.delayedCall(60000, () => this.transitionToPhase(2));
    this.time.delayedCall(90000, () => this.endGame());
  }

  scheduleEvents() {
    // Schedule demand surges
    for (let i = 0; i < 8; i++) {
      this.time.delayedCall(5000 + i * 10000, () => {
        if (!this.gameState.gameOver) this.triggerDemandSurge();
      });
    }
    
    // Schedule news events in phase 3
    this.time.delayedCall(62000, () => this.triggerNewsEvent(true));
    this.time.delayedCall(72000, () => this.triggerNewsEvent(false));
    this.time.delayedCall(82000, () => this.triggerNewsEvent(Math.random() > 0.5));
  }

  transitionToPhase(phase) {
    if (this.gameState.gameOver) return;
    
    this.gameState.phase = phase;
    const phaseNames = ['Bookbuilding Rush', 'First Print', 'Aftermarket Wave'];
    this.phaseText.setText(`PHASE ${phase + 1}: ${phaseNames[phase]}`);
    
    // Phase transition effect
    this.cameras.main.flash(300, 0, 170, 255, false);
    
    // Notify React
    if (this.callbacks.onPhaseChange) {
      this.callbacks.onPhaseChange(phase);
    }
  }

  triggerDemandSurge() {
    const surge = {
      intensity: 0.5 + Math.random() * 0.5,
      duration: 3000,
      lane: Math.floor(Math.random() * 4)
    };
    this.gameState.demandSurges.push(surge);
    
    // Visual effect
    const laneBar = this.laneBars[surge.lane];
    this.tweens.add({
      targets: laneBar,
      demand: laneBar.demand + surge.intensity * 40,
      duration: 500,
      ease: 'Power2'
    });
    
    // Increase volatility
    this.gameState.volatility += surge.intensity * 0.1;
  }

  triggerNewsEvent(positive) {
    const event = {
      positive,
      time: this.gameState.totalTime,
      impact: 0.1 + Math.random() * 0.1
    };
    this.gameState.newsEvents.push(event);
    
    // Price impact
    const priceChange = positive ? event.impact : -event.impact;
    this.gameState.price *= (1 + priceChange);
    this.gameState.volatility += 0.05;
    
    // Visual effect
    if (positive) {
      this.cameras.main.flash(200, 0, 255, 100);
    } else {
      this.cameras.main.shake(300, 0.01);
    }
    
    // Notify React
    if (this.callbacks.onNewsEvent) {
      this.callbacks.onNewsEvent(event);
    }
  }

  activateGreenshoe() {
    if (this.gameState.greenshoesRemaining <= 0 || this.gameState.gameOver) return;
    
    this.gameState.greenshoesRemaining--;
    this.gameState.greenshoesUsed++;
    
    // Update visual
    const iconIndex = 2 - this.gameState.greenshoesRemaining;
    if (this.greenshoeIcons[iconIndex]) {
      this.tweens.add({
        targets: this.greenshoeIcons[iconIndex],
        alpha: 0.2,
        scale: 1.5,
        duration: 300,
        ease: 'Power2'
      });
    }
    
    // Effect: reduce volatility and cool demand
    const effectStrength = this.gameState.volatility > 0.15 ? 1 : 0.5;
    this.gameState.volatility *= 0.7;
    
    // Check if timing was optimal
    if (this.gameState.volatility > 0.12) {
      this.gameState.perfectGreenshoes++;
    }
    
    // Price adjustment (add supply = moderate price)
    if (this.gameState.price > 105) {
      this.gameState.price = this.gameState.price * 0.97;
    }
    
    // Visual burst
    this.cameras.main.flash(150, 0, 255, 136);
    
    // Notify React
    if (this.callbacks.onGreenshoe) {
      this.callbacks.onGreenshoe(this.gameState.greenshoesRemaining);
    }
  }

  gameLoop() {
    if (this.gameState.gameOver) return;
    
    this.gameState.totalTime += 0.1;
    
    // Update price based on market dynamics
    this.updatePrice();
    
    // Handle stabilization
    if (this.gameState.isStabilizing && this.gameState.stabilizationBudget > 0) {
      this.gameState.stabilizationBudget -= 0.5;
      this.gameState.budgetUsed += 0.5;
      this.gameState.stabilizationTime += 0.1;
      this.gameState.volatility *= 0.98;
      
      // Support price if dropping
      if (this.gameState.price < 98) {
        this.gameState.price += 0.3;
      }
    }
    
    // Decay volatility naturally
    this.gameState.volatility = Math.max(0.03, this.gameState.volatility * 0.995);
    
    // Track max volatility
    this.gameState.maxVolatility = Math.max(this.gameState.maxVolatility, this.gameState.volatility);
    
    // Update UI
    this.updateUI();
    
    // Update score
    this.updateScore();
    
    // Update particles
    this.updateParticles();
    
    // Notify React of state update
    if (this.callbacks.onStateUpdate) {
      this.callbacks.onStateUpdate({ ...this.gameState });
    }
  }

  updatePrice() {
    // Random walk with volatility
    const noise = (Math.random() - 0.5) * 2 * this.gameState.volatility;
    const meanReversion = (this.gameState.targetPrice - this.gameState.price) * 0.01;
    
    this.gameState.price += this.gameState.price * (noise + meanReversion);
    this.gameState.price = Math.max(80, Math.min(130, this.gameState.price));
    
    // Record history
    this.gameState.priceHistory.push({
      time: this.gameState.totalTime,
      price: this.gameState.price
    });
    
    // Keep history manageable
    if (this.gameState.priceHistory.length > 300) {
      this.gameState.priceHistory.shift();
    }
  }

  updateUI() {
    // Price display
    const priceColor = this.gameState.price >= 100 ? '#00ff88' : 
                       this.gameState.price >= 95 ? '#ffaa00' : '#ff4444';
    this.priceText.setText(`$${this.gameState.price.toFixed(2)}`);
    this.priceText.setColor(priceColor);
    
    // Timer
    const remaining = Math.max(0, 90 - this.gameState.totalTime);
    this.timerText.setText(`${Math.ceil(remaining)}s`);
    
    // Budget bar
    this.updateBudgetBar();
    
    // Volatility indicator
    let volLabel = 'LOW';
    let volColor = '#00ff88';
    if (this.gameState.volatility > 0.15) {
      volLabel = 'HIGH';
      volColor = '#ff4444';
    } else if (this.gameState.volatility > 0.08) {
      volLabel = 'MED';
      volColor = '#ffaa00';
    }
    this.volatilityText.setText(`VOL: ${volLabel}`);
    this.volatilityText.setColor(volColor);
    
    // Draw price chart
    this.drawPriceChart();
    
    // Update order book bars
    this.updateOrderBook();
  }

  updateBudgetBar() {
    this.budgetBar.clear();
    const barWidth = 150;
    const barHeight = 12;
    const fill = this.gameState.stabilizationBudget / 100;
    
    // Background
    this.budgetBar.fillStyle(0x1a2a3a);
    this.budgetBar.fillRect(20, this.budgetY + 18, barWidth, barHeight);
    
    // Fill
    const fillColor = fill > 0.5 ? 0x00aaff : fill > 0.25 ? 0xffaa00 : 0xff4444;
    this.budgetBar.fillStyle(fillColor);
    this.budgetBar.fillRect(20, this.budgetY + 18, barWidth * fill, barHeight);
    
    // Glow when stabilizing
    if (this.gameState.isStabilizing) {
      this.budgetBar.lineStyle(2, 0x00ffff, 0.8);
      this.budgetBar.strokeRect(19, this.budgetY + 17, barWidth + 2, barHeight + 2);
    }
  }

  drawPriceChart() {
    this.priceLine.clear();
    
    const history = this.gameState.priceHistory;
    if (history.length < 2) return;
    
    // Price range
    const minPrice = 85;
    const maxPrice = 120;
    const priceRange = maxPrice - minPrice;
    
    // Draw target band
    this.priceLine.fillStyle(0x00ff88, 0.1);
    const bandTop = this.chartY + this.chartHeight - ((105 - minPrice) / priceRange) * this.chartHeight;
    const bandBottom = this.chartY + this.chartHeight - ((95 - minPrice) / priceRange) * this.chartHeight;
    this.priceLine.fillRect(this.chartX, bandTop, this.chartWidth, bandBottom - bandTop);
    
    // Draw price line
    const points = history.slice(-100);
    const xStep = this.chartWidth / 100;
    
    this.priceLine.lineStyle(2, 0x00ffaa, 1);
    this.priceLine.beginPath();
    
    points.forEach((point, i) => {
      const x = this.chartX + i * xStep;
      const y = this.chartY + this.chartHeight - ((point.price - minPrice) / priceRange) * this.chartHeight;
      
      if (i === 0) {
        this.priceLine.moveTo(x, y);
      } else {
        this.priceLine.lineTo(x, y);
      }
    });
    
    this.priceLine.strokePath();
    
    // Glow effect
    this.priceLine.lineStyle(6, 0x00ffaa, 0.2);
    this.priceLine.beginPath();
    points.forEach((point, i) => {
      const x = this.chartX + i * xStep;
      const y = this.chartY + this.chartHeight - ((point.price - minPrice) / priceRange) * this.chartHeight;
      if (i === 0) this.priceLine.moveTo(x, y);
      else this.priceLine.lineTo(x, y);
    });
    this.priceLine.strokePath();
  }

  updateOrderBook() {
    this.laneBars.forEach((bar, i) => {
      bar.graphics.clear();
      
      const barWidth = 50;
      const maxHeight = 60;
      const barHeight = (bar.demand / 100) * maxHeight;
      
      const colors = [0x00aaff, 0x00ff88, 0xffaa00, 0xff6688];
      bar.graphics.fillStyle(colors[i], 0.7);
      bar.graphics.fillRect(bar.x - barWidth / 2, this.orderBookY + 25, barWidth, barHeight);
      
      // Glow
      bar.graphics.fillStyle(colors[i], 0.2);
      bar.graphics.fillRect(bar.x - barWidth / 2 - 5, this.orderBookY + 20, barWidth + 10, barHeight + 10);
      
      // Animate demand
      bar.demand += (Math.random() - 0.5) * 5;
      bar.demand = Math.max(20, Math.min(100, bar.demand));
    });
  }

  updateParticles() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    this.particles.forEach(p => {
      p.x += p.velocity.x;
      p.y += p.velocity.y;
      
      // Wrap around
      if (p.y < 0) p.y = height;
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      
      // Volatility affects particle speed
      p.velocity.y = -0.3 - this.gameState.volatility * 2;
    });
  }

  updateScore() {
    // Stability score: based on price proximity to target
    const priceDeviation = Math.abs(this.gameState.price - 100) / 100;
    const stabilityIncrement = (1 - priceDeviation * 5) * 0.5;
    this.gameState.score.stability = Math.min(400, this.gameState.score.stability + Math.max(0, stabilityIncrement));
    
    // Liquidity score: based on order book health
    const avgDemand = this.laneBars.reduce((sum, b) => sum + b.demand, 0) / 4;
    const liquidityIncrement = avgDemand > 50 ? 0.25 : 0.1;
    this.gameState.score.liquidity = Math.min(200, this.gameState.score.liquidity + liquidityIncrement);
    
    // Efficiency: evaluated at end based on budget usage and greenshoe timing
    
    // Reputation: based on avoiding extreme moves
    if (this.gameState.volatility < 0.1) {
      this.gameState.score.reputation = Math.min(200, this.gameState.score.reputation + 0.3);
    }
  }

  endGame() {
    this.gameState.gameOver = true;
    this.gameTimer.remove();
    
    // Calculate final efficiency score
    const budgetEfficiency = this.gameState.stabilizationBudget / 100;
    const greenshoeEfficiency = this.gameState.perfectGreenshoes / Math.max(1, this.gameState.greenshoesUsed);
    this.gameState.score.efficiency = Math.min(200, (budgetEfficiency * 100) + (greenshoeEfficiency * 100));
    
    // Calculate total score
    const totalScore = Math.round(
      this.gameState.score.stability +
      this.gameState.score.liquidity +
      this.gameState.score.efficiency +
      this.gameState.score.reputation
    );
    
    // Determine rank
    let rank = 'Analyst';
    if (totalScore >= 850) rank = 'Managing Director';
    else if (totalScore >= 700) rank = 'Director';
    else if (totalScore >= 550) rank = 'VP';
    else if (totalScore >= 350) rank = 'Associate';
    
    // Determine badges
    const badges = [];
    if (this.gameState.maxVolatility < 0.1) badges.push({ id: 'smooth_operator', name: 'Smooth Operator' });
    if (this.gameState.score.liquidity >= 180) badges.push({ id: 'demand_master', name: 'Demand Master' });
    if (this.gameState.budgetUsed < 50) badges.push({ id: 'budget_hawk', name: 'Budget Hawk' });
    if (this.gameState.perfectGreenshoes >= 2) badges.push({ id: 'perfect_timing', name: 'Perfect Timing' });
    
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

export const createGameConfig = (width, height, callbacks, config) => ({
  type: Phaser.AUTO,
  width,
  height,
  parent: 'game-container',
  backgroundColor: '#0a0a12',
  scene: GameScene,
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  callbacks: {
    preBoot: (game) => {
      game.scene.scenes[0].setCallbacks(callbacks);
    }
  }
});
