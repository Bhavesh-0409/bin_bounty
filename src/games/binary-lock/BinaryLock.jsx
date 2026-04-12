import { useEffect, useState } from "react";
import RulesScreen from "../../components/RulesScreen";
import LogicalGrid from "../logical-grid/logical";
import { rulesText } from "./rules";
import bgImage from "./binarylock.jpg";
import "./BinaryLock.css";

function BinaryLock() {
  const [startGame, setStartGame] = useState(false);
  const [showNextGame, setShowNextGame] = useState(false);
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [revealedClues, setRevealedClues] = useState(1);

  const correctAnswers = {
    1: "1101",
    2: "11100",
    3: "101010"
  };

  const questions = [
    {
      id: 1,
      title: "Level 1 (4-bit)",
      clues: [
        "Exactly 3 bits are 1",
        "First bit = 1",
        "Second bit ≠ third bit",
        "Last bit = second bit"
      ]
    },
    {
      id: 2,
      title: "Level 2 (5-bit)",
      clues: [
        "Exactly 3 bits are 1",
        "First bit ≠ last bit",
        "Second bit = third bit",
        "Fourth bit ≠ second bit",
        "At least one pair of consecutive 1s",
        "Fifth bit ≠ third bit"
      ]
    },
    {
      id: 3,
      title: "Level 3 (6-bit)",
      clues: [
        "Exactly 3 bits are 1",
        "First bit = 1",
        "Last bit = 0",
        "Second bit ≠ third bit",
        "Fourth bit = second bit",
        "Fifth bit ≠ fourth bit",
        "No two 1s are adjacent"
      ]
    }
  ];

  const handleChange = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setStatus((prev) => ({ ...prev, [id]: undefined }));
  };

  const playWrongBeep = () => {
    if (typeof window === "undefined") return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const audioCtx = new AudioContext();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(220, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.12);
    oscillator.onended = () => audioCtx.close();
  };

  const handleVerify = (id) => {
    const answer = (answers[id] || "").trim();

    if (!answer) {
      setStatus((prev) => ({ ...prev, [id]: "empty" }));
      return;
    }

    const valid = answer === correctAnswers[id];
    if (!valid) {
      playWrongBeep();
      setRevealedClues((prev) => Math.min(prev + 1, questions[currentQuestionIndex].clues.length));
    }

    setStatus((prev) => ({
      ...prev,
      [id]: valid ? "correct" : "incorrect"
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setRevealedClues(1);
    } else {
      setShowNextGame(true);
    }
  };

  if (showNextGame) {
    return <LogicalGrid />;
  }

  const q = questions[currentQuestionIndex];
  const isCorrect = q ? status[q.id] === "correct" : false;

  return startGame ? (
    <div className="binary-lock-container">
      <div className="cyber-panel">
        <h1 className="glitch-title" data-text="🔓 System Override">🔓 System Override</h1>
        <p className="subtitle">
          Initiate sequence. Incorrect inputs trigger trace protocols (clues).
        </p>

        {q && (
          <div key={q.id} className="question-box">
            <h2 className="level-title">{q.title}</h2>
            <ul className="clue-list">
              {q.clues.slice(0, revealedClues).map((clue, idx) => (
                <li key={idx} className="clue-item" style={{ animationDelay: `${idx * 0.1}s` }}>
                  {clue}
                </li>
              ))}
            </ul>
            
            <div className="controls-wrapper">
              {!isCorrect && (
                <>
                  <input
                    type="text"
                    className="cyber-input"
                    value={answers[q.id] || ""}
                    onChange={(event) => handleChange(q.id, event.target.value)}
                    placeholder="Enter binary..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleVerify(q.id);
                      }
                    }}
                  />
                  <button className="cyber-btn" onClick={() => handleVerify(q.id)}>
                    Verify
                  </button>
                </>
              )}
              
              {status[q.id] === "correct" && (
                <span className="status-msg status-correct">Correct!</span>
              )}
              {status[q.id] === "incorrect" && (
                <span className="status-msg status-incorrect">Try again</span>
              )}
              {status[q.id] === "empty" && (
                <span className="status-msg status-empty">Enter sequence</span>
              )}

              {isCorrect && (
                <button className="cyber-btn cyber-btn-success" onClick={handleNext}>
                  {currentQuestionIndex < questions.length - 1 ? "Crack Next Lock ➔" : "Access Granted ➔"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  ) : (
    <RulesScreen rules={rulesText} onStart={() => setStartGame(true)} />
  );
}

export default BinaryLock;