import { useEffect, useState } from "react";
import "./rules.css";

function RulesScreen({ rules, onStart }) {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);

  // typing effect
  useEffect(() => {
    if (index < rules.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + rules[index]);
        setIndex(index + 1);
      }, 20);
      return () => clearTimeout(timeout);
    }
  }, [index, rules]);

  // 20 second mandatory read time
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  return (
    <div className="rules-container">
      <div className="overlay">
        <h1>MISSION BRIEF</h1>
        <p className="rules-text">{displayedText}</p>

        <button 
          className="start-btn" 
          onClick={() => timeLeft === 0 && onStart()}
          style={timeLeft > 0 ? { opacity: 0.5, cursor: "not-allowed" } : {}}
        >
          {timeLeft > 0 ? `INITIALIZING... (${timeLeft}s)` : "START"}
        </button>
      </div>
    </div>
  );
}

export default RulesScreen;