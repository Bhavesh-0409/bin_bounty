import React, { useState } from 'react';
import BingoGrid from './BingoGrid';
import Arithmetic from './games/Arithmetic';
import Pinpoint from './games/cross';
import Zoom from './games/Zoom';
import Zip from './games/Zip';

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const generateInitialGrid = () => {
  const basePattern = [
    [0, 0, 1, 2],
    [1, 1, 2, 3],
    [2, 2, 3, 0],
    [3, 3, 0, 1]
  ];

  shuffle(basePattern);

  const colOrder = shuffle([0, 1, 2, 3]);
  const newGrid = basePattern.map(row => colOrder.map(c => row[c]));

  if (Math.random() > 0.5) {
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        const temp = newGrid[i][j];
        newGrid[i][j] = newGrid[j][i];
        newGrid[j][i] = temp;
      }
    }
  }

  const types = shuffle(["ARITH", "PINPOINT", "ZOOM", "ZIP"]);
  
  const finalFlat = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      finalFlat.push({
        id: r * 4 + c,
        type: types[newGrid[r][c]],
        status: "pending"
      });
    }
  }
  return finalFlat;
};

export default function Bingo({ onComplete }) {
  const [grid, setGrid] = useState(generateInitialGrid);
  const [solvedGames, setSolvedGames] = useState({
    ARITH: false,
    PINPOINT: false,
    ZOOM: false,
    ZIP: false
  });
  const [screen, setScreen] = useState("grid");
  const [win, setWin] = useState(false);

  const checkWinCondition = (currentGrid) => {
    const isCompleted = (index) => currentGrid[index].status === "completed";

    // Check rows
    for (let r = 0; r < 4; r++) {
      if (
        isCompleted(r * 4) &&
        isCompleted(r * 4 + 1) &&
        isCompleted(r * 4 + 2) &&
        isCompleted(r * 4 + 3)
      ) {
        return true;
      }
    }

    // Check columns
    for (let c = 0; c < 4; c++) {
      if (
        isCompleted(c) &&
        isCompleted(c + 4) &&
        isCompleted(c + 8) &&
        isCompleted(c + 12)
      ) {
        return true;
      }
    }

    return false;
  };

  const handleGameComplete = (type) => {
    setSolvedGames(prev => ({ ...prev, [type]: true }));

    const newGrid = grid.map(cell =>
      cell.type === type ? { ...cell, status: "completed" } : cell
    );

    setGrid(newGrid);
    setScreen("grid");

    if (checkWinCondition(newGrid)) {
      setWin(true);
      // Wait a few seconds to let user view the win screen, then move on
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 4000);
    }
  };

  const openGame = (type) => {
    if (!solvedGames[type]) {
      if (type === "ARITH") setScreen("arith");
      if (type === "PINPOINT") setScreen("pinpoint");
      if (type === "ZOOM") setScreen("zoom");
      if (type === "ZIP") setScreen("zip");
    }
  };

  return (
    <div className="bingo-system" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000000, #000b18)',
      color: '#00ffe0',
      fontFamily: 'monospace',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden'
    }}>
      <style>
        {`
        .bingo-system * {
          box-sizing: border-box;
        }
        .cyber-btn {
          background: transparent;
          color: #00ffe0;
          border: 1px solid #00ffe0;
          padding: 10px 20px;
          font-size: 16px;
          cursor: pointer;
          text-transform: uppercase;
          font-family: monospace;
          transition: all 0.2s ease-in-out;
          border-radius: 4px;
          box-shadow: 0 0 5px #00ffe0 inset;
        }
        .cyber-btn:hover:not(:disabled) {
          box-shadow: 0 0 15px #00ffe0, 0 0 10px #00ffe0 inset;
          transform: scale(1.05);
          background: rgba(0, 255, 224, 0.1);
        }
        .cyber-btn:disabled {
          border-color: #555;
          color: #555;
          box-shadow: none;
          cursor: not-allowed;
        }
        .cyber-input {
          background: #0a0a0a;
          border: 1px solid #00ffe0;
          color: #00ffe0;
          padding: 10px;
          font-family: monospace;
          font-size: 16px;
          outline: none;
          box-shadow: 0 0 5px #00ffe0 inset;
          transition: all 0.2s;
        }
        .cyber-input:focus {
          box-shadow: 0 0 15px #00ffe0, 0 0 5px #00ffe0 inset;
        }
        .cyber-select {
          background: #0a0a0a;
          border: 1px solid #00ffe0;
          color: #00ffe0;
          padding: 5px;
          font-family: monospace;
          font-size: 16px;
          outline: none;
        }
      `}
      </style>

      {win ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h1 style={{ textShadow: '0 0 20px #00ffe0', fontSize: '3.5rem' }}>🎉 BINGO COMPLETE</h1>
        </div>
      ) : screen === "arith" ? (
        <Arithmetic onComplete={handleGameComplete} onBack={() => setScreen("grid")} />
      ) : screen === "pinpoint" ? (
        <Pinpoint onComplete={handleGameComplete} onBack={() => setScreen("grid")} />
      ) : screen === "zoom" ? (
        <Zoom onComplete={handleGameComplete} onBack={() => setScreen("grid")} />
      ) : screen === "zip" ? (
        <Zip onComplete={handleGameComplete} onBack={() => setScreen("grid")} />
      ) : (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
          <h2 style={{ textShadow: '0 0 15px #00ffe0', textAlign: 'center', marginBottom: '40px', fontSize: '2.5rem', marginTop: '30px' }}>SYSTEM DECRYPTION</h2>
          <BingoGrid grid={grid} onTileClick={openGame} />
        </div>
      )}
    </div>
  );
}
