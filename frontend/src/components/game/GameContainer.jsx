import React, { useEffect, useRef, useState, useCallback } from 'react';
import Phaser from 'phaser';
import { audioManager } from '../../game/AudioManager';

// REDESIGNED: Decision-based gameplay with clear 3-5 second decision windows
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
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Initialize game state
    this.gameState = {
      phase: 0,
      roundNumber: 0,
      totalRounds: 12, // 12 decision rounds total
      price: 100,
      targetPrice: 100,
      stabilizationBudget: 100,
      greenshoesRemaining: 3,
      priceHistory: [{ time: 0, price: 100 }],
      gameOver: false,
      inDecisionMode: false,
      decisionTimer: 0,
      decisionTimeLimit: 7, // 7 seconds to decide
      currentScenario: null,
      score: { stability: 0, liquidity: 0, efficiency: 0, reputation: 0 },
      decisions: [], // Track all decisions made
      correctDecisions: 0,
      totalDecisions: 0
    };

    // Create all UI elements
    this.createBackground();
    this.createHeader();
    this.createPriceDisplay();
    this.createScenarioDisplay();
    this.createDecisionButtons();
    this.createResourceDisplay();
    this.createFeedbackDisplay();

    // Start the game flow
    this.time.delayedCall(1500, () => this.startNextRound());
  }

  createBackground() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Gradient background
    const graphics = this.add.graphics();
    for (let y = 0; y < height; y++) {
      const t = y / height;
      const r = Math.floor(8 + t * 8);
      const g = Math.floor(10 + t * 12);
      const b = Math.floor(20 + t * 15);
      graphics.lineStyle(1, Phaser.Display.Color.GetColor(r, g, b));
      graphics.lineBetween(0, y, width, y);
    }
    
    // Subtle grid
    graphics.lineStyle(1, 0x1a2a4a, 0.2);
    for (let x = 0; x < width; x += 40) {
      graphics.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 40) {
      graphics.lineBetween(0, y, width, y);
    }
  }

  createHeader() {
    const width = this.cameras.main.width;
    
    // Phase/Round indicator
    this.phaseText = this.add.text(20, 20, 'ROUND 1 of 12', {
      fontFamily: 'monospace', fontSize: '14px', color: '#00aaff'
    });
    
    this.phaseDescText = this.add.text(20, 40, 'Phase 1: Bookbuilding', {
      fontFamily: 'monospace', fontSize: '11px', color: '#666'
    });
    
    // Progress bar for rounds
    this.progressBg = this.add.rectangle(width - 20, 30, 100, 8, 0x1a2a3a).setOrigin(1, 0.5);
    this.progressFill = this.add.rectangle(width - 120, 30, 0, 8, 0x00aaff).setOrigin(0, 0.5);
  }

  createPriceDisplay() {
    const width = this.cameras.main.width;
    
    // Large price display
    this.priceContainer = this.add.container(width / 2, 100);
    
    this.priceGlow = this.add.circle(0, 0, 70, 0x00ffaa, 0.15);
    this.priceContainer.add(this.priceGlow);
    
    this.priceText = this.add.text(0, -10, '$100.00', {
      fontFamily: 'monospace', fontSize: '36px', fontStyle: 'bold', color: '#00ffaa'
    }).setOrigin(0.5);
    this.priceContainer.add(this.priceText);
    
    this.targetText = this.add.text(0, 25, 'Target: $100', {
      fontFamily: 'monospace', fontSize: '12px', color: '#666'
    }).setOrigin(0.5);
    this.priceContainer.add(this.targetText);
    
    // Price change indicator
    this.priceChangeText = this.add.text(0, 50, '', {
      fontFamily: 'monospace', fontSize: '14px', fontStyle: 'bold', color: '#ffaa00'
    }).setOrigin(0.5);
    this.priceContainer.add(this.priceChangeText);
    
    // Mini price chart
    this.chartGraphics = this.add.graphics();
    this.chartX = 30;
    this.chartY = 170;
    this.chartWidth = width - 60;
    this.chartHeight = 80;
    
    // Chart border
    this.add.rectangle(this.chartX + this.chartWidth/2, this.chartY + this.chartHeight/2, 
      this.chartWidth, this.chartHeight, 0x0a1520, 0.5);
    this.add.rectangle(this.chartX + this.chartWidth/2, this.chartY + this.chartHeight/2, 
      this.chartWidth, this.chartHeight).setStrokeStyle(1, 0x1a3a5a, 0.3);
  }

  createScenarioDisplay() {
    const width = this.cameras.main.width;
    
    // Scenario box - shows what's happening in the market
    this.scenarioContainer = this.add.container(width / 2, 310);
    
    this.scenarioBg = this.add.rectangle(0, 0, width - 40, 100, 0x0a1520, 0.8)
      .setStrokeStyle(2, 0x1a3a5a);
    this.scenarioContainer.add(this.scenarioBg);
    
    this.scenarioIcon = this.add.text(0, -25, '📊', {
      fontSize: '28px'
    }).setOrigin(0.5);
    this.scenarioContainer.add(this.scenarioIcon);
    
    this.scenarioTitle = this.add.text(0, 5, 'Market Update', {
      fontFamily: 'monospace', fontSize: '16px', fontStyle: 'bold', color: '#fff'
    }).setOrigin(0.5);
    this.scenarioContainer.add(this.scenarioTitle);
    
    this.scenarioDesc = this.add.text(0, 28, 'Waiting for market activity...', {
      fontFamily: 'monospace', fontSize: '11px', color: '#aaa', wordWrap: { width: width - 80 }
    }).setOrigin(0.5);
    this.scenarioContainer.add(this.scenarioDesc);
    
    // Decision timer bar
    this.timerBarBg = this.add.rectangle(0, 55, width - 60, 6, 0x1a2a3a).setOrigin(0.5);
    this.scenarioContainer.add(this.timerBarBg);
    
    this.timerBarFill = this.add.rectangle(-(width - 60)/2, 55, width - 60, 6, 0x00aaff).setOrigin(0, 0.5);
    this.scenarioContainer.add(this.timerBarFill);
    
    this.timerText = this.add.text(0, 55, '', {
      fontFamily: 'monospace', fontSize: '10px', color: '#fff'
    }).setOrigin(0.5);
    this.scenarioContainer.add(this.timerText);
    
    this.scenarioContainer.setVisible(false);
  }

  createDecisionButtons() {
    const width = this.cameras.main.width;
    const buttonY = 440;
    const buttonWidth = (width - 50) / 3;
    const buttonHeight = 100;
    
    this.buttonsContainer = this.add.container(0, 0);
    
    // Button configurations
    const buttons = [
      { 
        id: 'demand', 
        label: 'ADD\nDEMAND', 
        sublabel: 'Buy Support',
        color: 0x0088ff, 
        icon: '🛡️',
        hint: 'Use when price\nis FALLING'
      },
      { 
        id: 'nothing', 
        label: 'DO\nNOTHING', 
        sublabel: 'Let it ride',
        color: 0x444444, 
        icon: '⏸️',
        hint: 'Use when price\nis STABLE'
      },
      { 
        id: 'supply', 
        label: 'ADD\nSUPPLY', 
        sublabel: 'Greenshoe',
        color: 0x00aa55, 
        icon: '📈',
        hint: 'Use when price\nis RISING'
      }
    ];
    
    this.decisionButtons = [];
    
    buttons.forEach((btn, i) => {
      const x = 15 + i * (buttonWidth + 10) + buttonWidth / 2;
      
      // Button background
      const bg = this.add.rectangle(x, buttonY, buttonWidth, buttonHeight, btn.color, 0.2)
        .setStrokeStyle(2, btn.color, 0.6)
        .setInteractive({ useHandCursor: true });
      
      // Glow effect (hidden by default)
      const glow = this.add.rectangle(x, buttonY, buttonWidth + 10, buttonHeight + 10, btn.color, 0)
        .setStrokeStyle(4, btn.color, 0);
      
      // Icon
      const icon = this.add.text(x, buttonY - 28, btn.icon, {
        fontSize: '24px'
      }).setOrigin(0.5);
      
      // Label
      const label = this.add.text(x, buttonY + 5, btn.label, {
        fontFamily: 'monospace', fontSize: '12px', fontStyle: 'bold', color: '#fff',
        align: 'center'
      }).setOrigin(0.5);
      
      // Sublabel
      const sublabel = this.add.text(x, buttonY + 35, btn.sublabel, {
        fontFamily: 'monospace', fontSize: '9px', color: '#888'
      }).setOrigin(0.5);
      
      // Hint text (when to use)
      const hint = this.add.text(x, buttonY + 55, btn.hint, {
        fontFamily: 'monospace', fontSize: '8px', color: '#555', align: 'center'
      }).setOrigin(0.5);
      
      // Button interactions
      bg.on('pointerover', () => {
        if (this.gameState.inDecisionMode) {
          bg.setFillStyle(btn.color, 0.4);
          glow.setAlpha(0.3);
        }
      });
      
      bg.on('pointerout', () => {
        bg.setFillStyle(btn.color, 0.2);
        glow.setAlpha(0);
      });
      
      bg.on('pointerdown', () => {
        if (this.gameState.inDecisionMode) {
          this.makeDecision(btn.id);
        }
      });
      
      this.buttonsContainer.add([glow, bg, icon, label, sublabel, hint]);
      this.decisionButtons.push({ bg, glow, icon, label, id: btn.id, color: btn.color });
    });
    
    // Disabled overlay
    this.buttonsDisabledOverlay = this.add.rectangle(width/2, buttonY, width, buttonHeight + 20, 0x000000, 0.7);
    this.buttonsDisabledText = this.add.text(width/2, buttonY, 'Waiting for market...', {
      fontFamily: 'monospace', fontSize: '14px', color: '#666'
    }).setOrigin(0.5);
    
    this.setButtonsEnabled(false);
  }

  createResourceDisplay() {
    const width = this.cameras.main.width;
    const y = 560;
    
    // Stabilization budget
    this.add.text(20, y, 'STABILIZATION BUDGET', {
      fontFamily: 'monospace', fontSize: '9px', color: '#666'
    });
    this.budgetBarBg = this.add.rectangle(20, y + 18, 120, 10, 0x1a2a3a).setOrigin(0, 0.5);
    this.budgetBarFill = this.add.rectangle(20, y + 18, 120, 10, 0x0088ff).setOrigin(0, 0.5);
    this.budgetText = this.add.text(145, y + 18, '100%', {
      fontFamily: 'monospace', fontSize: '10px', color: '#0088ff'
    }).setOrigin(0, 0.5);
    
    // Greenshoe count
    this.add.text(width - 20, y, 'GREENSHOES', {
      fontFamily: 'monospace', fontSize: '9px', color: '#666'
    }).setOrigin(1, 0);
    
    this.greenshoeIcons = [];
    for (let i = 0; i < 3; i++) {
      const icon = this.add.circle(width - 25 - i * 28, y + 18, 10, 0x00aa55);
      this.greenshoeIcons.push(icon);
    }
    
    // Score display
    this.add.text(20, y + 40, 'CORRECT DECISIONS', {
      fontFamily: 'monospace', fontSize: '9px', color: '#666'
    });
    this.scoreText = this.add.text(20, y + 55, '0 / 0', {
      fontFamily: 'monospace', fontSize: '16px', fontStyle: 'bold', color: '#00ffaa'
    });
  }

  createFeedbackDisplay() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Full screen feedback overlay
    this.feedbackContainer = this.add.container(width / 2, height / 2);
    
    this.feedbackBg = this.add.rectangle(0, 0, width, height, 0x000000, 0.85);
    this.feedbackContainer.add(this.feedbackBg);
    
    this.feedbackIcon = this.add.text(0, -60, '✓', {
      fontSize: '60px', color: '#00ff88'
    }).setOrigin(0.5);
    this.feedbackContainer.add(this.feedbackIcon);
    
    this.feedbackTitle = this.add.text(0, 10, 'CORRECT!', {
      fontFamily: 'monospace', fontSize: '28px', fontStyle: 'bold', color: '#00ff88'
    }).setOrigin(0.5);
    this.feedbackContainer.add(this.feedbackTitle);
    
    this.feedbackDesc = this.add.text(0, 50, 'Price stabilized', {
      fontFamily: 'monospace', fontSize: '14px', color: '#aaa'
    }).setOrigin(0.5);
    this.feedbackContainer.add(this.feedbackDesc);
    
    this.feedbackPriceChange = this.add.text(0, 85, '', {
      fontFamily: 'monospace', fontSize: '18px', fontStyle: 'bold', color: '#fff'
    }).setOrigin(0.5);
    this.feedbackContainer.add(this.feedbackPriceChange);
    
    this.feedbackContainer.setVisible(false);
    this.feedbackContainer.setDepth(100);
  }

  setButtonsEnabled(enabled) {
    this.buttonsDisabledOverlay.setVisible(!enabled);
    this.buttonsDisabledText.setVisible(!enabled);
    
    this.decisionButtons.forEach(btn => {
      btn.bg.setAlpha(enabled ? 1 : 0.3);
    });
  }

  // Generate market scenarios
  generateScenario() {
    const scenarios = [
      // Price Rising scenarios
      {
        type: 'rising',
        icon: '📈',
        title: 'Demand Surge!',
        desc: 'Investors are piling in. Price is climbing fast!',
        priceMove: 4 + Math.random() * 4, // +4 to +8
        correctAction: 'supply',
        wrongPenalty: 6,
        rightReward: 2
      },
      {
        type: 'rising',
        icon: '🔥',
        title: 'FOMO Buying!',
        desc: 'Fear of missing out is driving rapid buying.',
        priceMove: 5 + Math.random() * 5,
        correctAction: 'supply',
        wrongPenalty: 7,
        rightReward: 3
      },
      {
        type: 'rising',
        icon: '🚀',
        title: 'Momentum Building!',
        desc: 'Hedge funds are aggressively buying.',
        priceMove: 3 + Math.random() * 4,
        correctAction: 'supply',
        wrongPenalty: 5,
        rightReward: 2
      },
      // Price Falling scenarios
      {
        type: 'falling',
        icon: '📉',
        title: 'Selling Pressure!',
        desc: 'Early investors taking profits. Price dropping!',
        priceMove: -(4 + Math.random() * 4),
        correctAction: 'demand',
        wrongPenalty: 6,
        rightReward: 2
      },
      {
        type: 'falling',
        icon: '😰',
        title: 'Panic Selling!',
        desc: 'Negative sentiment spreading. Investors exiting.',
        priceMove: -(5 + Math.random() * 5),
        correctAction: 'demand',
        wrongPenalty: 7,
        rightReward: 3
      },
      {
        type: 'falling',
        icon: '⚠️',
        title: 'Market Wobble!',
        desc: 'Uncertainty causing selloff.',
        priceMove: -(3 + Math.random() * 3),
        correctAction: 'demand',
        wrongPenalty: 5,
        rightReward: 2
      },
      // Stable scenarios
      {
        type: 'stable',
        icon: '⚖️',
        title: 'Balanced Trading',
        desc: 'Buy and sell orders are well matched.',
        priceMove: (Math.random() - 0.5) * 2,
        correctAction: 'nothing',
        wrongPenalty: 4,
        rightReward: 3
      },
      {
        type: 'stable',
        icon: '😌',
        title: 'Calm Markets',
        desc: 'Trading is orderly. No intervention needed.',
        priceMove: (Math.random() - 0.5) * 1.5,
        correctAction: 'nothing',
        wrongPenalty: 4,
        rightReward: 3
      },
      {
        type: 'stable',
        icon: '✨',
        title: 'Perfect Balance',
        desc: 'Supply and demand in equilibrium.',
        priceMove: (Math.random() - 0.5) * 1,
        correctAction: 'nothing',
        wrongPenalty: 3,
        rightReward: 4
      }
    ];
    
    // Weight scenarios based on phase
    let filtered = scenarios;
    if (this.gameState.phase === 0) {
      // Phase 1: More rising scenarios (IPO hype)
      filtered = scenarios.filter(s => s.type === 'rising' || s.type === 'stable');
    } else if (this.gameState.phase === 1) {
      // Phase 2: Mixed
      filtered = scenarios;
    } else {
      // Phase 3: More volatility
      filtered = scenarios.filter(s => s.type !== 'stable' || Math.random() > 0.5);
    }
    
    return filtered[Math.floor(Math.random() * filtered.length)];
  }

  startNextRound() {
    if (this.gameState.gameOver) return;
    
    this.gameState.roundNumber++;
    
    // Check if game is over
    if (this.gameState.roundNumber > this.gameState.totalRounds) {
      this.endGame();
      return;
    }
    
    // Update phase (4 rounds per phase)
    const newPhase = Math.floor((this.gameState.roundNumber - 1) / 4);
    if (newPhase !== this.gameState.phase) {
      this.gameState.phase = newPhase;
      this.showPhaseTransition(newPhase);
      return; // Phase transition will call startNextRound after
    }
    
    // Generate scenario
    const scenario = this.generateScenario();
    this.gameState.currentScenario = scenario;
    
    // Update UI
    this.updateRoundDisplay();
    
    // Show scenario and enable decisions
    this.showScenario(scenario);
  }

  showPhaseTransition(phase) {
    const phases = ['Bookbuilding Rush', 'First Print', 'Aftermarket Wave'];
    const descs = ['Managing initial demand', 'Price discovery begins', 'Reacting to news'];
    
    // Flash effect
    this.cameras.main.flash(400, 0, 170, 255);
    
    if (this.callbacks.audioManager) {
      this.callbacks.audioManager.playPhaseTransition();
    }
    
    this.phaseDescText.setText(`Phase ${phase + 1}: ${phases[phase]}`);
    
    // Show phase overlay
    this.feedbackContainer.setVisible(true);
    this.feedbackIcon.setText(['📋', '💹', '📰'][phase]);
    this.feedbackTitle.setText(`PHASE ${phase + 1}`);
    this.feedbackTitle.setColor('#00aaff');
    this.feedbackDesc.setText(phases[phase]);
    this.feedbackPriceChange.setText(descs[phase]);
    
    this.time.delayedCall(2000, () => {
      this.feedbackContainer.setVisible(false);
      this.startNextRound();
    });
  }

  showScenario(scenario) {
    // Update scenario display
    this.scenarioContainer.setVisible(true);
    this.scenarioIcon.setText(scenario.icon);
    this.scenarioTitle.setText(scenario.title);
    this.scenarioDesc.setText(scenario.desc);
    
    // Color code the scenario box based on type
    const colors = {
      rising: { border: 0xff6644, bg: 0xff6644 },
      falling: { border: 0x4488ff, bg: 0x4488ff },
      stable: { border: 0x888888, bg: 0x888888 }
    };
    this.scenarioBg.setStrokeStyle(3, colors[scenario.type].border, 0.8);
    
    // Animate scenario appearance
    this.scenarioContainer.setScale(0.8);
    this.scenarioContainer.setAlpha(0);
    this.tweens.add({
      targets: this.scenarioContainer,
      scale: 1,
      alpha: 1,
      duration: 300,
      ease: 'Back.out'
    });
    
    // Preview the price movement
    this.previewPriceMove(scenario.priceMove);
    
    // Start decision timer
    this.gameState.inDecisionMode = true;
    this.gameState.decisionTimer = this.gameState.decisionTimeLimit;
    this.setButtonsEnabled(true);
    
    // Highlight the recommended button based on scenario type
    this.highlightCorrectButton(scenario.correctAction);
    
    // Timer countdown
    this.timerEvent = this.time.addEvent({
      delay: 100,
      callback: () => this.updateDecisionTimer(),
      loop: true
    });
    
    if (this.callbacks.audioManager) {
      this.callbacks.audioManager.playTick();
    }
  }

  highlightCorrectButton(correctAction) {
    // Subtle hint - pulse the correct button's border
    const correctBtn = this.decisionButtons.find(b => b.id === correctAction);
    if (correctBtn) {
      this.tweens.add({
        targets: correctBtn.glow,
        alpha: 0.15,
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    }
  }

  previewPriceMove(priceMove) {
    const direction = priceMove > 1 ? '↑' : priceMove < -1 ? '↓' : '→';
    const color = priceMove > 1 ? '#ff6644' : priceMove < -1 ? '#4488ff' : '#888888';
    const magnitude = Math.abs(priceMove) > 5 ? ' FAST!' : '';
    
    this.priceChangeText.setText(`${direction} ${priceMove > 0 ? '+' : ''}${priceMove.toFixed(1)}%${magnitude}`);
    this.priceChangeText.setColor(color);
    
    // Animate price change indicator
    this.tweens.add({
      targets: this.priceChangeText,
      y: priceMove > 0 ? 45 : 55,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }

  updateDecisionTimer() {
    if (!this.gameState.inDecisionMode) {
      if (this.timerEvent) this.timerEvent.remove();
      return;
    }
    
    this.gameState.decisionTimer -= 0.1;
    
    // Update timer bar
    const progress = this.gameState.decisionTimer / this.gameState.decisionTimeLimit;
    const barWidth = (this.cameras.main.width - 60) * progress;
    this.timerBarFill.setScale(progress, 1);
    
    // Color changes as time runs out
    if (progress < 0.3) {
      this.timerBarFill.setFillStyle(0xff4444);
    } else if (progress < 0.6) {
      this.timerBarFill.setFillStyle(0xffaa00);
    }
    
    this.timerText.setText(`${this.gameState.decisionTimer.toFixed(1)}s`);
    
    // Time's up - auto select "do nothing"
    if (this.gameState.decisionTimer <= 0) {
      this.makeDecision('nothing', true);
    }
  }

  makeDecision(action, timedOut = false) {
    if (!this.gameState.inDecisionMode) return;
    
    this.gameState.inDecisionMode = false;
    this.setButtonsEnabled(false);
    if (this.timerEvent) this.timerEvent.remove();
    
    // Stop all button tweens
    this.tweens.killTweensOf(this.decisionButtons.map(b => b.glow));
    this.decisionButtons.forEach(b => b.glow.setAlpha(0));
    
    // Stop price change animation
    this.tweens.killTweensOf(this.priceChangeText);
    this.priceChangeText.setY(50);
    
    const scenario = this.gameState.currentScenario;
    const isCorrect = action === scenario.correctAction;
    
    // Check resource availability
    let canPerformAction = true;
    let resourceError = null;
    if (action === 'demand' && this.gameState.stabilizationBudget < 15) {
      canPerformAction = false;
      resourceError = 'budget';
    }
    if (action === 'supply' && this.gameState.greenshoesRemaining <= 0) {
      canPerformAction = false;
      resourceError = 'greenshoe';
    }
    
    // Calculate price impact based on decision accuracy
    // Base price move from scenario
    let finalPriceChange = 0;
    let decisionResult = '';
    
    if (!canPerformAction) {
      // Can't perform action - price moves naturally
      finalPriceChange = scenario.priceMove;
      decisionResult = 'no_resource';
    } else if (isCorrect) {
      // CORRECT DECISION
      this.gameState.correctDecisions++;
      
      if (action === 'demand') {
        // Correctly bought support during falling price
        // Price recovers significantly (mitigates 85% of the drop)
        finalPriceChange = scenario.priceMove * 0.15;
        this.gameState.stabilizationBudget -= 15;
        decisionResult = 'correct_demand';
      } else if (action === 'supply') {
        // Correctly added supply during rising price  
        // Price cools down significantly (mitigates 85% of the rise)
        finalPriceChange = scenario.priceMove * 0.15;
        this.gameState.greenshoesRemaining--;
        this.updateGreenshoeDisplay();
        decisionResult = 'correct_supply';
      } else {
        // Correctly did nothing during stable market
        // Price stays stable (small natural movement)
        finalPriceChange = scenario.priceMove;
        decisionResult = 'correct_nothing';
      }
    } else {
      // WRONG DECISION
      if (action === 'demand' && scenario.type === 'rising') {
        // Wrong: Bought support when price was rising
        // This adds MORE demand, pushing price even higher!
        finalPriceChange = scenario.priceMove * 1.6 + 3;
        this.gameState.stabilizationBudget -= 15;
        decisionResult = 'wrong_demand_rising';
      } else if (action === 'demand' && scenario.type === 'stable') {
        // Wrong: Bought support when market was stable
        // Wastes budget, slight upward price push
        finalPriceChange = scenario.priceMove + 2;
        this.gameState.stabilizationBudget -= 15;
        decisionResult = 'wrong_demand_stable';
      } else if (action === 'supply' && scenario.type === 'falling') {
        // Wrong: Added supply when price was falling
        // This adds MORE supply, crashing the price further!
        finalPriceChange = scenario.priceMove * 1.6 - 3;
        this.gameState.greenshoesRemaining--;
        this.updateGreenshoeDisplay();
        decisionResult = 'wrong_supply_falling';
      } else if (action === 'supply' && scenario.type === 'stable') {
        // Wrong: Added supply when market was stable
        // Wastes greenshoe, slight downward price push
        finalPriceChange = scenario.priceMove - 2;
        this.gameState.greenshoesRemaining--;
        this.updateGreenshoeDisplay();
        decisionResult = 'wrong_supply_stable';
      } else if (action === 'nothing' && scenario.type === 'rising') {
        // Wrong: Did nothing when price was rising
        // Price rises unchecked
        finalPriceChange = scenario.priceMove * 1.1;
        decisionResult = 'wrong_nothing_rising';
      } else if (action === 'nothing' && scenario.type === 'falling') {
        // Wrong: Did nothing when price was falling
        // Price falls unchecked
        finalPriceChange = scenario.priceMove * 1.1;
        decisionResult = 'wrong_nothing_falling';
      }
    }
    
    this.gameState.totalDecisions++;
    
    // Apply price change
    const oldPrice = this.gameState.price;
    this.gameState.price = Math.max(82, Math.min(125, this.gameState.price * (1 + finalPriceChange / 100)));
    
    // Record in history
    this.gameState.priceHistory.push({
      time: this.gameState.roundNumber,
      price: this.gameState.price
    });
    
    // Update score
    this.updateScore(isCorrect, Math.abs(this.gameState.price - 100));
    
    // Show feedback with detailed result
    this.showFeedback(isCorrect, action, scenario, oldPrice, this.gameState.price, timedOut, canPerformAction, decisionResult, resourceError);
  }

  showFeedback(isCorrect, action, scenario, oldPrice, newPrice, timedOut, canPerformAction, decisionResult, resourceError) {
    this.feedbackContainer.setVisible(true);
    
    // Detailed feedback based on decision result
    const feedbackMessages = {
      // Correct decisions
      'correct_demand': {
        icon: '✓',
        title: 'GREAT CALL!',
        color: '#00ff88',
        desc: 'Your buy support absorbed the selling pressure and stabilized the price!'
      },
      'correct_supply': {
        icon: '✓', 
        title: 'PERFECT TIMING!',
        color: '#00ff88',
        desc: 'The greenshoe released extra shares and cooled the overheating demand!'
      },
      'correct_nothing': {
        icon: '✓',
        title: 'SMART MOVE!',
        color: '#00ff88', 
        desc: 'The market was balanced — no intervention needed. Resources saved!'
      },
      // Wrong decisions
      'wrong_demand_rising': {
        icon: '✗',
        title: 'WRONG MOVE!',
        color: '#ff4444',
        desc: 'You added MORE demand when price was already rising! It spiked even higher.'
      },
      'wrong_demand_stable': {
        icon: '✗',
        title: 'WASTED BUDGET!',
        color: '#ff8844',
        desc: 'Market was stable — buying support was unnecessary and pushed price up.'
      },
      'wrong_supply_falling': {
        icon: '✗',
        title: 'WRONG MOVE!',
        color: '#ff4444',
        desc: 'You added MORE supply when price was already falling! It crashed further.'
      },
      'wrong_supply_stable': {
        icon: '✗',
        title: 'WASTED GREENSHOE!',
        color: '#ff8844',
        desc: 'Market was stable — adding supply was unnecessary and pushed price down.'
      },
      'wrong_nothing_rising': {
        icon: '✗',
        title: 'SHOULD HAVE ACTED!',
        color: '#ff6644',
        desc: 'Price was spiking — you should have used a greenshoe to add supply!'
      },
      'wrong_nothing_falling': {
        icon: '✗',
        title: 'SHOULD HAVE ACTED!',
        color: '#ff6644',
        desc: 'Price was dropping — you should have bought support to add demand!'
      },
      'no_resource': {
        icon: '🚫',
        title: 'NO RESOURCES!',
        color: '#ff8800',
        desc: resourceError === 'budget' ? 'Out of stabilization budget!' : 'No greenshoes remaining!'
      }
    };
    
    const feedback = feedbackMessages[decisionResult] || {
      icon: '?',
      title: 'UNKNOWN',
      color: '#888888',
      desc: 'Something unexpected happened.'
    };
    
    // Handle timeout special case
    if (timedOut) {
      if (isCorrect) {
        feedback.icon = '⏰';
        feedback.title = 'TIME UP - But OK!';
        feedback.color = '#88ff88';
        feedback.desc = 'You ran out of time, but doing nothing was the right call here!';
      } else {
        feedback.icon = '⏰';
        feedback.title = 'TIME UP!';
        feedback.color = '#ff8844';
      }
    }
    
    this.feedbackIcon.setText(feedback.icon);
    this.feedbackTitle.setText(feedback.title);
    this.feedbackTitle.setColor(feedback.color);
    this.feedbackDesc.setText(feedback.desc);
    
    // Show price change with clear direction
    const change = newPrice - oldPrice;
    const changeText = change >= 0 ? `+$${change.toFixed(2)}` : `-$${Math.abs(change).toFixed(2)}`;
    const isCloserToTarget = Math.abs(newPrice - 100) < Math.abs(oldPrice - 100);
    
    this.feedbackPriceChange.setText(
      `$${oldPrice.toFixed(2)} → $${newPrice.toFixed(2)} (${changeText})`
    );
    this.feedbackPriceChange.setColor(isCloserToTarget ? '#00ff88' : '#ff4444');
    
    // Play appropriate sound
    if (this.callbacks.audioManager) {
      if (isCorrect) {
        this.callbacks.audioManager.playGreenshoe();
      } else {
        this.callbacks.audioManager.playNegativeNews();
      }
    }
    
    // Screen shake for wrong answers
    if (!isCorrect && decisionResult !== 'no_resource') {
      this.cameras.main.shake(300, 0.012);
    }
    
    // Update displays
    this.updatePriceDisplay();
    this.updateBudgetDisplay();
    this.updateScoreDisplay();
    this.drawChart();
    
    // Animate feedback
    this.feedbackContainer.setScale(0.8);
    this.tweens.add({
      targets: this.feedbackContainer,
      scale: 1,
      duration: 200,
      ease: 'Back.out'
    });
    
    // Hide feedback and continue
    this.time.delayedCall(2500, () => {
      this.feedbackContainer.setVisible(false);
      this.scenarioContainer.setVisible(false);
      this.priceChangeText.setText('');
      this.time.delayedCall(600, () => this.startNextRound());
    });
  }

  updateRoundDisplay() {
    this.phaseText.setText(`ROUND ${this.gameState.roundNumber} of ${this.gameState.totalRounds}`);
    
    // Update progress bar
    const progress = this.gameState.roundNumber / this.gameState.totalRounds;
    this.progressFill.setScale(progress, 1);
  }

  updatePriceDisplay() {
    const price = this.gameState.price;
    const priceColor = price >= 98 && price <= 102 ? '#00ff88' :
                       price >= 95 && price <= 105 ? '#ffaa00' : '#ff4444';
    const priceColorHex = price >= 98 && price <= 102 ? 0x00ff88 :
                          price >= 95 && price <= 105 ? 0xffaa00 : 0xff4444;
    
    this.priceText.setText(`$${price.toFixed(2)}`);
    this.priceText.setColor(priceColor);
    this.priceGlow.setFillStyle(priceColorHex, 0.15);
  }

  updateBudgetDisplay() {
    const ratio = this.gameState.stabilizationBudget / 100;
    this.budgetBarFill.setScale(ratio, 1);
    this.budgetText.setText(`${Math.round(this.gameState.stabilizationBudget)}%`);
    
    const color = ratio > 0.5 ? 0x0088ff : ratio > 0.25 ? 0xffaa00 : 0xff4444;
    this.budgetBarFill.setFillStyle(color);
    this.budgetText.setColor(ratio > 0.5 ? '#0088ff' : ratio > 0.25 ? '#ffaa00' : '#ff4444');
  }

  updateGreenshoeDisplay() {
    for (let i = 0; i < 3; i++) {
      const hasThis = i < this.gameState.greenshoesRemaining;
      this.greenshoeIcons[2-i].setFillStyle(hasThis ? 0x00aa55 : 0x333333);
      this.greenshoeIcons[2-i].setAlpha(hasThis ? 1 : 0.4);
    }
  }

  updateScoreDisplay() {
    this.scoreText.setText(`${this.gameState.correctDecisions} / ${this.gameState.totalDecisions}`);
  }

  updateScore(isCorrect, priceDeviation) {
    if (isCorrect) {
      this.gameState.score.stability += 30;
      this.gameState.score.efficiency += 15;
    }
    
    if (priceDeviation < 3) {
      this.gameState.score.reputation += 10;
    }
    
    this.gameState.score.liquidity += 12;
  }

  drawChart() {
    this.chartGraphics.clear();
    
    const history = this.gameState.priceHistory;
    if (history.length < 2) return;
    
    const minPrice = 90, maxPrice = 115;
    const priceRange = maxPrice - minPrice;
    
    // Draw target zone
    this.chartGraphics.fillStyle(0x00ff88, 0.1);
    const zoneTop = this.chartY + this.chartHeight * (1 - (105 - minPrice) / priceRange);
    const zoneBottom = this.chartY + this.chartHeight * (1 - (95 - minPrice) / priceRange);
    this.chartGraphics.fillRect(this.chartX, zoneTop, this.chartWidth, zoneBottom - zoneTop);
    
    // Draw price line
    this.chartGraphics.lineStyle(3, 0x00ffaa, 1);
    this.chartGraphics.beginPath();
    
    const xStep = this.chartWidth / Math.max(12, history.length - 1);
    history.forEach((point, i) => {
      const x = this.chartX + i * xStep;
      const y = this.chartY + this.chartHeight * (1 - (point.price - minPrice) / priceRange);
      
      if (i === 0) this.chartGraphics.moveTo(x, y);
      else this.chartGraphics.lineTo(x, y);
    });
    this.chartGraphics.strokePath();
    
    // Draw current price dot
    const lastPoint = history[history.length - 1];
    const lastX = this.chartX + (history.length - 1) * xStep;
    const lastY = this.chartY + this.chartHeight * (1 - (lastPoint.price - minPrice) / priceRange);
    
    this.chartGraphics.fillStyle(0x00ffaa, 1);
    this.chartGraphics.fillCircle(lastX, lastY, 6);
  }

  endGame() {
    this.gameState.gameOver = true;
    
    // Calculate final score
    const accuracyBonus = (this.gameState.correctDecisions / this.gameState.totalDecisions) * 200;
    const priceBonus = Math.max(0, 100 - Math.abs(this.gameState.price - 100) * 10);
    
    const totalScore = Math.round(
      this.gameState.score.stability +
      this.gameState.score.liquidity +
      this.gameState.score.efficiency +
      this.gameState.score.reputation +
      accuracyBonus +
      priceBonus
    );
    
    let rank = 'Analyst';
    if (totalScore >= 800) rank = 'Managing Director';
    else if (totalScore >= 650) rank = 'Director';
    else if (totalScore >= 500) rank = 'VP';
    else if (totalScore >= 350) rank = 'Associate';
    
    const badges = [];
    if (this.gameState.correctDecisions >= 10) badges.push({ id: 'accurate', name: 'Sharp Instincts' });
    if (Math.abs(this.gameState.price - 100) < 3) badges.push({ id: 'stable', name: 'Price Master' });
    if (this.gameState.stabilizationBudget > 30) badges.push({ id: 'efficient', name: 'Budget Hawk' });
    if (this.gameState.greenshoesRemaining > 0) badges.push({ id: 'reserved', name: 'Reserved Power' });
    
    if (this.callbacks.audioManager) {
      this.callbacks.audioManager.playGameEnd(totalScore >= 500);
    }
    
    const finalResult = {
      totalScore,
      rank,
      badges,
      scores: {
        stability: Math.round(this.gameState.score.stability + priceBonus),
        liquidity: Math.round(this.gameState.score.liquidity),
        efficiency: Math.round(this.gameState.score.efficiency + accuracyBonus),
        reputation: Math.round(this.gameState.score.reputation)
      },
      priceHistory: this.gameState.priceHistory,
      finalPrice: this.gameState.price,
      budgetRemaining: this.gameState.stabilizationBudget,
      greenshoesUsed: 3 - this.gameState.greenshoesRemaining,
      correctDecisions: this.gameState.correctDecisions,
      totalDecisions: this.gameState.totalDecisions,
      maxVolatility: 0.1,
      perfectGreenshoes: this.gameState.correctDecisions
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
    if (onPhaseChange) onPhaseChange(phase);
  }, [onPhaseChange]);

  const handleGameEnd = useCallback((result) => {
    if (onGameEnd) onGameEnd(result);
  }, [onGameEnd]);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const width = Math.min(window.innerWidth, 400);
    const height = Math.min(window.innerHeight - 40, 700);

    const config = {
      type: Phaser.AUTO,
      width,
      height,
      parent: 'game-container',
      backgroundColor: '#0a0a12',
      scene: GreenshoeGameScene,
      input: {
        activePointers: 3,
        touch: { capture: true }
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

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#0a0a12]">
      <div 
        id="game-container" 
        ref={containerRef}
        className="w-full max-w-[400px] rounded-xl overflow-hidden shadow-2xl select-none"
        style={{ 
          boxShadow: '0 0 60px rgba(0, 255, 170, 0.15), 0 0 30px rgba(0, 170, 255, 0.1)',
          touchAction: 'manipulation',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none'
        }}
      />
    </div>
  );
};

export default GameContainer;
