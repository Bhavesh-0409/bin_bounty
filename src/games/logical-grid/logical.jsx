import { useState, useEffect } from "react";
import RulesScreen from "../../components/RulesScreen";
import { rulesText } from "./rules";
import puzzleData from "./puzzles.json";

const C = 4;
const N = 4;



const hashStr = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
};

function LogicalGrid({ onComplete }) {
  const [startGame, setStartGame] = useState(() => {
    return !!localStorage.getItem(`rules_seen_${hashStr(rulesText)}`);
  });
  const [puzzle, setPuzzle] = useState(null);
  const [selection, setSelection] = useState([null, null, null, null]);
  const [message, setMessage] = useState("Construct the exact attack vector.");
  const [statusColor, setStatusColor] = useState("text-cyan-400");
  const [gameWon, setGameWon] = useState(false);

  const [bgElements] = useState(() =>
    Array.from({ length: 15 }, (_, index) => ({
      id: index,
      left: `${Math.random() * 100}%`,
      duration: `${8 + Math.random() * 10}s`,
      delay: `-${Math.random() * 6}s`,
      opacity: 0.05 + Math.random() * 0.1,
    }))
  );

  useEffect(() => {
    if (startGame && !puzzle) {
      const selected = puzzleData[Math.floor(Math.random() * puzzleData.length)];
      setPuzzle(selected);

      // CHEAT LOG - For debugging/dev purposes to easily test the exact vector
      console.log("[CHEAT] Expected Answer Vector: ", selected.answerVector.join(" -> "));
    }
  }, [startGame, puzzle]);

  function handleSelect(colIdx, itemValue) {
    if (gameWon) return;

    const newSelection = [...selection];
    newSelection[colIdx] = itemValue;
    setSelection(newSelection);

    if (newSelection.every((val) => val !== null)) {
      validateSelection(newSelection);
    }
  }

  function validateSelection(currentSelection) {
    if (!puzzle) return;

    let isCorrect = true;
    for (let c = 0; c < C; c++) {
      const expectedIndex = puzzle.target[c][puzzle.masterBountyIdx];
      const expectedItem = puzzle.theme.items[c][expectedIndex];
      if (currentSelection[c] !== expectedItem) {
        isCorrect = false;
        break;
      }
    }

    if (isCorrect) {
      setMessage("🎉 ROOT ACCESS GRANTED. TARGET SECURED.");
      setStatusColor("text-emerald-400");
      setGameWon(true);
    } else {
      setMessage("🚨 INCORRECT VECTOR. ACCESS DENIED.");
      setStatusColor("text-red-600");
      setGameWon(false);

      setTimeout(() => {
        setSelection([null, null, null, null]);
        setMessage("Construct the exact attack vector.");
        setStatusColor("text-cyan-400");
      }, 2500);
    }
  }

  function handleUndo() {
    if (gameWon) return;
    const newSelection = [...selection];
    for (let i = 3; i >= 0; i--) {
      if (newSelection[i] !== null) {
        newSelection[i] = null;
        break;
      }
    }
    setSelection(newSelection);
  }

  if (!startGame) {
    return <RulesScreen rules={rulesText} onStart={() => setStartGame(true)} />;
  }

  if (!puzzle) return null;

  const bountyName = puzzle.theme.items[0][puzzle.target[0][puzzle.masterBountyIdx]];

  return (
    <div className="game-shell app-wrapper">
      <style>{`
        .app-wrapper {
          position: relative;
          min-height: 100vh;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          color: #e2e8f0;
          box-sizing: border-box;
        }

        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.4);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(34, 211, 238, 0.2);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 211, 238, 0.4);
        }

        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes subtlePulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; text-shadow: 0 0 12px rgba(34,211,238,0.8); }
        }
        @keyframes floatUp {
          0% { transform: translateY(120vh) scale(0.8); opacity: 0; }
          20% { opacity: var(--max-opacity); }
          80% { opacity: var(--max-opacity); }
          100% { transform: translateY(-20vh) scale(1.2); opacity: 0; }
        }

        .game-shell {
          background: radial-gradient(ellipse at bottom, #0d1423 0%, #05080f 100%);
        }
        
        .ambient-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(34, 211, 238, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 211, 238, 0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          z-index: 1;
        }

        .scanline-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent, rgba(34, 211, 238, 0.08), transparent);
          height: 8px;
          width: 100%;
          animation: scanline 8s linear infinite;
          z-index: 50;
          pointer-events: none;
        }

        .panel-glass {
          background: linear-gradient(145deg, rgba(11, 18, 30, 0.7) 0%, rgba(5, 10, 18, 0.85) 100%);
          border: 1px solid rgba(34, 211, 238, 0.2);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 0 15px rgba(34, 211, 238, 0.05);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 0.75rem;
        }

        .node-btn {
          width: 100%;
          position: relative;
          overflow: hidden;
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: #94a3b8;
          padding: 0.9rem 0.5rem;
          text-align: center;
          font-size: 0.8rem;
          font-weight: bold;
          border-radius: 0.5rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }

        .node-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(34,211,238,0) 0%, rgba(34,211,238,0.1) 100%);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .node-btn:hover:not(:disabled) {
          border-color: rgba(34, 211, 238, 0.5);
          color: #bae6fd;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(34, 211, 238, 0.15);
        }
        
        .node-btn:hover:not(:disabled)::before {
          opacity: 1;
        }

        .node-btn.active {
          background: linear-gradient(135deg, rgba(8, 145, 178, 0.8), rgba(15, 23, 42, 0.9));
          border-color: #22d3ee;
          color: #fff;
          font-weight: bold;
          box-shadow: 0 0 20px rgba(34, 211, 238, 0.4), inset 0 0 10px rgba(34, 211, 238, 0.2);
          text-shadow: 0 0 8px rgba(255,255,255,0.5);
        }

        .node-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
          background: rgba(5, 10, 15, 0.5);
        }

        /* Essential Layout Reset/Overrides */
        .content-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1400px;
        }
        
        .top-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem;
          margin-bottom: 1.5rem;
          border-top: 2px solid #06b6d4;
        }
        h1.title-text {
          font-size: 1.875rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          margin: 0;
          background: linear-gradient(to right, #22d3ee, #3b82f6);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          filter: drop-shadow(0 0 12px rgba(34,211,238,0.4));
        }

        .main-grid {
          display: grid;
          gap: 1.5rem;
          align-items: start;
        }
        @media (min-width: 1024px) {
          .main-grid { grid-template-columns: 380px 1fr; }
        }

        .clues-panel {
          height: 700px;
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
        }
        .clues-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 0.75rem;
          margin-bottom: 1.25rem;
          border-bottom: 1px solid rgba(6, 182, 212, 0.2);
          color: #22d3ee;
          font-size: 0.75rem;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.2em;
        }
        .clue-list {
          overflow-y: auto;
          flex-grow: 1;
          margin: 0;
          padding: 0;
        }
        .clue-item {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
          margin-bottom: 1rem;
          font-size: 0.75rem;
          line-height: 1.5rem;
          color: #cbd5e1;
        }

        .pipeline-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding: 1.75rem;
        }
        .pipeline-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
          background: rgba(2, 6, 23, 0.8);
          border: 1px solid rgba(30, 41, 59, 0.8);
          padding: 1.25rem;
          border-radius: 0.5rem;
          box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
        }
        .pipeline-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0.75rem;
          border-radius: 0.25rem;
          width: 100px;
          transition: all 0.5s;
        }
        @media (max-width: 768px) {
           .pipeline-row { flex-direction: column; }
           .pipeline-item { width: 100%; }
        }

        .board-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          padding: 2rem;
        }
        @media (max-width: 640px) {
           .board-grid { grid-template-columns: repeat(2, 1fr); }
        }

        .btn-base {
          padding: 0.625rem 1.25rem;
          font-size: 0.75rem;
          font-family: inherit;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          border-radius: 0.25rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .status-msg {
          font-weight: bold;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          min-height: 20px;
          margin-top: 1.5rem;
          font-size: 0.875rem;
        }
        .status-success { color: #34d399; }
        .status-error { color: #dc2626; }
        .status-normal { color: #22d3ee; }

      `}</style>

      {/* Background Elements */}
      <div className="ambient-grid" />
      <div className="scanline-overlay" />

      <div style={{ pointerEvents: 'none', position: 'absolute', inset: 0, zIndex: 0 }}>
        {bgElements.map((el) => (
          <div
            key={el.id}
            style={{
              position: 'absolute',
              bottom: 0,
              width: '1px',
              height: '8rem',
              background: 'linear-gradient(to top, transparent, rgba(6,182,212,0.3), transparent)',
              left: el.left,
              animation: `floatUp ${el.duration} linear infinite`,
              animationDelay: el.delay,
              '--max-opacity': el.opacity
            }}
          />
        ))}
      </div>

      <div className="content-container">
        {/* Top Header */}
        <div className="panel-glass top-header">
          <div>
            <h1 className="title-text">Network Intrusion</h1>
            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(34,211,238,0.7)', marginTop: '0.5rem', fontWeight: 'bold' }}>
              Active Protocol: {puzzle.theme.name}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button
              onClick={() => setStartGame(false)}
              className="btn-base"
              style={{ color: '#22d3ee', backgroundColor: 'transparent', border: '1px solid #22d3ee' }}
            >
              VIEW RULES
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 'bold', color: '#34d399', animation: 'subtlePulse 2s infinite' }}>
                Session Active
              </span>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#94a3b8', marginTop: '0.25rem' }}>
                Infinite Generation
              </span>
            </div>
            <button
              onClick={() => { setSelection([null, null, null, null]) }}
              className="btn-base"
              style={{ color: '#22d3ee', backgroundColor: 'rgba(8,145,178,0.2)', border: '1px solid rgba(8,145,178,0.5)' }}
            >
              PURGE VECTOR
            </button>
          </div>
        </div>

        <div className="main-grid">

          {/* Left Panel - Clues */}
          <aside className="panel-glass clues-panel">
            <div className="clues-header">
              <span>[ Decrypted Logs ]</span>
              <span style={{ backgroundColor: '#083344', color: '#67e8f9', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontSize: '9px' }}>
                {puzzle.clues.length} ACTIVE
              </span>
            </div>
            <div className="clue-list">
              {puzzle.clues.map((clue, idx) => (
                <div key={idx} className="clue-item">
                  <span style={{ color: '#0891b2', opacity: 0.6, flexShrink: 0 }}>[{String(idx + 1).padStart(2, '0')}]</span>
                  <p style={{ margin: 0 }}>{clue}</p>
                </div>
              ))}
            </div>
          </aside>

          {/* Right Panel - Play Area */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Objective & Pipeline */}
            <div className="panel-glass pipeline-wrapper">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', animation: 'subtlePulse 2s infinite' }} />
                <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 'bold', color: '#f87171', margin: 0 }}>
                  Target Vector: <span style={{ color: '#fca5a5' }}>[ {bountyName} ]</span>
                </h3>
              </div>

              {/* Visual Pipeline */}
              <div className="pipeline-row">
                {puzzle.theme.categories.map((cat, idx) => {
                  const sel = selection[idx];
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <div
                        className="pipeline-item"
                        style={sel ? { backgroundColor: 'rgba(8,145,178,0.2)', border: '1px solid rgba(6,182,212,0.5)', boxShadow: '0 0 15px rgba(34,211,238,0.15)' }
                          : { backgroundColor: '#0f172a', border: '1px solid rgba(30,41,59,0.5)' }}
                      >
                        <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', marginBottom: '0.25rem', fontWeight: 'bold' }}>{cat}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: sel ? '#67e8f9' : '#475569' }}>{sel || '---'}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className={`status-msg status-${statusColor.includes('red') ? 'error' : statusColor.includes('emerald') ? 'success' : 'normal'}`}>
                {message}
              </div>
            </div>

            {/* The Node Grid (4 Columns) */}
            <div className="panel-glass board-grid">
              {puzzle.theme.categories.map((catLabel, colIdx) => (
                <div key={colIdx} className="node-col">
                  <h4 style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.25em', textAlign: 'center', color: '#0891b2', fontWeight: 'bold', marginBottom: '1rem', margin: 0 }}>
                    {catLabel}
                  </h4>
                  {puzzle.theme.items[colIdx].map((item) => {
                    const isActive = selection[colIdx] === item;
                    const isDisabled = selection[colIdx] !== null && !isActive;
                    return (
                      <button
                        key={item}
                        onClick={() => handleSelect(colIdx, item)}
                        disabled={isDisabled}
                        className={`node-btn ${isActive ? 'active' : ''}`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem', gap: '1rem' }}>
              <button
                onClick={handleUndo}
                disabled={selection.every(s => s === null)}
                className="btn-base"
                style={{ color: '#94a3b8', backgroundColor: 'transparent', border: '1px solid #334155' }}
              >
                &larr; Undo Last Node
              </button>
              {gameWon && onComplete && (
                <button
                  onClick={onComplete}
                  className="btn-base"
                  style={{
                    color: '#0f172a',
                    backgroundColor: '#34d399',
                    border: 'none',
                    fontWeight: 'bold',
                    boxShadow: '0 0 15px rgba(52, 211, 153, 0.4)'
                  }}
                >
                  NEXT MODULE &rarr;
                </button>
              )}
            </div>

          </section>
        </div>
      </div>
    </div>
  );
}

export default LogicalGrid;