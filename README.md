# IB.GAMES - Greenshoe Sprint

An interactive educational game designed to teach investment banking concepts, specifically the mechanics of the "Greenshoe Option" (Overallotment Option) in IPO stabilization.

## 🎮 Overview

"Greenshoe Sprint" places the player in the role of a lead underwriter for a major IPO. The goal is to stabilize the stock price at the $100 target using a limited stabilization budget and the Greenshoe option.

**Key Features:**
- **Realistic Market Scenarios:** React to rising, falling, and stable price movements.
- **Strategic Gameplay:** Choose between "Add Demand" (Budget), "Add Supply" (Greenshoe), or "Do Nothing".
- **Educational Explainer:** Animated tutorial explaining the concepts before gameplay.
- **Scoring System:** Evaluation based on Stability, Liquidity, Efficiency, and Reputation.
- **Social Sharing:** Generate and share scorecards on LinkedIn.

## 🏗️ Tech Stack

This project is a full-stack web application:

- **Frontend:** 
  - React.js (Create React App)
  - Phaser 3 (Game Engine for interactive elements)
  - TailwindCSS & Shadcn UI (Styling and Components)
  - HTML2Canvas (Scorecard generation)
- **Backend:** 
  - Python FastAPI
  - Uvicorn server
- **Database:** 
  - MongoDB (Persisting leaderboards/users - *Integration in progress*)

## 📂 Project Structure

```
/app
├── frontend/                 # React Application
│   ├── public/               # Static assets (index.html, etc.)
│   └── src/
│       ├── components/       
│       │   ├── game/         # Game-specific components
│       │   │   ├── GameContainer.jsx   # Core Phaser game logic
│       │   │   ├── ResultsScreen.jsx   # Post-game scoring & sharing
│       │   │   ├── IBGamesLanding.jsx  # Main Hub
│       │   │   └── AnimatedExplainer.jsx # Tutorial
│       │   └── ui/           # Shadcn UI reusable components
│       ├── data/             # Mock data and configs
│       └── App.js            # Main Router
├── backend/                  # FastAPI Application
│   ├── server.py             # Main entry point
│   └── requirements.txt      # Python dependencies
└── README.md                 # This file
```

## 🚀 Deployment Instructions

### Prerequisites
- Node.js & Yarn
- Python 3.8+
- MongoDB Instance

### 1. Environment Variables
Create `.env` files for both frontend and backend.

**Frontend (`/app/frontend/.env`):**
```env
REACT_APP_BACKEND_URL=https://your-backend-url.com
```

**Backend (`/app/backend/.env`):**
```env
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net
DB_NAME=ibgames
CORS_ORIGINS=*
```

### 2. Run Locally

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**Frontend:**
```bash
cd frontend
yarn install
yarn start
```
The frontend will run on `http://localhost:3000` and proxy API requests to port `8001`.

### 3. Production Build

**Frontend:**
```bash
cd frontend
yarn build
```
This generates a static `build/` directory.

**Backend:**
Use a process manager like `gunicorn` or `supervisor` to run the FastAPI app in production.

## 🛠️ Developer Notes

- **Game Logic:** The core game loop is handled in `GameContainer.jsx` using Phaser scenes.
- **State Management:** React state handles the UI overlays (Explainer, Results), while Phaser handles the real-time chart and button interactions.
- **Styling:** Custom "Neon Exchange" theme uses Tailwind colors `cyan-400`, `emerald-400`, `amber-400`, and specific dark backgrounds (`#0a0a12`).

## 📄 License
Educational use only.
