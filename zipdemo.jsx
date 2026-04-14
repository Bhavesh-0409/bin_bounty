import { useEffect, useRef, useState, useCallback } from "react";

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

export default function ZipGame() {
  const canvasRef = useRef(null);
  const [path, setPath] = useState([]);
  const [status, setStatus] = useState("Connect 1 → 2 → 3 → … → 8 in order. Start from node 1.");
  const [solved, setSolved] = useState(false);
  const draggingRef = useRef(false);
  const pathRef = useRef([]);

  pathRef.current = path;

  const draw = useCallback((currentPath) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, W, H);

    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
    const lineColor = "#378ADD";
    const nodeBase = isDark ? "#1a1a2e" : "#1e1e2e";
    const textColor = "#fff";

    // Grid
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
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
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = 0.55;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Nodes
    Object.entries(NODES).forEach(([n, { r, c }]) => {
      const x = c * CELL + CELL / 2, y = r * CELL + CELL / 2;
      const num = +n;
      const visited = inPath(currentPath, r, c);

      // Glow for visited
      if (visited) {
        ctx.beginPath();
        ctx.arc(x, y, 24, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(55,138,221,0.18)";
        ctx.fill();
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.fillStyle = visited ? "#378ADD" : nodeBase;
      ctx.fill();

      // Ring for node 1 (start)
      if (num === 1) {
        ctx.beginPath();
        ctx.arc(x, y, 22, 0, Math.PI * 2);
        ctx.strokeStyle = "#e05a2b";
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // Number label
      ctx.fillStyle = textColor;
      ctx.font = "bold 14px monospace";
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
    e.preventDefault();
    const { x, y } = getPos(e);
    const { r, c } = cellOf(x, y);
    if (!nodeAt[`${r},${c}`]) return;
    const num = nodeAt[`${r},${c}`];
    if (num !== 1) {
      setStatus("Start from node 1!");
      return;
    }
    const newPath = [{ r, c }];
    setPath(newPath);
    draggingRef.current = true;
    setSolved(false);
    setStatus("Path length: 1");
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!draggingRef.current) return;
    e.preventDefault();
    const { x, y } = getPos(e);
    const { r, c } = cellOf(x, y);
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;

    setPath(prev => {
      const last = prev[prev.length - 1];
      if (!last || (last.r === r && last.c === c)) return prev;

      // Undo step (backtrack)
      if (prev.length >= 2 && prev[prev.length - 2].r === r && prev[prev.length - 2].c === c) {
        const next = prev.slice(0, -1);
        setStatus(`Path length: ${next.length}`);
        return next;
      }

      if (!adj(last, { r, c })) return prev;
      if (inPath(prev, r, c)) return prev;

      const prevOrder = nodeOrder(prev);
      const nextNode = nodeAt[`${r},${c}`];
      if (nextNode) {
        const expected = prevOrder.length + 1;
        if (nextNode !== expected) {
          setStatus(`Next node should be ${expected}, not ${nextNode}`);
          return prev;
        }
      }

      const next = [...prev, { r, c }];
      if (isComplete(next)) {
        setStatus("🎉 Puzzle solved!");
        draggingRef.current = false;
        setSolved(true);
      } else {
        setStatus(`Path length: ${next.length}`);
      }
      return next;
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    draggingRef.current = false;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("touchstart", handleMouseDown, { passive: false });
    canvas.addEventListener("touchmove", handleMouseMove, { passive: false });
    canvas.addEventListener("touchend", handleMouseUp);
    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("touchstart", handleMouseDown);
      canvas.removeEventListener("touchmove", handleMouseMove);
      canvas.removeEventListener("touchend", handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  function resetGame() {
    setPath([]);
    setSolved(false);
    draggingRef.current = false;
    setStatus("Connect 1 → 2 → 3 → … → 8 in order. Start from node 1.");
  }

  function undoStep() {
    setPath(prev => {
      if (prev.length > 1) return prev.slice(0, -1);
      if (prev.length === 1) return [];
      return prev;
    });
    setSolved(false);
  }

  return (
    <div style={{ fontFamily: "monospace", padding: "1rem 0" }}>
      <div style={{
        fontSize: 13,
        color: solved ? "#378ADD" : "var(--color-text-secondary, #888)",
        marginBottom: 12,
        minHeight: 20,
        fontWeight: solved ? 700 : 400,
        letterSpacing: "0.01em"
      }}>
        {status}
      </div>

      <div style={{
        display: "inline-block",
        border: "1.5px solid var(--color-border-primary, #333)",
        borderRadius: 12,
        overflow: "hidden",
        userSelect: "none",
        cursor: "crosshair",
        boxShadow: solved ? "0 0 0 2px #378ADD44" : "none",
        transition: "box-shadow 0.3s"
      }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{ display: "block", width: "min(420px, calc(100vw - 2rem))", height: "auto" }}
        />
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button
          onClick={resetGame}
          style={{
            fontSize: 13,
            padding: "5px 14px",
            borderRadius: 6,
            border: "1px solid var(--color-border-primary, #444)",
            background: "transparent",
            color: "inherit",
            cursor: "pointer",
            fontFamily: "monospace"
          }}
        >
          Reset
        </button>
        <button
          onClick={undoStep}
          style={{
            fontSize: 13,
            padding: "5px 14px",
            borderRadius: 6,
            border: "1px solid var(--color-border-primary, #444)",
            background: "transparent",
            color: "inherit",
            cursor: "pointer",
            fontFamily: "monospace"
          }}
        >
          Undo
        </button>
      </div>
    </div>
  );
}
