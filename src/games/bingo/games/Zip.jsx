import React, { useEffect, useRef, useState, useCallback } from 'react';

const COLS = 7, ROWS = 7, CELL = 60;
const W = COLS * CELL, H = ROWS * CELL;

const NODES = {
  2: { r: 0, c: 0 }, 6: { r: 0, c: 6 }, 5: { r: 1, c: 2 }, 7: { r: 2, c: 5 },
  3: { r: 3, c: 1 }, 1: { r: 4, c: 4 }, 4: { r: 6, c: 0 }, 8: { r: 6, c: 6 }
};

const nodeAt = {};
Object.entries(NODES).forEach(([n, { r, c }]) => { nodeAt[`${r},${c}`] = +n; });

function adj(a, b) {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
}

function inPath(path, r, c) {
  return path.some(p => p.r === r && p.c === c);
}

function nodeOrder(path) {
  return path.map(p => nodeAt[`${p.r},${p.c}`]).filter(Boolean);
}

function isComplete(path) {
  const order = nodeOrder(path);
  if (order.length !== 8) return false;
  for (let i = 0; i < 8; i++) if (order[i] !== i + 1) return false;
  return true;
}

export default function Zip({ onComplete, onBack }) {
  const canvasRef = useRef(null);
  const [path, setPath] = useState([]);
  const [status, setStatus] = useState("Connect 1 → 2 → 3 → … → 8 in order. Start from node 1.");
  const [solved, setSolved] = useState(false);
  const draggingRef = useRef(false);

  const draw = useCallback((currentPath) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, W, H);

    const gridColor = "rgba(0, 255, 224, 0.1)";
    const lineColor = "#00ffe0";
    const nodeBase = "#050505";
    const textColor = "#00ffe0";

    // Grid
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let r = 0; r <= ROWS; r++) {
      ctx.beginPath(); ctx.moveTo(0, r * CELL); ctx.lineTo(W, r * CELL); ctx.stroke();
    }
    for (let c = 0; c <= COLS; c++) {
      ctx.beginPath(); ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, H); ctx.stroke();
    }

    // Path line
    if (currentPath.length > 1) {
      ctx.beginPath();
      ctx.moveTo(currentPath[0].c * CELL + CELL / 2, currentPath[0].r * CELL + CELL / 2);
      for (let i = 1; i < currentPath.length; i++) {
        ctx.lineTo(currentPath[i].c * CELL + CELL / 2, currentPath[i].r * CELL + CELL / 2);
      }
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowColor = "#00ffe0";
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0; // reset
    }

    // Nodes
    Object.entries(NODES).forEach(([n, { r, c }]) => {
      const x = c * CELL + CELL / 2, y = r * CELL + CELL / 2;
      const num = +n;
      const visited = inPath(currentPath, r, c);

      if (visited) {
        ctx.beginPath();
        ctx.arc(x, y, 22, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 255, 224, 0.2)";
        ctx.fill();
        ctx.shadowColor = "#00ffe0";
        ctx.shadowBlur = 15;
      } else {
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
      }

      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.fillStyle = visited ? "#00ffe0" : nodeBase;
      ctx.fill();

      ctx.lineWidth = 2;
      ctx.strokeStyle = "#00ffe0";
      ctx.stroke();

      ctx.shadowBlur = 0;
      if (num === 1 && !visited) {
        ctx.beginPath();
        ctx.arc(x, y, 22, 0, Math.PI * 2);
        ctx.strokeStyle = "#ff00e0";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.fillStyle = visited ? "#000" : textColor;
      ctx.font = "bold 16px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(num, x, y);
    });
  }, []);

  useEffect(() => {
    draw(path);
  }, [path, draw]);

  function cellOf(x, y) {
    return { c: Math.floor(x / CELL), r: Math.floor(y / CELL) };
  }

  function getPos(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  }

  const handleMouseDown = useCallback((e) => {
    if (solved) return;
    e.preventDefault();
    const { x, y } = getPos(e);
    const { r, c } = cellOf(x, y);

    setPath(prev => {
      if (prev.length === 0) {
        if (!nodeAt[`${r},${c}`] || nodeAt[`${r},${c}`] !== 1) {
          setStatus("Start from node 1!");
          return prev;
        }
        draggingRef.current = true;
        setSolved(false);
        setStatus("Path length: 1");
        return [{ r, c }];
      }

      const last = prev[prev.length - 1];

      // If clicking the last node, start dragging
      if (last.r === r && last.c === c) {
        draggingRef.current = true;
        return prev;
      }

      // If clicking the previous node, undo
      if (prev.length >= 2 && prev[prev.length - 2].r === r && prev[prev.length - 2].c === c) {
        const next = prev.slice(0, -1);
        setStatus(`Path length: ${next.length}`);
        draggingRef.current = true;
        return next;
      }

      // If clicking an adjacent cell, move there (tap to play)
      if (adj(last, { r, c })) {
        if (inPath(prev, r, c)) return prev;
        const nextNode = nodeAt[`${r},${c}`];
        if (nextNode) {
          const expectedOrder = nodeOrder(prev).length + 1;
          if (nextNode !== expectedOrder) {
            setStatus(`Next node should be ${expectedOrder}, not ${nextNode}`);
            return prev;
          }
        }
        
        const nextPath = [...prev, { r, c }];
        if (isComplete(nextPath)) {
          setStatus("✅ Puzzle solved!");
          draggingRef.current = false;
          setSolved(true);
          setTimeout(() => { onComplete("ZIP"); }, 1000);
        } else {
          setStatus(`Path length: ${nextPath.length}`);
          draggingRef.current = true;
        }
        return nextPath;
      }

      // Ignore arbitrary clicks elsewhere instead of resetting
      return prev;
    });
  }, [solved, onComplete]);

  const handleMouseMove = useCallback((e) => {
    if (!draggingRef.current) return;
    e.preventDefault();
    const { x, y } = getPos(e);
    const { r, c } = cellOf(x, y);
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;

    setPath(prev => {
      const last = prev[prev.length - 1];
      if (!last || (last.r === r && last.c === c)) return prev;

      if (prev.length >= 2 && prev[prev.length - 2].r === r && prev[prev.length - 2].c === c) {
        const next = prev.slice(0, -1);
        setStatus(`Path length: ${next.length}`);
        return next;
      }

      let rLast = last.r;
      let cLast = last.c;
      let rDiff = r - rLast;
      let cDiff = c - cLast;

      let nextPath = [...prev];

      if ((rDiff === 0 && Math.abs(cDiff) > 0) || (cDiff === 0 && Math.abs(rDiff) > 0)) {
        let stepR = rDiff === 0 ? 0 : Math.sign(rDiff);
        let stepC = cDiff === 0 ? 0 : Math.sign(cDiff);
        let currR = rLast;
        let currC = cLast;
        
        while (currR !== r || currC !== c) {
          currR += stepR;
          currC += stepC;
          
          let pLast = nextPath[nextPath.length - 1];
          
          if (nextPath.length >= 2 && nextPath[nextPath.length - 2].r === currR && nextPath[nextPath.length - 2].c === currC) {
              nextPath.pop();
              continue;
          }
          
          if (!adj(pLast, { r: currR, c: currC })) return prev;
          if (inPath(nextPath, currR, currC)) return prev;
          
          const nextNode = nodeAt[`${currR},${currC}`];
          if (nextNode) {
            const expectedOrder = nodeOrder(nextPath).length + 1;
            if (nextNode !== expectedOrder) {
              setStatus(`Next node should be ${expectedOrder}, not ${nextNode}`);
              return prev;
            }
          }
          nextPath.push({ r: currR, c: currC });
        }
      } else if (adj(last, { r, c })) {
        if (inPath(prev, r, c)) return prev;
        const nextNode = nodeAt[`${r},${c}`];
        if (nextNode) {
          const expectedOrder = nodeOrder(prev).length + 1;
          if (nextNode !== expectedOrder) {
            setStatus(`Next node should be ${expectedOrder}, not ${nextNode}`);
            return prev;
          }
        }
        nextPath.push({ r, c });
      } else {
        return prev;
      }

      if (isComplete(nextPath)) {
        setStatus("✅ Puzzle solved!");
        draggingRef.current = false;
        setSolved(true);
        setTimeout(() => {
          onComplete("ZIP");
        }, 1000);
      } else {
        setStatus(`Path length: ${nextPath.length}`);
      }
      return nextPath;
    });
  }, [onComplete]);

  const handleMouseUp = useCallback(() => {
    draggingRef.current = false;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("touchstart", handleMouseDown, { passive: false });
    canvas.addEventListener("touchmove", handleMouseMove, { passive: false });
    canvas.addEventListener("touchend", handleMouseUp);
    return () => {
      if (!canvas) return;
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("touchstart", handleMouseDown);
      canvas.removeEventListener("touchmove", handleMouseMove);
      canvas.removeEventListener("touchend", handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  function resetGame() {
    if (solved) return;
    setPath([]);
    setSolved(false);
    draggingRef.current = false;
    setStatus("Connect 1 → 2 → 3 → … → 8 in order. Start from node 1.");
  }

  function undoStep() {
    if (solved) return;
    setPath(prev => {
      if (prev.length > 1) return prev.slice(0, -1);
      if (prev.length === 1) return [];
      return prev;
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '20px' }}>
      <div style={{ alignSelf: 'flex-start', marginBottom: '40px', width: '100%', paddingLeft: '20px' }}>
        <button className="cyber-btn" onClick={onBack}>⬅ BACK TO GRID</button>
      </div>

      <h2 style={{ textShadow: '0 0 10px #00ffe0', fontSize: '2.5rem', marginBottom: '10px' }}>ZIP SEQUENCER</h2>

      <div style={{
        fontSize: '1.2rem',
        color: solved ? "#00ff00" : "#ff00e0",
        marginBottom: '20px',
        minHeight: '20px',
        fontWeight: solved ? 700 : 400,
        textShadow: solved ? '0 0 10px #00ff00' : '0 0 10px #ff00e0'
      }}>
        {status}
      </div>

      <div style={{
        display: "inline-block",
        border: "1px solid #00ffe0",
        borderRadius: '8px',
        overflow: "hidden",
        userSelect: "none",
        cursor: "crosshair",
        boxShadow: solved ? "0 0 30px rgba(0, 255, 0, 0.4)" : "0 0 15px rgba(0, 255, 224, 0.4)",
        transition: "box-shadow 0.3s",
        backgroundColor: '#0a0a0a'
      }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{ display: "block", width: "min(420px, calc(100vw - 2rem))", height: "auto" }}
        />
      </div>

      <div style={{ marginTop: '30px', display: "flex", gap: '15px' }}>
        <button
          className="cyber-btn"
          onClick={resetGame}
          style={{ borderColor: '#ff003c', color: '#ff003c', textShadow: '0 0 5px #ff003c', boxShadow: '0 0 5px #ff003c inset' }}
        >
          CLEAR BUFFER
        </button>
        <button
          className="cyber-btn"
          onClick={undoStep}
        >
          UNDO STEP
        </button>
      </div>
    </div>
  );
}
