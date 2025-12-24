import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GameWrapper from "./components/game/GameWrapper";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<GameWrapper />} />
          <Route path="/play/greenshoe" element={<GameWrapper />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
