import { useState, useRef, useEffect } from "react";

const PUZZLE = {
  clues: [
    { word: "WING", clue: "Part of a bird or airplane" },
    { word: "WINK", clue: "A flirtatious eye gesture" },
    { word: "SINK", clue: "Kitchen basin for washing dishes" },
    { word: "SICK", clue: "Feeling unwell or ill" },
    { word: "SACK", clue: "A large bag or to fire someone" },
  ],
  topWord: "KING",
  bottomWord: "JACK",
  finalClue: "Two face cards in a standard deck (top + bottom)",
  finalAnswer: "KINGJACK",
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

const PHASES = { CLUE: "clue", LADDER: "ladder", FINAL: "final", DONE: "done" };

export default function Crossclimb() {
  const [phase, setPhase] = useState(PHASES.CLUE);
  const [clueItems] = useState(() =>
    shuffle(PUZZLE.clues.map((c, i) => ({ ...c, id: i, input: Array(4).fill("") })))
  );
  const [guesses, setGuesses] = useState(() =>
    Object.fromEntries(clueItems.map((c) => [c.id, Array(4).fill("")]))
  );
  const [revealed, setRevealed] = useState(() =>
    Object.fromEntries(clueItems.map((c) => [c.id, false]))
  );
  const [activeClue, setActiveClue] = useState(null);
  const [activeCell, setActiveCell] = useState(null);
  const [order, setOrder] = useState(() => clueItems.map((c) => c.id));
  const [dragOver, setDragOver] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [ladderValid, setLadderValid] = useState(false);
  const [finalInput, setFinalInput] = useState("");
  const [finalResult, setFinalResult] = useState(null);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef({});
  const keyboardRef = useRef(null);

  const wordOf = (id) =>
    guesses[id].join("").toUpperCase();

  const allSolved = () =>
    clueItems.every((c) => wordOf(c.id) === c.word);

  useEffect(() => {
    if (phase !== PHASES.LADDER) return;
    const words = order.map((id) => wordOf(id));
    const valid = words.every((w, i) => {
      if (i === 0) return true;
      return oneDiff(words[i - 1], w);
    });
    setLadderValid(valid);
  }, [order, guesses, phase]);

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

  const isCorrect = (id) => wordOf(id) === clueItems.find((c) => c.id === id)?.word;

  function proceedToLadder() {
    setPhase(PHASES.LADDER);
  }

  function proceedToFinal() {
    setPhase(PHASES.FINAL);
  }

  function submitFinal() {
    const val = finalInput.toUpperCase().replace(/\s/g, "");
    const top = wordOf(order[0]);
    const bot = wordOf(order[order.length - 1]);
    const combined = (top + bot).toUpperCase();
    const combinedRev = (bot + top).toUpperCase();
    if (
      val === combined ||
      val === combinedRev ||
      val === PUZZLE.finalAnswer ||
      val === PUZZLE.finalAnswer.split("").reverse().join("")
    ) {
      setFinalResult("correct");
      setPhase(PHASES.DONE);
    } else {
      setFinalResult("wrong");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  const KEYS = [
    ["Q","W","E","R","T","Y","U","I","O","P"],
    ["A","S","D","F","G","H","J","K","L"],
    ["BACKSPACE","Z","X","C","V","B","N","M","ENTER"],
  ];

  const usedLetters = clueItems.reduce((acc, c) => {
    if (isCorrect(c.id)) c.word.split("").forEach((l) => acc.add(l));
    return acc;
  }, new Set());

  return (
    <div style={{
      minHeight: "100vh",
      background: "#fff",
      fontFamily: "'LinkedIn Sans', 'Segoe UI', system-ui, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}>
      {/* Header */}
      <div style={{
        width: "100%",
        borderBottom: "1px solid #e0e0e0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        height: 52,
        boxSizing: "border-box",
        maxWidth: 480,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect width="20" height="20" rx="4" fill="#0A66C2"/>
            <text x="4" y="15" fill="white" fontSize="12" fontWeight="700">in</text>
          </svg>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#000", letterSpacing: "-0.3px" }}>
            Crossclimb
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[PHASES.CLUE, PHASES.LADDER, PHASES.FINAL].map((p, i) => (
            <div key={p} style={{
              width: 8, height: 8, borderRadius: "50%",
              background: phase === p || (phase === PHASES.DONE && i === 2)
                ? "#0A66C2"
                : [PHASES.CLUE, PHASES.LADDER, PHASES.FINAL].indexOf(phase) > i
                ? "#0A66C2"
                : "#d0d0d0",
            }} />
          ))}
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: 480, padding: "0 16px", boxSizing: "border-box", flex: 1 }}>

        {/* Phase label */}
        <div style={{
          textAlign: "center",
          margin: "14px 0 4px",
          fontSize: 13,
          color: "#666",
          fontWeight: 400,
          letterSpacing: 0.2,
        }}>
          {phase === PHASES.CLUE && "Phase 1 — Answer each clue"}
          {phase === PHASES.LADDER && "Phase 2 — Arrange the word ladder"}
          {phase === PHASES.FINAL && "Phase 3 — Solve the combo clue"}
          {phase === PHASES.DONE && "Puzzle complete!"}
        </div>

        {/* ── PHASE 1: CLUE ── */}
        {phase === PHASES.CLUE && (
          <>
            <div style={{ marginTop: 8 }}>
              {clueItems.map((item) => {
                const correct = isCorrect(item.id);
                const active = activeClue === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => { if (!correct) { setActiveClue(item.id); setActiveCell(0); } }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      marginBottom: 8,
                      borderRadius: 10,
                      border: active ? "2px solid #0A66C2" : correct ? "2px solid #057642" : "1.5px solid #d0d0d0",
                      background: correct ? "#f0faf4" : active ? "#f0f6ff" : "#fff",
                      cursor: correct ? "default" : "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", gap: 5, flex: 1 }}>
                      {[0,1,2,3].map((ci) => {
                        const cellActive = active && activeCell === ci;
                        const val = guesses[item.id][ci];
                        return (
                          <div
                            key={ci}
                            onClick={(e) => { e.stopPropagation(); if (!correct) { setActiveClue(item.id); setActiveCell(ci); } }}
                            style={{
                              width: 40, height: 44,
                              border: cellActive ? "2px solid #0A66C2" : correct ? "2px solid #057642" : "1.5px solid #b0b0b0",
                              borderRadius: 6,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 18, fontWeight: 700,
                              color: correct ? "#057642" : "#000",
                              background: correct ? "#e7f6ef" : cellActive ? "#e8f0fe" : "#fff",
                              userSelect: "none",
                              cursor: "pointer",
                              transition: "all 0.12s",
                              flexShrink: 0,
                            }}
                          >
                            {val || ""}
                          </div>
                        );
                      })}
                    </div>
                    {correct && (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="10" fill="#057642"/>
                        <path d="M5.5 10.5l3 3 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Active clue text */}
            <div style={{
              margin: "10px 0 14px",
              padding: "10px 14px",
              background: "#f3f6f8",
              borderRadius: 8,
              fontSize: 14,
              color: "#333",
              minHeight: 38,
            }}>
              {activeClue !== null
                ? clueItems.find((c) => c.id === activeClue)?.clue
                : <span style={{ color: "#999" }}>Tap a row to see its clue</span>}
            </div>

            {/* Keyboard */}
            <div ref={keyboardRef} style={{ marginBottom: 12 }}>
              {KEYS.map((row, ri) => (
                <div key={ri} style={{ display: "flex", justifyContent: "center", gap: 5, marginBottom: 6 }}>
                  {row.map((k) => (
                    <button
                      key={k}
                      onMouseDown={(e) => { e.preventDefault(); handleKey(k === "ENTER" ? "ENTER" : k); }}
                      style={{
                        height: 42,
                        minWidth: k.length > 1 ? 52 : 32,
                        padding: "0 4px",
                        borderRadius: 6,
                        border: "none",
                        background: k === "ENTER" ? "#0A66C2" : "#e9e9e9",
                        color: k === "ENTER" ? "#fff" : "#000",
                        fontSize: k.length > 1 ? 11 : 14,
                        fontWeight: 600,
                        cursor: "pointer",
                        userSelect: "none",
                        transition: "background 0.1s",
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
              disabled={!allSolved()}
              style={{
                width: "100%",
                padding: "13px 0",
                borderRadius: 24,
                border: "none",
                background: allSolved() ? "#0A66C2" : "#c8d8e8",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                cursor: allSolved() ? "pointer" : "not-allowed",
                marginBottom: 20,
                transition: "background 0.2s",
                letterSpacing: 0.2,
              }}
            >
              Continue →
            </button>
          </>
        )}

        {/* ── PHASE 2: LADDER ── */}
        {phase === PHASES.LADDER && (
          <>
            <div style={{ fontSize: 13, color: "#555", textAlign: "center", margin: "8px 0 16px" }}>
              Drag rows so each word differs by exactly one letter
            </div>

            {/* Top locked row */}
            <LadderRow
              word={"????"}
              locked
              isTop
              valid={false}
              adjacentValid={order.length > 0 && false}
            />

            {order.map((id, idx) => {
              const w = wordOf(id);
              const above = idx === 0 ? null : wordOf(order[idx - 1]);
              const below = idx === order.length - 1 ? null : wordOf(order[idx + 1]);
              const validAbove = above ? oneDiff(above, w) : true;
              const validBelow = below ? oneDiff(w, below) : true;
              const rowValid = validAbove && validBelow;

              return (
                <DraggableRow
                  key={id}
                  id={id}
                  word={w}
                  isDragging={dragId === id}
                  isDragOver={dragOver === id}
                  valid={rowValid}
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

            {/* Bottom locked row */}
            <LadderRow word={"????"} locked isBottom valid={false} />

            {ladderValid && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "#f0faf4", border: "1.5px solid #057642",
                borderRadius: 10, padding: "10px 14px", margin: "12px 0",
                fontSize: 13, color: "#057642", fontWeight: 600,
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="8" fill="#057642"/>
                  <path d="M4.5 8.5l2.5 2.5 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Perfect ladder! Each word differs by one letter.
              </div>
            )}

            <button
              onClick={proceedToFinal}
              disabled={!ladderValid}
              style={{
                width: "100%",
                padding: "13px 0",
                borderRadius: 24,
                border: "none",
                background: ladderValid ? "#0A66C2" : "#c8d8e8",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                cursor: ladderValid ? "pointer" : "not-allowed",
                marginBottom: 20,
                marginTop: 12,
                transition: "background 0.2s",
              }}
            >
              Continue →
            </button>
          </>
        )}

        {/* ── PHASE 3: FINAL ── */}
        {phase === PHASES.FINAL && (
          <>
            <div style={{ marginTop: 10, marginBottom: 6 }}>
              {/* Full ladder display */}
              <LadderRow word={PUZZLE.topWord} locked isTop unlocked />
              {order.map((id) => (
                <LadderRow key={id} word={wordOf(id)} locked valid />
              ))}
              <LadderRow word={PUZZLE.bottomWord} locked isBottom unlocked />
            </div>

            <div style={{
              background: "#f3f6f8", borderRadius: 10,
              padding: "12px 14px", margin: "14px 0",
              fontSize: 14, color: "#333", lineHeight: 1.5,
            }}>
              <span style={{ fontWeight: 700, color: "#0A66C2" }}>Final clue: </span>
              {PUZZLE.finalClue}
            </div>

            <div style={{ marginBottom: 10, fontSize: 13, color: "#666" }}>
              Combine the top and bottom words:
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <div style={{
                flex: 1, padding: "11px 0", borderRadius: 10,
                background: "#e8f0fe", border: "2px solid #0A66C2",
                textAlign: "center", fontSize: 18, fontWeight: 700, letterSpacing: 2, color: "#0A66C2",
              }}>{PUZZLE.topWord}</div>
              <div style={{
                display: "flex", alignItems: "center", fontSize: 20, fontWeight: 700, color: "#999",
              }}>+</div>
              <div style={{
                flex: 1, padding: "11px 0", borderRadius: 10,
                background: "#e8f0fe", border: "2px solid #0A66C2",
                textAlign: "center", fontSize: 18, fontWeight: 700, letterSpacing: 2, color: "#0A66C2",
              }}>{PUZZLE.bottomWord}</div>
            </div>

            <input
              value={finalInput}
              onChange={(e) => setFinalInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && submitFinal()}
              placeholder="Type the combined answer..."
              style={{
                width: "100%",
                padding: "13px 14px",
                borderRadius: 10,
                border: finalResult === "wrong" ? "2px solid #cc1016" : "1.5px solid #b0b0b0",
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: 2,
                outline: "none",
                boxSizing: "border-box",
                textTransform: "uppercase",
                animation: shake ? "shake 0.4s ease" : "none",
              }}
            />
            {finalResult === "wrong" && (
              <div style={{ color: "#cc1016", fontSize: 13, marginTop: 4 }}>
                Not quite — try again!
              </div>
            )}

            <button
              onClick={submitFinal}
              style={{
                width: "100%",
                padding: "13px 0",
                borderRadius: 24,
                border: "none",
                background: "#0A66C2",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                marginTop: 14,
                marginBottom: 20,
              }}
            >
              Submit
            </button>
          </>
        )}

        {/* ── DONE ── */}
        {phase === PHASES.DONE && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            padding: "30px 0", gap: 16,
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "#057642", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path d="M8 19l7 7 13-13" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#000", textAlign: "center" }}>
              You solved it!
            </div>
            <div style={{
              background: "#f0faf4", border: "1.5px solid #057642",
              borderRadius: 12, padding: "16px 24px", textAlign: "center",
            }}>
              <div style={{ fontSize: 13, color: "#555", marginBottom: 4 }}>The answer was</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#057642", letterSpacing: 3 }}>
                KING + JACK
              </div>
            </div>
            <div style={{ fontSize: 13, color: "#888", textAlign: "center" }}>
              Come back tomorrow for a new puzzle!
            </div>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "12px 32px", borderRadius: 24,
                border: "1.5px solid #0A66C2", background: "#fff",
                color: "#0A66C2", fontSize: 14, fontWeight: 700, cursor: "pointer",
              }}
            >
              Play again
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
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
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        marginBottom: 6,
        borderRadius: 10,
        border: isDragOver
          ? "2px dashed #0A66C2"
          : valid
          ? "1.5px solid #b8d8b8"
          : "1.5px solid #e0c8b0",
        background: isDragging
          ? "#f0f0f0"
          : isDragOver
          ? "#e8f0fe"
          : valid
          ? "#f6fbf7"
          : "#fffbf5",
        opacity: isDragging ? 0.5 : 1,
        cursor: "grab",
        userSelect: "none",
        transition: "all 0.12s",
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, opacity: 0.4 }}>
        <circle cx="5" cy="4" r="1.5" fill="#666"/>
        <circle cx="11" cy="4" r="1.5" fill="#666"/>
        <circle cx="5" cy="8" r="1.5" fill="#666"/>
        <circle cx="11" cy="8" r="1.5" fill="#666"/>
        <circle cx="5" cy="12" r="1.5" fill="#666"/>
        <circle cx="11" cy="12" r="1.5" fill="#666"/>
      </svg>
      <div style={{ display: "flex", gap: 5, flex: 1, justifyContent: "center" }}>
        {word.split("").map((l, i) => (
          <div key={i} style={{
            width: 40, height: 44,
            border: "1.5px solid #b0b0b0",
            borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 700,
            background: "#fff",
          }}>{l}</div>
        ))}
      </div>
    </div>
  );
}

function LadderRow({ word, locked, isTop, isBottom, valid, unlocked }) {
  const isRevealed = unlocked;
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 12px",
      marginBottom: 6,
      borderRadius: 10,
      border: isRevealed ? "2px solid #0A66C2" : "1.5px dashed #c0c0c0",
      background: isRevealed ? "#e8f0fe" : "#f8f8f8",
    }}>
      <div style={{ width: 16, flexShrink: 0 }} />
      <div style={{ display: "flex", gap: 5, flex: 1, justifyContent: "center" }}>
        {(isRevealed ? word : word).split("").map((l, i) => (
          <div key={i} style={{
            width: 40, height: 44,
            border: isRevealed ? "2px solid #0A66C2" : "1.5px solid #c8c8c8",
            borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 700,
            background: isRevealed ? "#d0e4f7" : "#efefef",
            color: isRevealed ? "#0A66C2" : "#bbb",
          }}>
            {isRevealed ? l : "?"}
          </div>
        ))}
      </div>
    </div>
  );
}
