// Mock data for IB.GAMES - Greenshoe Sprint

export const GAME_CONFIG = {
  gameName: 'Greenshoe Sprint',
  tagline: 'Stabilize the IPO',
  concept: 'Greenshoe Option / Overallotment Option',
  totalDuration: 90, // seconds
  phases: [
    { name: 'Bookbuilding Rush', duration: 25 },
    { name: 'First Print', duration: 35 },
    { name: 'Aftermarket Wave', duration: 30 }
  ],
  initialPrice: 100,
  targetPrice: 100,
  priceVolatility: 0.15,
  stabilizationBudget: 100,
  greenshoesAvailable: 3,
  allocationLanes: ['Retail', 'Long-Only', 'Hedge', 'Momentum']
};

export const SCORING_CONFIG = {
  maxScore: 1000,
  categories: [
    { name: 'Stability', maxPoints: 400, description: 'Price stayed close to healthy band' },
    { name: 'Liquidity', maxPoints: 200, description: 'Healthy volume, no thin book warnings' },
    { name: 'Efficiency', maxPoints: 200, description: 'Smart use of budget and timing' },
    { name: 'Reputation', maxPoints: 200, description: 'Clean close, no extreme spikes' }
  ],
  ranks: [
    { name: 'Managing Director', minScore: 850, badge: 'MD' },
    { name: 'Director', minScore: 700, badge: 'D' },
    { name: 'VP', minScore: 550, badge: 'VP' },
    { name: 'Associate', minScore: 350, badge: 'A' },
    { name: 'Analyst', minScore: 0, badge: 'AN' }
  ],
  badges: [
    { id: 'smooth_operator', name: 'Smooth Operator', condition: 'volatility < 10%', icon: '🎯' },
    { id: 'demand_master', name: 'Demand Master', condition: 'liquidity > 90%', icon: '📈' },
    { id: 'budget_hawk', name: 'Budget Hawk', condition: 'used < 50% budget', icon: '💎' },
    { id: 'perfect_timing', name: 'Perfect Timing', condition: 'all greenshoes optimal', icon: '⏱️' }
  ]
};

export const TUTORIAL_SLIDES = [
  {
    title: "You're the Lead Underwriter",
    description: "An IPO is about to launch. Your job: keep the stock trading orderly while meeting investor demand.",
    icon: 'briefcase'
  },
  {
    title: 'Stabilize the Price',
    description: 'Hold to provide support when the price drops. Swipe to route orders and balance demand across investor types.',
    icon: 'shield'
  },
  {
    title: 'Use the Greenshoe',
    description: "Tap to exercise the greenshoe option — release extra shares to cool overheating demand. You have 3 greenshoes.",
    icon: 'zap'
  }
];

export const REAL_WORLD_STORY = {
  title: "Alibaba's Record IPO",
  year: 2014,
  slides: [
    {
      headline: 'The Biggest IPO in History',
      content: 'September 2014: Alibaba prepares to go public on the NYSE. Demand is overwhelming — investors worldwide want in.',
      stat: '$21.8B',
      statLabel: 'Initial IPO Size'
    },
    {
      headline: 'Greenshoe Activated',
      content: 'With demand far exceeding supply, underwriters exercised the overallotment option, selling an additional 48 million shares.',
      stat: '+48M',
      statLabel: 'Extra Shares'
    },
    {
      headline: 'Record Broken',
      content: "The greenshoe pushed total proceeds to ~$25 billion, making it the world's largest IPO at the time.",
      stat: '~$25B',
      statLabel: 'Final IPO Size'
    },
    {
      headline: 'Why It Mattered',
      content: 'The overallotment let the market absorb massive demand smoothly, supporting orderly trading and price stability.',
      stat: '✓',
      statLabel: 'Smooth Launch'
    }
  ],
  nuance: {
    title: 'Not Always Exercised',
    content: "Facebook's 2012 IPO shows the flip side — the greenshoe wasn't exercised, though stabilization trading still occurred."
  }
};

export const GLOSSARY = [
  {
    term: 'Greenshoe Option',
    definition: 'An overallotment option allowing underwriters to sell up to ~15% more shares than originally planned to meet excess demand.'
  },
  {
    term: 'Stabilization',
    definition: 'Support trading by underwriters to prevent the stock from falling below the offer price in the days after an IPO.'
  },
  {
    term: 'Overallotment',
    definition: 'When underwriters sell more shares than originally offered, creating a short position they can cover via the greenshoe option.'
  },
  {
    term: 'Bookbuilding',
    definition: 'The process of collecting investor demand to determine the final IPO price and allocation.'
  }
];

export const LEARNING_BULLETS = [
  'The greenshoe option lets underwriters sell up to ~15% extra shares to meet high demand',
  'Exercising the greenshoe increases supply, which can help cool an overheating stock',
  'Stabilization support uses capital to prevent sharp drops below the offer price',
  'Balancing supply, demand, and price stability is key to a successful IPO'
];

export const LINKEDIN_CAPTION_TEMPLATE = `🎮 Just played Greenshoe Sprint on IB.GAMES!

📈 Scored {score}/1000 as a {rank}

Learned how underwriters use the greenshoe option to stabilize IPOs — turns out Alibaba used this exact mechanism in their record $25B IPO!

#InvestmentBanking #Finance #IPO #Learning`;
