import { useEffect, useState } from "react";
import "./rules.css";

const hashStr = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
};

function RulesScreen({ rules, onStart }) {
  const hash = hashStr(rules);
  const hasSeen = !!localStorage.getItem(`rules_seen_${hash}`);

  const [displayedText, setDisplayedText] = useState(hasSeen ? rules : "");
  const [index, setIndex] = useState(hasSeen ? rules.length : 0);
  const [timeLeft, setTimeLeft] = useState(hasSeen ? 0 : 20);

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
          onClick={() => {
            if (timeLeft === 0) {
              localStorage.setItem(`rules_seen_${hash}`, "true");
              onStart();
            }
          }}
          style={timeLeft > 0 ? { opacity: 0.5, cursor: "not-allowed" } : {}}
        >
          {timeLeft > 0 ? `INITIALIZING... (${timeLeft}s)` : "START"}
        </button>
      </div>
    </div>
  );
}

export default RulesScreen;