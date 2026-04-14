import { useState } from "react";
import RulesScreen from "../components/RulesScreen";

import BinaryLock from "../games/binary-lock/BinaryLock";
// rule->game already handled in BinaryLock.jsx natively; it renders RulesScreen first.

import LogicalGrid from "../games/logical-grid/logical";
// rule->game already handled in logical.jsx natively; it renders RulesScreen first.

import Bingo from "../games/bingo/Bingo";
import { rulesText as bingoRules } from "../games/bingo/rules";
// Bingo does NOT handle RulesScreen natively, so we render it here.

import BlindMaze from "../games/blind-maze/BlindMaze";
// rule->game natively handled.

import Deceptive from "../games/deceptive/Deceptive";
// rule->game natively handled.

function GameRouter() {
  const [screen, setScreen] = useState("binary-lock");

  if (screen === "binary-lock") {
    // BinaryLock natively handles rule screen internally on mount.
    return <BinaryLock onComplete={() => setScreen("logical-grid")} />;
  }

  if (screen === "logical-grid") {
    // logical.jsx natively handles rule screen internally on mount.
    return <LogicalGrid onComplete={() => setScreen("rules-bingo")} />;
  }

  if (screen === "rules-bingo") {
    return <RulesScreen rules={bingoRules} onStart={() => setScreen("bingo")} />;
  }

  if (screen === "bingo") {
    return <Bingo onComplete={() => setScreen("blind-maze")} />;
  }

  if (screen === "blind-maze") {
    return <BlindMaze onComplete={() => setScreen("deceptive")} />;
  }

  if (screen === "deceptive") {
    return <Deceptive onComplete={() => setScreen("complete")} />;
  }

  if (screen === "complete") {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "black", color: "lime", fontSize: "2rem", fontFamily: "monospace", textAlign: "center" }}>
        <div>
          <h2>ALL MODULES COMPLETED</h2>
          <p>MASTER BOUNTY SECURED. FIREWALL BYPASSED.</p>
        </div>
      </div>
    );
  }

  return null;
}

export default GameRouter;
