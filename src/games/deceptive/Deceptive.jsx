// Deceptive.jsx
// Component for the Deceptive game
import { useState, useEffect, useRef, useCallback } from "react";
import RulesScreen from "../../components/RulesScreen";
import { rulesText } from "./rules";

const controlMaps = [
    {
        // Normal
        ArrowUp: { row: -1, col: 0 },
        ArrowDown: { row: 1, col: 0 },
        ArrowLeft: { row: 0, col: -1 },
        ArrowRight: { row: 0, col: 1 },
    },
    {
        // 90 degrees rotated (Clockwise)
        ArrowUp: { row: 0, col: 1 },
        ArrowDown: { row: 0, col: -1 },
        ArrowLeft: { row: -1, col: 0 },
        ArrowRight: { row: 1, col: 0 },
    },
    {
        // Opposite
        ArrowUp: { row: 1, col: 0 },
        ArrowDown: { row: -1, col: 0 },
        ArrowLeft: { row: 0, col: 1 },
        ArrowRight: { row: 0, col: -1 },
    },
];

const bombTriggers = [8, 15];

const ARROW_KEYS = new Set([
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
]);

const hashStr = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
};

function Deceptive({ onComplete }) {
  const [startGame, setStartGame] = useState(() => {
    return !!localStorage.getItem(`rules_seen_${hashStr(rulesText)}`);
  });

    const grid = [
        ["S", 0, 0, 0, 1, 0, 0, 0],
        [1, 1, 0, 0, 0, 1, 0, 0],
        [0, 0, 1, 0, 1, 0, 0, 0],
        [1, 0, 0, 1, 0, 0, 1, 0],
        [0, 1, 0, 0, 0, 0, 0, 1],
        [0, 0, 1, 0, 1, 0, 0, 0],
        [1, 0, 0, 0, 0, 1, 0, 1], // ← added 1 here (key fix)
        [0, 0, 1, 0, 0, 0, 1, "G"]
    ];

    const ROWS = grid.length;
    const COLS = grid[0].length;

    const [player, setPlayer] = useState({ row: 0, col: 0 });
    const [hearts, setHearts] = useState(2);
    const [visited, setVisited] = useState(() => new Set(["0,0"]));
    const [moveCount, setMoveCount] = useState(0);
    const [controlMode, setControlMode] = useState(0);
    const [bombTiles, setBombTiles] = useState(() => new Set());
    const [shock, setShock] = useState(false);
    const [message, setMessage] = useState("");
    const [messageOpacity, setMessageOpacity] = useState(0);
    const [messageTone, setMessageTone] = useState("");
    /** Full-screen red tint (~200ms) on bomb */
    const [redFlash, setRedFlash] = useState(false);
    /** Triggers CSS shake on main play area */
    const [screenShake, setScreenShake] = useState(false);

    const gameRef = useRef({
        player,
        hearts,
        visited,
        controlMode,
        moveCount,
        bombTiles,
    });
    gameRef.current = {
        player,
        hearts,
        visited,
        controlMode,
        moveCount,
        bombTiles,
    };

    const shockTimerRef = useRef(null);
    const messageAnimRef = useRef(null);
    const redFlashTimerRef = useRef(null);
    const shakeTimerRef = useRef(null);

    useEffect(() => {
        if (!message) {
            setMessageOpacity(0);
            setMessageTone("");
            return undefined;
        }

        setMessageOpacity(0);
        const fadeIn = requestAnimationFrame(() => {
            setMessageOpacity(1);
        });

        if (messageAnimRef.current) {
            clearTimeout(messageAnimRef.current.t1);
            clearTimeout(messageAnimRef.current.t2);
        }

        const t1 = setTimeout(() => setMessageOpacity(0), 1100);
        const t2 = setTimeout(() => {
            setMessage("");
            setMessageTone("");
            messageAnimRef.current = null;
        }, 1500);
        messageAnimRef.current = { t1, t2 };

        return () => {
            cancelAnimationFrame(fadeIn);
            if (messageAnimRef.current) {
                clearTimeout(messageAnimRef.current.t1);
                clearTimeout(messageAnimRef.current.t2);
            }
        };
    }, [message]);

    const [padActive, setPadActive] = useState(null);

    const tryMove = useCallback((key) => {
        const {
            player: p,
            hearts: h,
            visited: vis,
            controlMode: mode,
            moveCount: mc,
            bombTiles: bombs,
        } = gameRef.current;

        const move = controlMaps[mode][key];
        if (!move) return;

        const newRow = p.row + move.row;
        const newCol = p.col + move.col;

        if (newRow < 0 || newCol < 0 || newRow >= ROWS || newCol >= COLS) return;

        const tile = grid[newRow][newCol];
        const cellKey = `${newRow},${newCol}`;

        let newHearts = h;

        if (tile === 0) {
            newHearts -= 1;
        } else if (tile === 1) {
            if (!vis.has(cellKey)) {
                newHearts += 1;
            }
        }

        newHearts = Math.min(2, newHearts);

        if (newHearts <= 0) {
            const reset = {
                player: { row: 0, col: 0 },
                hearts: 2,
                visited: new Set(["0,0"]),
                controlMode: 0,
                moveCount: 0,
                bombTiles: new Set(),
            };
            gameRef.current = reset;
            setPlayer(reset.player);
            setHearts(reset.hearts);
            setVisited(reset.visited);
            setControlMode(reset.controlMode);
            setMoveCount(reset.moveCount);
            setBombTiles(reset.bombTiles);
            setShock(false);
            setMessage("");
            setMessageOpacity(0);
            setMessageTone("lose");
            setMessage("⚠️ SIGNAL LOST. RETRY!");
            return;
        }

        const nextVisited = new Set(vis);
        nextVisited.add(cellKey);

        const newMoveCount = mc + 1;
        let newControlMode = mode;
        const nextBombTiles = new Set(bombs);

        if (bombTriggers.includes(newMoveCount)) {
            nextBombTiles.add(cellKey);
            newControlMode = (mode + 1) % 3;
            setShock(true);
            if (shockTimerRef.current) clearTimeout(shockTimerRef.current);
            shockTimerRef.current = setTimeout(() => {
                setShock(false);
                shockTimerRef.current = null;
            }, 500);

            setRedFlash(true);
            if (redFlashTimerRef.current) clearTimeout(redFlashTimerRef.current);
            redFlashTimerRef.current = setTimeout(() => {
                setRedFlash(false);
                redFlashTimerRef.current = null;
            }, 200);

            setScreenShake(true);
            if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
            shakeTimerRef.current = setTimeout(() => {
                setScreenShake(false);
                shakeTimerRef.current = null;
            }, 400);

            setMessageTone("bomb");
            setMessage("⚠️ BOMB TRIGGERED- CONTROLS MAY HAVE CHANGED!!");
        }

        const nextPlayer = { row: newRow, col: newCol };
        gameRef.current = {
            player: nextPlayer,
            hearts: newHearts,
            visited: nextVisited,
            controlMode: newControlMode,
            moveCount: newMoveCount,
            bombTiles: nextBombTiles,
        };

        setPlayer(nextPlayer);
        setHearts(newHearts);
        setVisited(nextVisited);
        setMoveCount(newMoveCount);
        setControlMode(newControlMode);
        setBombTiles(nextBombTiles);

        if (tile === "G") {
            setMessageTone("win");
            setMessage("🎉 Access Granted");
            if (onComplete) {
                setTimeout(onComplete, 4000);
            }
        }
    }, [onComplete]);

    useEffect(() => {
        if (!startGame) return;

        const handleKeyDown = (e) => {
            if (!ARROW_KEYS.has(e.key)) return;
            e.preventDefault();
            tryMove(e.key);
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [startGame, tryMove]);

    const cellKey = (r, c) => `${r},${c}`;

    const arrowBase = {
        minWidth: 72,
        minHeight: 72,
        fontSize: 28,
        lineHeight: 1,
        borderRadius: 8,
        padding: 10,
        boxSizing: "border-box",
        border: "1px solid #22d3d3",
        background: "#111",
        color: "#22d3d3",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        WebkitTapHighlightColor: "transparent",
        transition: "all 0.2s ease",
    };

    const arrowGlow = (arrowKey) => {
        const on = padActive === arrowKey;
        return on
            ? {
                boxShadow:
                    "0 0 14px rgba(34, 211, 211, 0.85), 0 0 22px rgba(34, 211, 211, 0.45)",
                borderColor: "#5ffbfb",
                color: "#bfffff",
            }
            : {};
    };

    const overlayBackdrop =
        messageTone === "lose" ? "rgba(0, 0, 0, 0.78)" : "rgba(0, 0, 0, 0.6)";

    const messageCardStyle =
        messageTone === "lose"
            ? {
                color: "#ff3b3b",
                textShadow:
                    "0 0 20px #ff0000, 0 0 40px rgba(255, 0, 0, 0.85), 0 0 8px #ff4444",
            }
            : messageTone === "bomb"
                ? {
                    color: "#ff4d8a",
                    textShadow:
                        "0 0 18px #ff0066, 0 0 36px rgba(255, 0, 100, 0.9), 0 0 6px #ff2e88",
                }
                : messageTone === "win"
                    ? {
                        color: "#ffffff",
                        textShadow:
                            "0 0 14px rgba(0, 255, 255, 0.75), 0 0 24px rgba(120, 255, 200, 0.5)",
                    }
                    : {
                        color: "#ffffff",
                        textShadow: "0 0 12px rgba(255, 0, 0, 0.65)",
                    };

    return startGame ? (
        <>
            <style>
                {`
@keyframes deceptiveScreenShake {
  0%, 100% { transform: translateX(0); }
  15% { transform: translateX(-4px); }
  30% { transform: translateX(4px); }
  45% { transform: translateX(-3px); }
  60% { transform: translateX(3px); }
  75% { transform: translateX(-2px); }
  90% { transform: translateX(2px); }
}
        `}
            </style>
            <div
                style={{
                    position: "relative",
                    minHeight: "100vh",
                    overflow: "hidden",
                    backgroundColor: "#000",
                }}
            >
                {message ? (
                    <div
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 950,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 20,
                            boxSizing: "border-box",
                            background: overlayBackdrop,
                            opacity: messageOpacity,
                            transition: "opacity 0.35s ease, transform 0.35s ease",
                            pointerEvents: messageOpacity > 0.05 ? "auto" : "none",
                        }}
                        aria-live="assertive"
                        role="status"
                    >
                        <div
                            style={{
                                maxWidth: "min(92vw, 420px)",
                                padding: "16px 24px",
                                borderRadius: 10,
                                fontSize: "clamp(28px, 6vw, 36px)",
                                fontWeight: 700,
                                textAlign: "center",
                                lineHeight: 1.25,
                                transition: "all 0.2s ease",
                                ...messageCardStyle,
                            }}
                        >
                            {message}
                        </div>
                    </div>
                ) : null}

                {redFlash && (
                    <div
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 980,
                            background: "rgba(255, 0, 0, 0.2)",
                            pointerEvents: "none",
                            transition: "opacity 0.08s ease",
                        }}
                        aria-hidden
                    />
                )}

                <div
                    style={{
                        minHeight: "100vh",
                        boxSizing: "border-box",
                        padding: "24px 16px 32px",
                        backgroundColor: "#000",
                        backgroundImage:
                            "radial-gradient(ellipse 120% 80% at 50% 20%, #0f0f0f 0%, #000000 55%, #000000 100%)",
                        color: "#fff",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 16,
                        transition: "all 0.2s ease",
                        animation: screenShake
                            ? "deceptiveScreenShake 0.38s ease"
                            : "none",
                    }}
                >
                    <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }}>
                        <button onClick={() => setStartGame(false)} style={{ background: 'transparent', color: '#00ff00', border: '1px solid #00ff00', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace' }}>VIEW MODULE RULES</button>
                    </div>
                    <div
                        style={{
                            fontSize: 28,
                            letterSpacing: 6,
                            userSelect: "none",
                            textShadow: "0 0 8px rgba(255, 0, 80, 0.9)",
                        }}
                        aria-label={`${hearts} hearts`}
                    >
                        {Array.from({ length: hearts }, (_, i) => (
                            <span key={i}>❤️ </span>
                        ))}
                    </div>

                    <p
                        style={{
                            margin: 0,
                            fontSize: 14,
                            color: "#f5f5f5",
                            maxWidth: 320,
                            textAlign: "center",
                            textShadow: "0 0 5px rgba(255, 255, 255, 0.35)",
                        }}
                    >
                        Controls may not behave as expected
                    </p>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: `repeat(${COLS}, minmax(36px, 44px))`,
                            gap: 8,
                            justifyContent: "center",
                            marginTop: 8,
                            transition: "transform 0.2s ease, box-shadow 0.2s ease",
                            transform: shock
                                ? "scale(1.03) translate(3px, -2px)"
                                : "scale(1) translate(0, 0)",
                            boxShadow: shock
                                ? "0 0 28px rgba(0, 255, 255, 0.55), 0 0 42px rgba(255, 20, 147, 0.38)"
                                : "none",
                            borderRadius: 8,
                        }}
                    >
                        {grid.map((row, r) =>
                            row.map((cell, c) => {
                                const key = cellKey(r, c);
                                const isPlayer = player.row === r && player.col === c;
                                const wasVisited = visited.has(key);
                                const isGoal = cell === "G";
                                const isBomb = bombTiles.has(key);

                                let boxShadow = "none";
                                let borderColor = "rgba(0, 255, 255, 0.2)";
                                if (isPlayer) {
                                    boxShadow = "0 0 10px cyan, 0 0 18px rgba(0, 255, 255, 0.55)";
                                    borderColor = "rgba(0, 255, 255, 0.65)";
                                } else if (isGoal) {
                                    boxShadow = "0 0 10px lime, 0 0 18px rgba(50, 255, 50, 0.5)";
                                    borderColor = "rgba(57, 255, 20, 0.45)";
                                }

                                let content;
                                if (isPlayer) {
                                    content = "🟦";
                                } else if (isBomb) {
                                    content = "💣";
                                } else if (isGoal) {
                                    content = "🏁";
                                } else if (cell === "S") {
                                    content = "";
                                } else {
                                    content = cell;
                                }

                                return (
                                    <div
                                        key={key}
                                        style={{
                                            aspectRatio: "1",
                                            border: `1px solid ${borderColor}`,
                                            borderRadius: 6,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 16,
                                            fontWeight: 500,
                                            backgroundColor: wasVisited ? "#080808" : "#111",
                                            color: wasVisited
                                                ? "rgba(255,255,255,0.5)"
                                                : "rgba(255,255,255,0.92)",
                                            textShadow: "0 0 5px rgba(255, 255, 255, 0.25)",
                                            boxSizing: "border-box",
                                            boxShadow,
                                        }}
                                    >
                                        {content}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div
                        style={{
                            marginTop: 12,
                            display: "grid",
                            gridTemplateColumns: "72px 72px 72px",
                            gridTemplateRows: "72px 72px 72px",
                            gap: 10,
                            justifyItems: "center",
                            alignItems: "center",
                        }}
                    >
                        <span />
                        <button
                            type="button"
                            style={{
                                ...arrowBase,
                                ...arrowGlow("ArrowUp"),
                                gridColumn: 2,
                                gridRow: 1,
                            }}
                            aria-label="Move up control"
                            onClick={() => tryMove("ArrowUp")}
                            onPointerDown={() => setPadActive("ArrowUp")}
                            onPointerUp={() => setPadActive(null)}
                            onPointerLeave={() => setPadActive(null)}
                            onPointerCancel={() => setPadActive(null)}
                        >
                            ↑
                        </button>
                        <span />
                        <button
                            type="button"
                            style={{
                                ...arrowBase,
                                ...arrowGlow("ArrowLeft"),
                                gridColumn: 1,
                                gridRow: 2,
                            }}
                            aria-label="Move left control"
                            onClick={() => tryMove("ArrowLeft")}
                            onPointerDown={() => setPadActive("ArrowLeft")}
                            onPointerUp={() => setPadActive(null)}
                            onPointerLeave={() => setPadActive(null)}
                            onPointerCancel={() => setPadActive(null)}
                        >
                            ←
                        </button>
                        <button
                            type="button"
                            style={{
                                ...arrowBase,
                                ...arrowGlow("ArrowDown"),
                                gridColumn: 2,
                                gridRow: 2,
                            }}
                            aria-label="Move down control"
                            onClick={() => tryMove("ArrowDown")}
                            onPointerDown={() => setPadActive("ArrowDown")}
                            onPointerUp={() => setPadActive(null)}
                            onPointerLeave={() => setPadActive(null)}
                            onPointerCancel={() => setPadActive(null)}
                        >
                            ↓
                        </button>
                        <button
                            type="button"
                            style={{
                                ...arrowBase,
                                ...arrowGlow("ArrowRight"),
                                gridColumn: 3,
                                gridRow: 2,
                            }}
                            aria-label="Move right control"
                            onClick={() => tryMove("ArrowRight")}
                            onPointerDown={() => setPadActive("ArrowRight")}
                            onPointerUp={() => setPadActive(null)}
                            onPointerLeave={() => setPadActive(null)}
                            onPointerCancel={() => setPadActive(null)}
                        >
                            →
                        </button>
                    </div>
                </div>
            </div>
        </>
    ) : (
        <RulesScreen rules={rulesText} onStart={() => setStartGame(true)} />
    );
}

export default Deceptive;