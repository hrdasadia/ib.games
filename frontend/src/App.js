import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import IBGamesLanding from "./components/game/IBGamesLanding";
import GameWrapper from "./components/game/GameWrapper";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<IBGamesLanding />} />
          <Route path="/play/greenshoe" element={<GameWrapper />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
