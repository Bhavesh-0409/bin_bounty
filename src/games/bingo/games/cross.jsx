import React, { useState, useRef, useEffect } from "react";

const PUZZLE = {
  clues: [
    { word: "FOOD", clue: "Something you eat" },
    { word: "FOOL", clue: "Someone easily tricked" },
    { word: "FOIL", clue: "Thin shiny metal sheet" },
    { word: "FAIL", clue: "To not succeed" },
    { word: "FALL", clue: "To drop down" },
  ]
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function oneDiff(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++;
  return diff === 1;
}

const PHASES = { CLUE: "clue", LADDER: "ladder", DONE: "done" };

export default function Cross({ onComplete, onBack }) {
  const [phase, setPhase] = useState(PHASES.CLUE);
  const [clueItems] = useState(() =>
    shuffle(PUZZLE.clues.map((c, i) => ({ ...c, id: i, input: Array(4).fill("") })))
  );
  const [guesses, setGuesses] = useState(() =>
    Object.fromEntries(clueItems.map((c) => [c.id, Array(4).fill("")]))
  );
  const [activeClue, setActiveClue] = useState(null);
  const [activeCell, setActiveCell] = useState(null);
  const [order, setOrder] = useState(() => clueItems.map((c) => c.id));
  const [dragOver, setDragOver] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [ladderValid, setLadderValid] = useState(false);
  const keyboardRef = useRef(null);

  const wordOf = (id) => guesses[id].join("").toUpperCase();
  const allSolved = () => clueItems.every((c) => wordOf(c.id) === c.word);
  const isCorrect = (id) => wordOf(id) === clueItems.find((c) => c.id === id)?.word;

  useEffect(() => {
    if (phase !== PHASES.LADDER) return;
    const words = order.map((id) => wordOf(id));
    const valid = words.every((w, i) => {
      if (i === 0) return true;
      return oneDiff(words[i - 1], w);
    });
    setLadderValid(valid);
  }, [order, guesses, phase]);

  useEffect(() => {
    if (phase === PHASES.DONE) {
      setTimeout(() => {
        if (onComplete) onComplete("PINPOINT"); // Maps back to the bingo grid's 'PINPOINT' type
      }, 1500);
    }
  }, [phase, onComplete]);

  function handleKey(key) {
    if (activeClue === null || activeCell === null) return;
    const id = activeClue;
    const cell = activeCell;
    const cur = [...guesses[id]];
    if (key === "BACKSPACE") {
      if (cur[cell]) {
        cur[cell] = "";
        setGuesses((g) => ({ ...g, [id]: cur }));
      } else if (cell > 0) {
        cur[cell - 1] = "";
        setGuesses((g) => ({ ...g, [id]: cur }));
        setActiveCell(cell - 1);
      }
    } else if (/^[A-Z]$/.test(key)) {
      cur[cell] = key;
      setGuesses((g) => ({ ...g, [id]: cur }));
      if (cell < 3) setActiveCell(cell + 1);
    }
  }

  function handlePhysicalKey(e) {
    if (phase !== PHASES.CLUE) return;
    const k = e.key.toUpperCase();
    if (k === "BACKSPACE") handleKey("BACKSPACE");
    else if (/^[A-Z]$/.test(k)) handleKey(k);
  }

  useEffect(() => {
    window.addEventListener("keydown", handlePhysicalKey);
    return () => window.removeEventListener("keydown", handlePhysicalKey);
  }, [phase, activeClue, activeCell, guesses]);

  function proceedToLadder() {
    setPhase(PHASES.LADDER);
  }

  function proceedToDone() {
    setPhase(PHASES.DONE);
  }

  const KEYS = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["BACKSPACE", "Z", "X", "C", "V", "B", "N", "M", "ENTER"],
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', flex: 1, padding: '20px', width: '100%' }}>
      <div style={{ alignSelf: 'flex-start', marginBottom: '20px', width: '100%', paddingLeft: '20px' }}>
        <button className="cyber-btn" onClick={onBack}>⬅ BACK TO GRID</button>
      </div>

      <h2 style={{ textShadow: '0 0 10px #00ffe0', fontSize: '2.5rem', marginBottom: '10px' }}>CROSSCLIMB</h2>

      <div style={{ backgroundColor: 'rgba(0,0,0,0.6)', border: '1px solid #ff00e0', padding: '15px', borderRadius: '8px', marginBottom: '20px', maxWidth: '500px', width: '100%', boxSizing: 'border-box' }}>
        <h3 style={{ color: '#ff00e0', margin: '0 0 10px 0', textShadow: '0 0 5px #ff00e0' }}>PROTOCOLS:</h3>
        <ul style={{ color: '#fff', margin: 0, paddingLeft: '20px', fontSize: '0.95rem', lineHeight: '1.4' }}>
          <li style={{ marginBottom: '8px' }}><strong>PHASE 1:</strong> Select a sequence array, decipher the trace clue, and input the correct 4-letter decryption. Secure all 5 nodes.</li>
          <li><strong>PHASE 2:</strong> Sort the decrypted nodes. Drag and drop to arrange them into a valid ladder where each adjacent word mutates by exactly <strong>ONE letter</strong>.</li>
        </ul>
      </div>

      <div style={{ width: "100%", maxWidth: 500, boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Phase Indicator */}
        <div style={{
          textAlign: "center", margin: "14px 0 24px", fontSize: '1.2rem', color: "#ff00e0", fontWeight: 700, letterSpacing: '2px', textShadow: "0 0 10px #ff00e0"
        }}>
          {phase === PHASES.CLUE && "PHASE 1: DECRYPT CLUES"}
          {phase === PHASES.LADDER && "PHASE 2: VERIFY LADDER MATCHES"}
          {phase === PHASES.DONE && "ACCESS GRANTED"}
        </div>

        {/* ── PHASE 1: CLUE ── */}
        {phase === PHASES.CLUE && (
          <div style={{ width: "100%" }}>
            {clueItems.map((item) => {
              const correct = isCorrect(item.id);
              const active = activeClue === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => { if (!correct) { setActiveClue(item.id); setActiveCell(0); } }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", marginBottom: 12,
                    borderRadius: 8,
                    border: active ? "2px solid #00ffe0" : correct ? "2px solid #00ff00" : "1px solid rgba(0, 255, 224, 0.3)",
                    background: correct ? "rgba(0, 255, 0, 0.05)" : active ? "rgba(0, 255, 224, 0.1)" : "transparent",
                    boxShadow: active ? "0 0 10px rgba(0, 255, 224, 0.3) inset" : "none",
                    cursor: correct ? "default" : "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ display: "flex", gap: 8, flex: 1 }}>
                    {[0, 1, 2, 3].map((ci) => {
                      const cellActive = active && activeCell === ci;
                      const val = guesses[item.id][ci];
                      return (
                        <div
                          key={ci}
                          onClick={(e) => { e.stopPropagation(); if (!correct) { setActiveClue(item.id); setActiveCell(ci); } }}
                          style={{
                            width: 44, height: 48,
                            border: cellActive ? "2px solid #00ffe0" : correct ? "2px solid #00ff00" : "1px solid rgba(0,255,224,0.5)",
                            borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 20, fontWeight: 700,
                            color: correct ? "#00ff00" : "#00ffe0",
                            background: "#050505",
                            boxShadow: cellActive ? "0 0 10px #00ffe0 inset" : "none",
                            cursor: "pointer",
                            textShadow: correct ? "0 0 5px #00ff00" : "0 0 5px #00ffe0",
                            textTransform: 'uppercase'
                          }}
                        >
                          {val || ""}
                        </div>
                      );
                    })}
                  </div>
                  {correct && (
                    <div style={{ color: '#00ff00', fontSize: '1.2rem', textShadow: '0 0 5px #00ff00' }}>✅</div>
                  )}
                </div>
              );
            })}

            {/* Active clue text */}
            <div style={{
              margin: "20px 0", padding: "16px",
              background: "#050505", border: "1px solid #00ffe0",
              borderRadius: 8, fontSize: '1.2rem', color: "#00ffe0",
              minHeight: 38, textShadow: "0 0 5px #00ffe0", textAlign: 'center'
            }}>
              {activeClue !== null
                ? clueItems.find((c) => c.id === activeClue)?.clue
                : <span style={{ color: "rgba(0, 255, 224, 0.5)" }}>Select a sequence to decrypt its trace...</span>}
            </div>

            {/* Keyboard */}
            <div ref={keyboardRef} style={{ marginBottom: 20 }}>
              {KEYS.map((row, ri) => (
                <div key={ri} style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 8 }}>
                  {row.map((k) => (
                    <button
                      key={k}
                      onMouseDown={(e) => { e.preventDefault(); handleKey(k === "ENTER" ? "ENTER" : k); }}
                      className="cyber-btn"
                      style={{
                        height: 48, minWidth: k.length > 1 ? 64 : 40,
                        padding: "0 8px", background: k === "ENTER" ? "rgba(0, 255, 224, 0.2)" : "transparent",
                        fontSize: k.length > 1 ? 12 : 16, fontWeight: 700,
                      }}
                    >
                      {k === "BACKSPACE" ? "⌫" : k}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            <button
              onClick={proceedToLadder}
              className="cyber-btn"
              disabled={!allSolved()}
              style={{ width: "100%", padding: "15px 0", fontSize: '1.2rem' }}
            >
              INITIATE LADDER PROTOCOL
            </button>
          </div>
        )}

        {/* ── PHASE 2: LADDER ── */}
        {phase === PHASES.LADDER && (
          <div style={{ width: "100%" }}>
            <div style={{ fontSize: '1.1rem', color: "rgba(0,255,224,0.8)", textAlign: "center", margin: "8px 0 24px" }}>
              Reorganize sequence so consecutive words mutate by 1 letter.
            </div>

            {order.map((id, idx) => {
              const w = wordOf(id);
              const above = idx === 0 ? null : wordOf(order[idx - 1]);
              const below = idx === order.length - 1 ? null : wordOf(order[idx + 1]);
              const validAbove = above ? oneDiff(above, w) : true;
              const validBelow = below ? oneDiff(w, below) : true;
              const rowValid = validAbove && validBelow;

              return (
                <DraggableRow
                  key={id} id={id} word={w}
                  isDragging={dragId === id} isDragOver={dragOver === id} valid={rowValid}
                  onDragStart={() => setDragId(id)}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(id); }}
                  onDrop={() => {
                    if (dragId !== null && dragId !== id) {
                      const newOrder = [...order];
                      const from = newOrder.indexOf(dragId);
                      const to = newOrder.indexOf(id);
                      newOrder.splice(from, 1);
                      newOrder.splice(to, 0, dragId);
                      setOrder(newOrder);
                    }
                    setDragId(null);
                    setDragOver(null);
                  }}
                  onDragEnd={() => { setDragId(null); setDragOver(null); }}
                />
              );
            })}

            {ladderValid && (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: "rgba(0, 255, 0, 0.1)", border: "1.5px solid #00ff00",
                borderRadius: 8, padding: "15px", margin: "20px 0",
                fontSize: '1.1rem', color: "#00ff00", fontWeight: 600,
                textShadow: "0 0 5px #00ff00"
              }}>
                ✅ VALID SEQUENCE GENERATED
              </div>
            )}

            <button
              onClick={proceedToDone}
              className="cyber-btn"
              disabled={!ladderValid}
              style={{ width: "100%", padding: "15px 0", marginTop: 20, fontSize: '1.2rem' }}
            >
              COMPLETE PROTOCOL
            </button>
          </div>
        )}



        {/* ── DONE ── */}
        {phase === PHASES.DONE && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, marginTop: 40 }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%", border: "2px solid #00ff00",
              background: "rgba(0, 255, 0, 0.1)", display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 20px #00ff00 inset, 0 0 20px #00ff00"
            }}>
              <div style={{ fontSize: '3rem', textShadow: "0 0 10px #00ff00" }}>✅</div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: "#00ff00", textShadow: "0 0 10px #00ff00" }}>
              SYSTEM UNLOCKED
            </div>
            <div style={{ fontSize: '1.2rem', color: "#00ffe0", opacity: 0.8 }}>Routing signal back to main grid...</div>
          </div>
        )}
      </div>


    </div>
  );
}

function DraggableRow({ id, word, isDragging, isDragOver, valid, onDragStart, onDragOver, onDrop, onDragEnd }) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      style={{
        display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", marginBottom: 10, width: "100%",
        borderRadius: 8,
        border: isDragOver ? "2px dashed #00ffe0" : valid ? "2px solid #00ff00" : "2px solid #ff00e0",
        background: isDragging ? "rgba(0, 255, 224, 0.05)" : isDragOver ? "rgba(0, 255, 224, 0.1)" : "transparent",
        opacity: isDragging ? 0.5 : 1,
        cursor: "grab", userSelect: "none", transition: "all 0.12s",
        boxShadow: valid ? "0 0 10px rgba(0, 255, 0, 0.2)" : "inset 0 0 5px rgba(255, 0, 224, 0.1)"
      }}
    >
      <div style={{ fontSize: '20px', color: '#00ffe0', opacity: 0.8, padding: '0 5px' }}>⣿</div>
      <div style={{ display: "flex", gap: 8, flex: 1, justifyContent: "center" }}>
        {word.split("").map((l, i) => (
          <div key={i} style={{
            width: 44, height: 48,
            border: "1px solid rgba(0, 255, 224, 0.4)",
            borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 700, background: "#050505",
            color: valid ? "#00ff00" : "#ff00e0",
            textShadow: valid ? "0 0 5px #00ff00" : "0 0 5px #ff00e0",
          }}>{l}</div>
        ))}
      </div>
    </div>
  );
}


