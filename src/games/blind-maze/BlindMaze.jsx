// BlindMaze.jsx
// Component for the Blind Maze game

import React, { useState, useEffect, useCallback } from "react";
import { mazeData, GRID_SIZE, START_POS, END_POS } from "./mazeData";
import { rulesText } from "./rules";
import RulesScreen from "../../components/RulesScreen";
import "./BlindMaze.css";

const hashStr = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
};

const BlindMaze = ({ onComplete }) => {
  const [playerPos, setPlayerPos] = useState(START_POS);
  const [gameStatus, setGameStatus] = useState(() => {
    return localStorage.getItem(`rules_seen_${hashStr(rulesText)}`) ? "playing" : "rules";
  });
  const [shaking, setShaking] = useState(false);

  const movePlayer = useCallback(
    (rowDiff, colDiff) => {
      if (gameStatus !== "playing") return;

      const newRow = playerPos.row + rowDiff;
      const newCol = playerPos.col + colDiff;

      // Check bounds
      if (newRow < 0 || newRow >= GRID_SIZE || newCol < 0 || newCol >= GRID_SIZE) {
        return;
      }

      // Check wall
      if (mazeData[newRow][newCol] === 1) {
        setShaking(true);
        if ("vibrate" in navigator) {
          navigator.vibrate(100);
        }
        setTimeout(() => setShaking(false), 300);
        return;
      }

      // Valid move
      const newPos = { row: newRow, col: newCol };
      setPlayerPos(newPos);

      // Check win condition
      if (newRow === END_POS.row && newCol === END_POS.col) {
        setGameStatus("won");
      }
    },
    [playerPos, gameStatus]
  );

  const handleKeyDown = useCallback(
    (e) => {
      switch (e.key.toLowerCase()) {
        case "w":
          movePlayer(-1, 0);
          break;
        case "a":
          movePlayer(0, -1);
          break;
        case "s":
          movePlayer(1, 0);
          break;
        case "d":
          movePlayer(0, 1);
          break;
        default:
          break;
      }
    },
    [movePlayer]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const restartGame = () => {
    setPlayerPos(START_POS);
    setGameStatus("playing");
    setShaking(false);
  };

  const startPlaying = () => {
    console.log("Starting game...");
    setGameStatus("playing");
  };

  useEffect(() => {
    if (gameStatus === "won") {
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [gameStatus, onComplete]);

  if (gameStatus === "rules") {
    return <RulesScreen rules={rulesText} onStart={startPlaying} />;
  }

  return (
    <div className="maze-container">
      <h1 className="maze-title">Blind Maze</h1>
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }}>
        <button onClick={() => setGameStatus('rules')} style={{ background: 'transparent', color: '#00ff00', border: '1px solid #00ff00', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', textTransform: 'uppercase' }}>VIEW MODULE RULES</button>
      </div>
      <p className="maze-instructions">{"OBJECTIVE: REACH THE ESCAPE TILE ▣"}</p>
      <p className="maze-instructions">{"[ CONTROLS: ARROWS ]"}</p>

      {gameStatus === "won" && (
        <div className="win-message">
          <h2>YOU WON!</h2>
        </div>
      )}

      <div className={`maze-grid ${shaking ? "shake" : ""}`}>
        {mazeData.map((row, rowIndex) => (
          <div key={rowIndex} className="maze-row">
            {row.map((_, colIndex) => {
              const isPlayer = playerPos.row === rowIndex && playerPos.col === colIndex;
              const isEnd = END_POS.row === rowIndex && END_POS.col === colIndex;

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`maze-cell ${isPlayer ? "player-cell" : ""} ${isEnd && gameStatus === "won" ? "end-cell" : ""}`}
                >
                  {isPlayer && <span className="player-avatar">◈</span>}
                  {isEnd && (gameStatus === "won" || gameStatus === "playing") && !isPlayer && (
                    <span className="end-avatar" style={{ opacity: gameStatus === "won" ? 1 : 0.3, color: gameStatus === "won" ? "#fff" : "#ff00ff" }}>▣</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mobile-controls">
        <div className="control-row">
          <button className="control-btn up" onClick={() => movePlayer(-1, 0)}>▲</button>
        </div>
        <div className="control-row">
          <button className="control-btn left" onClick={() => movePlayer(0, -1)}>◀</button>
          <button className="control-btn down" onClick={() => movePlayer(1, 0)}>▼</button>
          <button className="control-btn right" onClick={() => movePlayer(0, 1)}>▶</button>
        </div>
      </div>
    </div>
  );
};

export default BlindMaze;