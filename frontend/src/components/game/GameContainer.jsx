import React, { useEffect, useRef, useState, useCallback } from 'react';
import Phaser from 'phaser';
import { audioManager } from '../../game/AudioManager';

// Enhanced Game Scene with improved mobile touch and reduced volatility
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
    
    // Initialize game state - REDUCED VOLATILITY for better player reaction
    this.gameState = {
      phase: 0,
      totalTime: 0,
      price: 100,
      targetPrice: 100,
      volatility: 0.025, // Reduced from 0.05
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
      score: { stability: 0, liquidity: 0, efficiency: 0, reputation: 0 },
      lastVolatilityWarning: 0
    };

    this.pointerDownTime = 0;
    this.isHolding = false;
    this.holdIndicator = null;
    this.tickCounter = 0;

    this.createBackground();
    this.createParticles();
    this.createUI();
    this.createPriceChart();
    this.createOrderBook();
    this.createHoldIndicator();
    this.createTouchZones(); // New: explicit touch zones
    this.setupInput();

    // Start ambient music
    if (this.callbacks.audioManager) {
      this.callbacks.audioManager.startAmbientMusic();
    }

    // Game timer - slower tick for smoother experience
    this.gameTimer = this.time.addEvent({
      delay: 150, // Increased from 100 for smoother feel
      callback: this.gameLoop,
      callbackScope: this,
      loop: true
    });

    // Phase transitions
    this.time.delayedCall(25000, () => this.transitionToPhase(1));
    this.time.delayedCall(60000, () => this.transitionToPhase(2));
    this.time.delayedCall(90000, () => this.endGame());

    // Fewer random events for less chaos
    for (let i = 0; i < 4; i++) { // Reduced from 6
      this.time.delayedCall(12000 + i * 18000, () => {
        if (!this.gameState.gameOver) this.triggerDemandSurge();
      });
    }

    this.time.delayedCall(65000, () => this.triggerNewsEvent(true));
    this.time.delayedCall(80000, () => this.triggerNewsEvent(false));
  }

  createBackground() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Gradient background
    const graphics = this.add.graphics();
    for (let y = 0; y < height; y++) {
      const t = y / height;
      const r = Math.floor(10 + t * 5);
      const g = Math.floor(10 + t * 15);
      const b = Math.floor(18 + t * 20);
      graphics.lineStyle(1, Phaser.Display.Color.GetColor(r, g, b));
      graphics.lineBetween(0, y, width, y);
    }
    
    // Animated grid
    this.gridGraphics = this.add.graphics();
    this.gridOffset = 0;
  }

  updateGrid() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    this.gridGraphics.clear();
    this.gridOffset = (this.gridOffset + 0.2) % 30;
    
    const alpha = 0.12 + Math.sin(this.gameState.totalTime * 1.5) * 0.03;
    this.gridGraphics.lineStyle(1, 0x1a3a5a, alpha);
    
    for (let x = -this.gridOffset; x < width; x += 30) {
      this.gridGraphics.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 30) {
      this.gridGraphics.lineBetween(0, y, width, y);
    }
  }

  createParticles() {
    this.particles = [];
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    for (let i = 0; i < 20; i++) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 3),
        0x00ffaa,
        0.35
      );
      particle.velocity = { 
        x: Phaser.Math.FloatBetween(-0.2, 0.2), 
        y: Phaser.Math.FloatBetween(-0.3, -0.1) 
      };
      particle.pulseSpeed = Phaser.Math.FloatBetween(0.015, 0.03);
      particle.pulseOffset = Math.random() * Math.PI * 2;
      this.particles.push(particle);
    }
  }

  createUI() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Phase text
    this.phaseText = this.add.text(15, 15, 'PHASE 1: Bookbuilding', {
      fontFamily: 'monospace', fontSize: '13px', color: '#00aaff'
    });
    this.phaseDescText = this.add.text(15, 34, 'Orders flowing in — manage allocation', {
      fontFamily: 'monospace', fontSize: '10px', color: '#888'
    });

    // Timer
    this.timerText = this.add.text(width - 15, 15, '90s', {
      fontFamily: 'monospace', fontSize: '22px', fontStyle: 'bold', color: '#fff'
    }).setOrigin(1, 0);

    // Price display with glow
    this.priceGlow = this.add.circle(width / 2, 65, 55, 0x00ffaa, 0.12);
    this.priceText = this.add.text(width / 2, 60, '$100.00', {
      fontFamily: 'monospace', fontSize: '30px', fontStyle: 'bold', color: '#00ffaa'
    }).setOrigin(0.5);
    this.targetText = this.add.text(width / 2, 88, 'Target: $100', {
      fontFamily: 'monospace', fontSize: '12px', color: '#666'
    }).setOrigin(0.5);

    // Budget section
    this.budgetY = height - 120;
    this.add.text(15, this.budgetY, 'STABILIZATION BUDGET', {
      fontFamily: 'monospace', fontSize: '10px', color: '#888'
    });
    this.budgetHintText = this.add.text(15, this.budgetY + 13, 'HOLD anywhere to buy support', {
      fontFamily: 'monospace', fontSize: '9px', color: '#00aaff'
    });
    this.budgetBarBg = this.add.rectangle(15, this.budgetY + 32, 150, 14, 0x1a2a3a).setOrigin(0, 0.5);
    this.budgetBarFill = this.add.rectangle(15, this.budgetY + 32, 150, 14, 0x00aaff).setOrigin(0, 0.5);
    this.budgetBarGlow = this.add.rectangle(15, this.budgetY + 32, 150, 14, 0x00aaff, 0).setOrigin(0, 0.5);

    // Greenshoe section
    this.greenshoeY = height - 62;
    this.add.text(15, this.greenshoeY, 'GREENSHOE OPTIONS', {
      fontFamily: 'monospace', fontSize: '10px', color: '#888'
    });
    this.greenshoeHintText = this.add.text(15, this.greenshoeY + 13, 'TAP to release shares', {
      fontFamily: 'monospace', fontSize: '9px', color: '#00ff88'
    });
    this.greenshoeIcons = [];
    for (let i = 0; i < 3; i++) {
      const icon = this.add.circle(35 + i * 32, this.greenshoeY + 40, 12, 0x00ff88);
      const glow = this.add.circle(35 + i * 32, this.greenshoeY + 40, 16, 0x00ff88, 0.25);
      this.greenshoeIcons.push({ icon, glow, active: true });
    }

    // Volatility indicator
    this.volText = this.add.text(width - 15, this.budgetY, 'VOLATILITY: LOW', {
      fontFamily: 'monospace', fontSize: '10px', color: '#00ff88'
    }).setOrigin(1, 0);
    this.volBarBg = this.add.rectangle(width - 15, this.budgetY + 20, 80, 8, 0x1a2a3a).setOrigin(1, 0.5);
    this.volBar = this.add.rectangle(width - 15, this.budgetY + 20, 80, 8, 0x00ff88).setOrigin(1, 0.5);

    // Action feedback area
    this.hintText = this.add.text(width / 2, height - 18, '', {
      fontFamily: 'monospace', fontSize: '12px', color: '#ffaa00', fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  createPriceChart() {
    const width = this.cameras.main.width;
    this.chartX = 15;
    this.chartY = 110;
    this.chartWidth = width - 30;
    this.chartHeight = 110;

    this.chartBg = this.add.rectangle(
      this.chartX + this.chartWidth / 2, 
      this.chartY + this.chartHeight / 2, 
      this.chartWidth, 
      this.chartHeight, 
      0x0a1520, 0.5
    );
    
    this.chartBorder = this.add.rectangle(
      this.chartX + this.chartWidth / 2, 
      this.chartY + this.chartHeight / 2, 
      this.chartWidth, 
      this.chartHeight
    ).setStrokeStyle(1, 0x1a3a5a, 0.4);

    // Target band (green zone)
    this.targetBand = this.add.rectangle(
      this.chartX + this.chartWidth / 2, 
      this.chartY + this.chartHeight / 2,
      this.chartWidth, 
      this.chartHeight * 0.28, 
      0x00ff88, 0.1
    );

    this.priceLine = this.add.graphics();
    this.priceGlowLine = this.add.graphics();
  }

  createOrderBook() {
    const width = this.cameras.main.width;
    this.orderBookY = this.chartY + this.chartHeight + 18;

    this.add.text(15, this.orderBookY, 'ORDER BOOK — Investor demand', {
      fontFamily: 'monospace', fontSize: '10px', color: '#888'
    });

    const lanes = [
      { name: 'Retail', color: 0x00aaff },
      { name: 'Long-Only', color: 0x00ff88 },
      { name: 'Hedge', color: 0xffaa00 },
      { name: 'Momentum', color: 0xff6688 }
    ];

    const laneWidth = (width - 40) / 4;
    this.laneBars = [];

    lanes.forEach((lane, i) => {
      const x = 20 + laneWidth * i + laneWidth / 2;
      
      this.add.text(x, this.orderBookY + 15, lane.name, {
        fontFamily: 'monospace', fontSize: '9px', color: '#aaa'
      }).setOrigin(0.5, 0);

      const barGlow = this.add.rectangle(x, this.orderBookY + 58, 38, 28, lane.color, 0.15).setOrigin(0.5, 1);
      const bar = this.add.rectangle(x, this.orderBookY + 58, 34, 28, lane.color, 0.75).setOrigin(0.5, 1);
      this.laneBars.push({ bar, barGlow, color: lane.color, demand: 45 + Math.random() * 20, targetDemand: 50 });
    });
  }

  createHoldIndicator() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.holdRing = this.add.graphics();
    this.holdProgress = 0;
    this.holdRing.setVisible(false);

    this.stabilizeOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x00aaff, 0);
    
    this.holdCenterText = this.add.text(width / 2, height / 2, '', {
      fontFamily: 'monospace', fontSize: '16px', color: '#00aaff', fontStyle: 'bold'
    }).setOrigin(0.5).setAlpha(0);
  }

  // NEW: Create invisible touch zones for better mobile responsiveness
  createTouchZones() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Full screen interactive zone
    this.touchZone = this.add.rectangle(width / 2, height / 2, width, height, 0xffffff, 0);
    this.touchZone.setInteractive({ useHandCursor: false });
    this.touchZone.setDepth(100); // Above everything
  }

  setupInput() {
    // Use the touch zone for input instead of global input
    this.touchZone.on('pointerdown', (pointer) => {
      this.handlePointerDown(pointer);
    });

    this.touchZone.on('pointerup', (pointer) => {
      this.handlePointerUp(pointer);
    });

    this.touchZone.on('pointerout', (pointer) => {
      // Handle pointer leaving the game area
      if (this.isHolding) {
        this.handlePointerUp(pointer);
      }
    });

    // Also handle global input as backup for mobile
    this.input.on('pointerdown', (pointer) => {
      if (!this.isHolding) {
        this.handlePointerDown(pointer);
      }
    });

    this.input.on('pointerup', (pointer) => {
      this.handlePointerUp(pointer);
    });

    // Touch-specific handlers for better mobile support
    this.input.addPointer(2); // Support multi-touch
  }

  handlePointerDown(pointer) {
    if (this.gameState.gameOver) return;
    
    this.pointerDownTime = this.time.now;
    this.isHolding = true;
    
    // Visual feedback immediately
    if (this.gameState.stabilizationBudget > 0) {
      this.holdRing.setVisible(true);
      this.holdCenterText.setText('HOLDING...');
      this.holdCenterText.setAlpha(0.5);
    }
    
    // Resume audio on first interaction
    if (this.callbacks.audioManager) {
      this.callbacks.audioManager.resume();
    }

    // Immediate visual feedback - pulse the price display
    this.tweens.add({
      targets: this.priceGlow,
      scale: 1.1,
      duration: 100,
      yoyo: true
    });
  }

  handlePointerUp(pointer) {
    if (!this.isHolding) return;
    
    const holdDuration = this.time.now - this.pointerDownTime;

    // TAP detection - more lenient timing for mobile (was 250, now 350)
    if (holdDuration < 350) {
      this.activateGreenshoe();
    }

    // Stop stabilization
    if (this.gameState.isStabilizing && this.callbacks.audioManager) {
      this.callbacks.audioManager.playStabilizeEnd();
    }

    this.isHolding = false;
    this.gameState.isStabilizing = false;
    this.holdRing.setVisible(false);
    this.holdProgress = 0;
    this.stabilizeOverlay.setAlpha(0);
    this.holdCenterText.setAlpha(0);
  }

  activateGreenshoe() {
    if (this.gameState.greenshoesRemaining <= 0 || this.gameState.gameOver) return;

    this.gameState.greenshoesRemaining--;
    this.gameState.greenshoesUsed++;

    // Play sound
    if (this.callbacks.audioManager) {
      this.callbacks.audioManager.playGreenshoe();
    }

    // Visual feedback - deactivate icon
    const iconIndex = 3 - this.gameState.greenshoesRemaining - 1;
    if (this.greenshoeIcons[iconIndex]) {
      const { icon, glow } = this.greenshoeIcons[iconIndex];
      this.tweens.add({
        targets: [icon, glow],
        alpha: 0.2,
        scale: 0.5,
        duration: 300,
        ease: 'Power2'
      });
      this.greenshoeIcons[iconIndex].active = false;
    }

    // Effect depends on current price - good timing = price > 105
    if (this.gameState.price > 105) {
      this.gameState.price *= 0.95;
      this.gameState.perfectGreenshoes++;
      this.showHint('✓ GREENSHOE COOLED THE PRICE!', '#00ff88');
    } else if (this.gameState.price > 102) {
      this.gameState.price *= 0.98;
      this.showHint('Greenshoe used — moderate effect', '#ffaa00');
    } else {
      this.showHint('⚠ Price was fine — greenshoe wasted', '#ff6666');
    }
    
    this.gameState.volatility *= 0.65;

    // Flash effect
    this.cameras.main.flash(200, 0, 255, 136);
    
    // Burst particles
    this.createBurstParticles(this.cameras.main.width / 2, this.cameras.main.height / 2, 0x00ff88);

    if (this.callbacks.onGreenshoe) {
      this.callbacks.onGreenshoe(this.gameState.greenshoesRemaining);
    }
  }

  createBurstParticles(x, y, color) {
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const particle = this.add.circle(x, y, 5, color, 0.9);
      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * 70,
        y: y + Math.sin(angle) * 70,
        alpha: 0,
        scale: 0.2,
        duration: 450,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
  }

  showHint(text, color = '#ffaa00') {
    this.hintText.setText(text);
    this.hintText.setColor(color);
    this.hintText.setAlpha(1);
    this.hintText.setScale(1.1);
    
    this.tweens.add({
      targets: this.hintText,
      scale: 1,
      duration: 150
    });
    
    this.tweens.add({
      targets: this.hintText,
      alpha: 0,
      duration: 600,
      delay: 2200
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

    if (this.callbacks.audioManager) {
      this.callbacks.audioManager.playPhaseTransition();
    }

    // Moderate volatility increase on phase change
    this.gameState.volatility += 0.02;

    this.cameras.main.flash(300, 0, 170, 255);
    
    this.tweens.add({
      targets: this.phaseText,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 200,
      yoyo: true
    });

    if (this.callbacks.onPhaseChange) {
      this.callbacks.onPhaseChange(phase);
    }
  }

  triggerDemandSurge() {
    const surge = 0.3 + Math.random() * 0.3; // Reduced intensity
    this.gameState.volatility += surge * 0.05;
    
    const randomLane = Math.floor(Math.random() * 4);
    this.laneBars[randomLane].targetDemand = Math.min(90, this.laneBars[randomLane].demand + 20);

    this.showHint('⚡ Demand surge incoming!', '#ffaa00');
    
    if (this.callbacks.audioManager) {
      this.callbacks.audioManager.playTick();
    }
  }

  triggerNewsEvent(positive) {
    const impact = 0.05 + Math.random() * 0.04; // Reduced from 0.08-0.15
    this.gameState.price *= positive ? (1 + impact) : (1 - impact);
    this.gameState.volatility += 0.03;

    if (positive) {
      this.showHint('📈 POSITIVE NEWS! Price rising', '#00ff88');
      this.cameras.main.flash(200, 0, 255, 100);
      if (this.callbacks.audioManager) {
        this.callbacks.audioManager.playPositiveNews();
      }
    } else {
      this.showHint('📉 NEGATIVE NEWS! Price falling', '#ff4444');
      this.cameras.main.shake(250, 0.008);
      if (this.callbacks.audioManager) {
        this.callbacks.audioManager.playNegativeNews();
      }
    }
  }

  gameLoop() {
    if (this.gameState.gameOver) return;

    this.gameState.totalTime += 0.15;
    this.tickCounter++;

    // Handle holding (stabilization) - more responsive
    if (this.isHolding && this.gameState.stabilizationBudget > 0) {
      const holdDuration = this.time.now - this.pointerDownTime;
      
      // Start stabilization after shorter hold (200ms instead of 250ms)
      if (holdDuration > 200) {
        if (!this.gameState.isStabilizing) {
          if (this.callbacks.audioManager) {
            this.callbacks.audioManager.playStabilizeStart();
          }
          this.showHint('STABILIZING...', '#00aaff');
        }
        
        this.gameState.isStabilizing = true;
        this.gameState.stabilizationBudget -= 0.6;
        this.gameState.budgetUsed += 0.6;
        this.gameState.stabilizationTime += 0.15;
        this.gameState.volatility *= 0.97;

        // Stronger price support when dropping
        if (this.gameState.price < 98) {
          this.gameState.price += 0.35;
        } else if (this.gameState.price < 100) {
          this.gameState.price += 0.15;
        }

        // Visual feedback
        this.stabilizeOverlay.setAlpha(0.06 + Math.sin(this.gameState.totalTime * 8) * 0.03);
        this.holdProgress = Math.min(1, holdDuration / 600);
        this.holdCenterText.setText('STABILIZING');
        this.holdCenterText.setAlpha(0.7);
        this.budgetBarGlow.setAlpha(0.4 + Math.sin(this.gameState.totalTime * 6) * 0.2);
      }
    } else {
      this.budgetBarGlow.setAlpha(0);
    }

    // Hide hold ring when budget depleted
    if (this.gameState.stabilizationBudget <= 0) {
      this.holdRing.setVisible(false);
      if (this.isHolding) {
        this.holdCenterText.setText('NO BUDGET');
        this.holdCenterText.setAlpha(0.7);
      }
      
      if (this.gameState.isStabilizing && this.callbacks.audioManager) {
        this.callbacks.audioManager.playStabilizeEnd();
        this.gameState.isStabilizing = false;
      }
    }

    // Price dynamics - SMOOTHER with less random noise
    this.updatePrice();
    this.updateUI();
    this.updateScore();
    this.updateParticles();
    this.updateGrid();

    // Update music intensity
    if (this.callbacks.audioManager && this.tickCounter % 4 === 0) {
      this.callbacks.audioManager.setIntensity(this.gameState.volatility * 4);
    }

    // Occasional tick sounds
    if (this.tickCounter % 20 === 0 && this.callbacks.audioManager) {
      this.callbacks.audioManager.playTick();
    }

    // Volatility warning
    if (this.gameState.volatility > 0.08 && 
        this.gameState.totalTime - this.gameState.lastVolatilityWarning > 8) {
      this.gameState.lastVolatilityWarning = this.gameState.totalTime;
      if (this.callbacks.audioManager) {
        this.callbacks.audioManager.playVolatilityWarning();
      }
    }

    if (this.callbacks.onStateUpdate) {
      this.callbacks.onStateUpdate({ ...this.gameState });
    }
  }

  updatePrice() {
    // SMOOTHER price movement - reduced noise and stronger mean reversion
    const noise = (Math.random() - 0.5) * 1.5 * this.gameState.volatility;
    const meanReversion = (this.gameState.targetPrice - this.gameState.price) * 0.012;
    
    this.gameState.price += this.gameState.price * (noise + meanReversion);
    this.gameState.price = Math.max(88, Math.min(115, this.gameState.price));

    this.gameState.priceHistory.push({ time: this.gameState.totalTime, price: this.gameState.price });
    if (this.gameState.priceHistory.length > 150) this.gameState.priceHistory.shift();

    // Slower volatility decay
    this.gameState.volatility = Math.max(0.02, this.gameState.volatility * 0.994);
    this.gameState.maxVolatility = Math.max(this.gameState.maxVolatility, this.gameState.volatility);
  }

  updateUI() {
    // Price with color and glow
    const priceColor = this.gameState.price >= 98 && this.gameState.price <= 102 ? '#00ff88' :
                       this.gameState.price >= 95 && this.gameState.price <= 105 ? '#ffaa00' : '#ff4444';
    const priceColorHex = this.gameState.price >= 98 && this.gameState.price <= 102 ? 0x00ff88 :
                          this.gameState.price >= 95 && this.gameState.price <= 105 ? 0xffaa00 : 0xff4444;
    
    this.priceText.setText(`$${this.gameState.price.toFixed(2)}`);
    this.priceText.setColor(priceColor);
    this.priceGlow.setFillStyle(priceColorHex, 0.12 + Math.sin(this.gameState.totalTime * 2) * 0.04);

    // Timer with urgency
    const remaining = Math.max(0, 90 - this.gameState.totalTime);
    this.timerText.setText(`${Math.ceil(remaining)}s`);
    if (remaining < 15) {
      this.timerText.setColor('#ff4444');
      this.timerText.setScale(1 + Math.sin(this.gameState.totalTime * 5) * 0.04);
    } else if (remaining < 30) {
      this.timerText.setColor('#ffaa00');
    }

    // Budget bar
    const budgetRatio = Math.max(0, this.gameState.stabilizationBudget / 100);
    this.budgetBarFill.setScale(budgetRatio, 1);
    const budgetColor = budgetRatio > 0.5 ? 0x00aaff : budgetRatio > 0.25 ? 0xffaa00 : 0xff4444;
    this.budgetBarFill.setFillStyle(budgetColor);
    
    // Update budget hint when low
    if (budgetRatio < 0.1) {
      this.budgetHintText.setText('Budget depleted!');
      this.budgetHintText.setColor('#ff4444');
    }

    // Volatility indicator
    let volLabel = 'LOW', volColor = '#00ff88', volColorHex = 0x00ff88;
    if (this.gameState.volatility > 0.08) { 
      volLabel = 'HIGH'; volColor = '#ff4444'; volColorHex = 0xff4444;
    } else if (this.gameState.volatility > 0.05) { 
      volLabel = 'MED'; volColor = '#ffaa00'; volColorHex = 0xffaa00;
    }
    this.volText.setText(`VOLATILITY: ${volLabel}`);
    this.volText.setColor(volColor);
    this.volBar.setFillStyle(volColorHex);
    this.volBar.setScale(Math.min(1, this.gameState.volatility * 10), 1);

    this.drawPriceChart();

    // Order book with smooth animations
    this.laneBars.forEach(lb => {
      lb.demand += (lb.targetDemand - lb.demand) * 0.08;
      lb.demand += (Math.random() - 0.5) * 1.5;
      lb.demand = Math.max(20, Math.min(90, lb.demand));
      lb.targetDemand += (50 - lb.targetDemand) * 0.015;
      
      const scale = lb.demand / 50;
      lb.bar.setScale(1, scale);
      lb.barGlow.setScale(1.1, scale * 1.1);
    });

    // Hold indicator ring
    if (this.isHolding && this.holdProgress > 0 && this.gameState.stabilizationBudget > 0) {
      this.holdRing.clear();
      this.holdRing.lineStyle(5, 0x00aaff, 0.9);
      const cx = this.cameras.main.width / 2;
      const cy = this.cameras.main.height / 2;
      this.holdRing.beginPath();
      this.holdRing.arc(cx, cy, 50, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * this.holdProgress);
      this.holdRing.strokePath();
      
      // Inner glow
      this.holdRing.lineStyle(10, 0x00aaff, 0.25);
      this.holdRing.beginPath();
      this.holdRing.arc(cx, cy, 50, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * this.holdProgress);
      this.holdRing.strokePath();
    }
  }

  drawPriceChart() {
    this.priceLine.clear();
    this.priceGlowLine.clear();
    
    const history = this.gameState.priceHistory;
    if (history.length < 2) return;

    const minPrice = 92, maxPrice = 112;
    const priceRange = maxPrice - minPrice;
    const points = history.slice(-60);
    const xStep = this.chartWidth / 60;

    // Glow line
    this.priceGlowLine.lineStyle(10, 0x00ffaa, 0.1);
    this.priceGlowLine.beginPath();
    points.forEach((point, i) => {
      const x = this.chartX + i * xStep;
      const y = this.chartY + this.chartHeight - ((point.price - minPrice) / priceRange) * this.chartHeight;
      if (i === 0) this.priceGlowLine.moveTo(x, y);
      else this.priceGlowLine.lineTo(x, y);
    });
    this.priceGlowLine.strokePath();

    // Main line
    this.priceLine.lineStyle(3, 0x00ffaa, 1);
    this.priceLine.beginPath();
    points.forEach((point, i) => {
      const x = this.chartX + i * xStep;
      const y = this.chartY + this.chartHeight - ((point.price - minPrice) / priceRange) * this.chartHeight;
      if (i === 0) this.priceLine.moveTo(x, y);
      else this.priceLine.lineTo(x, y);
    });
    this.priceLine.strokePath();

    // Current price dot
    const lastPoint = points[points.length - 1];
    const lastX = this.chartX + (points.length - 1) * xStep;
    const lastY = this.chartY + this.chartHeight - ((lastPoint.price - minPrice) / priceRange) * this.chartHeight;
    this.priceLine.fillStyle(0x00ffaa, 1);
    this.priceLine.fillCircle(lastX, lastY, 6);
    this.priceLine.fillStyle(0x00ffaa, 0.35);
    this.priceLine.fillCircle(lastX, lastY, 12);
  }

  updateParticles() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    this.particles.forEach(p => {
      p.x += p.velocity.x;
      p.y += p.velocity.y - this.gameState.volatility * 1.2;
      
      if (p.y < 0) p.y = height;
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      
      p.setAlpha(0.25 + Math.sin(this.gameState.totalTime * p.pulseSpeed * 50 + p.pulseOffset) * 0.15);
    });
  }

  updateScore() {
    const priceDev = Math.abs(this.gameState.price - 100) / 100;
    const stabInc = (1 - priceDev * 4) * 0.5;
    this.gameState.score.stability = Math.min(400, this.gameState.score.stability + Math.max(0, stabInc));

    const avgDemand = this.laneBars.reduce((s, b) => s + b.demand, 0) / 4;
    this.gameState.score.liquidity = Math.min(200, this.gameState.score.liquidity + (avgDemand > 40 ? 0.3 : 0.12));

    if (this.gameState.volatility < 0.06) {
      this.gameState.score.reputation = Math.min(200, this.gameState.score.reputation + 0.3);
    }
  }

  endGame() {
    this.gameState.gameOver = true;
    this.gameTimer.remove();

    // Efficiency score based on greenshoe timing
    const budgetEff = this.gameState.stabilizationBudget / 100;
    const gsEff = this.gameState.greenshoesUsed > 0 
      ? this.gameState.perfectGreenshoes / this.gameState.greenshoesUsed 
      : 0.5;
    this.gameState.score.efficiency = Math.min(200, (budgetEff * 80) + (gsEff * 120));

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
    if (this.gameState.maxVolatility < 0.07) badges.push({ id: 'smooth', name: 'Smooth Operator' });
    if (this.gameState.score.liquidity >= 180) badges.push({ id: 'demand', name: 'Demand Master' });
    if (this.gameState.budgetUsed < 50) badges.push({ id: 'budget', name: 'Budget Hawk' });
    if (this.gameState.perfectGreenshoes >= 2) badges.push({ id: 'timing', name: 'Perfect Timing' });

    if (this.callbacks.audioManager) {
      this.callbacks.audioManager.playGameEnd(totalScore >= 550);
    }

    const finalResult = {
      totalScore,
      rank,
      badges,
      scores: this.gameState.score,
      priceHistory: this.gameState.priceHistory,
      finalPrice: this.gameState.price,
      budgetRemaining: this.gameState.stabilizationBudget,
      greenshoesUsed: this.gameState.greenshoesUsed,
      maxVolatility: this.gameState.maxVolatility,
      perfectGreenshoes: this.gameState.perfectGreenshoes
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

  // Initialize audio on component mount
  useEffect(() => {
    if (!accessibilitySettings?.muteAudio) {
      audioManager.init();
    }
    return () => {
      audioManager.stopAmbientMusic();
    };
  }, [accessibilitySettings?.muteAudio]);

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
    const height = Math.min(window.innerHeight - 40, 680);

    const config = {
      type: Phaser.AUTO,
      width,
      height,
      parent: 'game-container',
      backgroundColor: '#0a0a12',
      scene: GreenshoeGameScene,
      input: {
        activePointers: 3, // Support multi-touch
        touch: {
          capture: true // Capture touch events
        }
      },
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
          onGameEnd: handleGameEnd,
          audioManager: accessibilitySettings?.muteAudio ? null : audioManager
        };
      }
    });

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [handlePhaseChange, handleGameEnd, accessibilitySettings?.muteAudio]);

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

      {/* Game canvas - improved touch handling */}
      <div 
        id="game-container" 
        ref={containerRef}
        className="w-full max-w-[400px] rounded-xl overflow-hidden shadow-2xl select-none"
        style={{ 
          boxShadow: '0 0 60px rgba(0, 255, 170, 0.15), 0 0 30px rgba(0, 170, 255, 0.1)',
          touchAction: 'none',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none'
        }}
      />
    </div>
  );
};

export default GameContainer;
