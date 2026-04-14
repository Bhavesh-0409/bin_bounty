import React, { useState, useEffect } from 'react';

export default function Arithmetic({ onComplete, onBack }) {
  const [answers, setAnswers] = useState({
    p1: false,
    p2: false
  });

  // Puzzle 1 State
  const [p1_op1, setP1Op1] = useState('+');
  const [p1_op2, setP1Op2] = useState('+');
  const [p1_op3, setP1Op3] = useState('+');
  const [p1_error, setP1Error] = useState('');

  // Puzzle 2 State
  const [p2_op1, setP2Op1] = useState('+');
  const [p2_op2, setP2Op2] = useState('+');
  const [p2_op3, setP2Op3] = useState('+');
  const [p2_error, setP2Error] = useState('');

  const target1 = 6;
  const target2 = 10;

  useEffect(() => {
    if (answers.p1 && answers.p2) {
      // Small timeout to let user see the 2nd solved state before unmounting
      setTimeout(() => {
        onComplete("ARITH");
      }, 800);
    }
  }, [answers, onComplete]);

  const handleSubmit1 = () => {
    try {
      const expression = `8 ${p1_op1} 4 ${p1_op2} 2 ${p1_op3} 2`;
      // eslint-disable-next-line no-new-func
      const result = new Function(`return ${expression}`)();
      
      if (result === target1) {
        setAnswers(prev => ({ ...prev, p1: true }));
        setP1Error('');
      } else {
        setP1Error(`ACCESS DENIED: ${result} IS NOT ${target1}`);
      }
    } catch (err) {
      setP1Error("INVALID SEQUENCE");
    }
  };

  const handleSubmit2 = () => {
    try {
      const expression = `20 ${p2_op1} 5 ${p2_op2} 3 ${p2_op3} 2`;
      // eslint-disable-next-line no-new-func
      const result = new Function(`return ${expression}`)();
      
      if (result === target2) {
        setAnswers(prev => ({ ...prev, p2: true }));
        setP2Error('');
      } else {
        setP2Error(`ACCESS DENIED: ${result} IS NOT ${target2}`);
      }
    } catch (err) {
      setP2Error("INVALID SEQUENCE");
    }
  };

  const operators = ['+', '-', '*', '/'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '20px' }}>
      <div style={{ alignSelf: 'flex-start', marginBottom: '20px', width: '100%', paddingLeft: '20px' }}>
        <button className="cyber-btn" onClick={onBack}>⬅ BACK TO GRID</button>
      </div>
      
      <h2 style={{ textShadow: '0 0 10px #00ffe0', fontSize: '2.5rem', marginBottom: '30px' }}>ARITHMETIC OVERRIDE</h2>
      
      {/* PUZZLE 1 */}
      <div style={{ 
        padding: '20px', border: '1px solid #00ffe0', borderRadius: '8px', marginBottom: '30px', 
        backgroundColor: '#0a0a0a', boxShadow: '0 0 10px rgba(0,255,224,0.1)', width: '100%', maxWidth: '650px' 
      }}>
        <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Puzzle 1: Match the target value <strong>{target1}</strong></p>
        
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', flexWrap: 'wrap' }}>
          <span>8</span>
          <select className="cyber-select" value={p1_op1} onChange={(e) => setP1Op1(e.target.value)} disabled={answers.p1}>
            {operators.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <span>4</span>
          <select className="cyber-select" value={p1_op2} onChange={(e) => setP1Op2(e.target.value)} disabled={answers.p1}>
            {operators.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <span>2</span>
          <select className="cyber-select" value={p1_op3} onChange={(e) => setP1Op3(e.target.value)} disabled={answers.p1}>
            {operators.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <span>2</span>
          <span>= {target1}</span>
        </div>

        {answers.p1 ? (
          <div style={{ color: '#00ff00', fontSize: '1.2rem', textShadow: '0 0 5px #00ff00' }}>✅ Solved</div>
        ) : (
          <button className="cyber-btn" onClick={handleSubmit1}>EXECUTE</button>
        )}
        {p1_error && !answers.p1 && <p style={{ color: '#ff003c', textShadow: '0 0 5px #ff003c', marginTop: '10px' }}>{p1_error}</p>}
      </div>

      {/* PUZZLE 2 */}
      <div style={{ 
        padding: '20px', border: '1px solid #00ffe0', borderRadius: '8px', 
        backgroundColor: '#0a0a0a', boxShadow: '0 0 10px rgba(0,255,224,0.1)', width: '100%', maxWidth: '650px' 
      }}>
        <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Puzzle 2: Match the target value <strong>{target2}</strong></p>
        
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', flexWrap: 'wrap' }}>
          <span>20</span>
          <select className="cyber-select" value={p2_op1} onChange={(e) => setP2Op1(e.target.value)} disabled={answers.p2}>
            {operators.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <span>5</span>
          <select className="cyber-select" value={p2_op2} onChange={(e) => setP2Op2(e.target.value)} disabled={answers.p2}>
            {operators.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <span>3</span>
          <select className="cyber-select" value={p2_op3} onChange={(e) => setP2Op3(e.target.value)} disabled={answers.p2}>
            {operators.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <span>2</span>
          <span>= {target2}</span>
        </div>

        {answers.p2 ? (
          <div style={{ color: '#00ff00', fontSize: '1.2rem', textShadow: '0 0 5px #00ff00' }}>✅ Solved</div>
        ) : (
          <button className="cyber-btn" onClick={handleSubmit2}>EXECUTE</button>
        )}
        {p2_error && !answers.p2 && <p style={{ color: '#ff003c', textShadow: '0 0 5px #ff003c', marginTop: '10px' }}>{p2_error}</p>}
      </div>
    </div>
  );
}
