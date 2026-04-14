import React, { useState, useEffect } from 'react';
import img1 from '../../../../img1.jpeg';
import img2 from '../../../../img2.jpeg';
import img3 from '../../../../img3.jpeg';
import img4 from '../../../../img4.jpeg';
import img5 from '../../../../img5.jpeg';
import img6 from '../../../../img6.jpeg';

const images = [img1, img2, img3, img4, img5, img6];

export default function Zoom({ onComplete, onBack }) {
  const [imageIndex, setImageIndex] = useState(0);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(null);

  useEffect(() => {
    let interval = null;
    if (timer !== null && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setTimer(null);
      setError('');
      if (imageIndex < images.length - 1) {
        setImageIndex(prev => prev + 1);
      }
    }
    return () => clearInterval(interval);
  }, [timer, imageIndex]);

  const handleSubmit = () => {
    if (timer !== null) return;

    const ans = input.toLowerCase().trim();
    if (ans === "pen drive" || ans === "usb drive" || ans === "usb" || ans === "pendrive") {
      onComplete("ZOOM");
    } else {
      setError("INCORRECT IDENTIFICATION");
      setTimer(7);
      setInput('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '20px' }}>
      <div style={{ alignSelf: 'flex-start', marginBottom: '20px', width: '100%', paddingLeft: '20px' }}>
        <button className="cyber-btn" onClick={onBack}>⬅ BACK TO GRID</button>
      </div>

      <h2 style={{ textShadow: '0 0 10px #00ffe0', fontSize: '2.5rem', marginBottom: '10px' }}>IMAGE ENHANCEMENT</h2>
      <div style={{ backgroundColor: 'rgba(0,0,0,0.6)', border: '1px solid #00ffe0', padding: '15px', borderRadius: '8px', marginBottom: '20px', maxWidth: '800px', width: '100%' }}>
        <h3 style={{ color: '#00ffe0', margin: '0 0 10px 0', textShadow: '0 0 5px #00ffe0' }}>PROTOCOLS:</h3>
        <ul style={{ color: '#fff', margin: 0, paddingLeft: '20px', fontSize: '1.1rem', lineHeight: '1.4' }}>
          <li>Examine the obscure image carefully.</li>
          <li>Log the correct object identification to bypass the firewall.</li>
          <li>If incorrect, the system will lock for 7 seconds to prevent brute force, and then auto-enhance the resolution.</li>
        </ul>
      </div>

      <div style={{
        width: '100%',
        maxWidth: '800px',
        backgroundColor: '#000',
        border: '1px solid #00ffe0',
        boxShadow: '0 0 15px #00ffe0 inset',
        marginBottom: '30px',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        position: 'relative'
      }}>
        {timer !== null && (
          <div style={{
            position: 'absolute',
            top: 20,
            right: 20,
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: '10px',
            border: '1px solid #ff003c',
            color: '#ff003c',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            textShadow: '0 0 10px #ff003c',
            zIndex: 10
          }}>
            LOCKED: {timer}s
          </div>
        )}

        <div style={{ marginBottom: '15px', color: '#00ffe0', fontFamily: 'monospace', fontSize: '1.2rem' }}>
          RESOLUTION LEVEL: {imageIndex + 1} / {images.length}
        </div>

        <div style={{ width: '100%', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={images[imageIndex]}
            alt={`Zoom Level ${imageIndex + 1}`}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', maxWidth: '600px', width: '100%' }}>
        <input
          className="cyber-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ENTER IDENTIFICATION"
          disabled={timer !== null}
          style={{ flex: 1 }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
          }}
        />
        <button className="cyber-btn" onClick={handleSubmit} disabled={timer !== null}>SUBMIT LOG</button>
      </div>
      {error && <p style={{ color: '#ff003c', textShadow: '0 0 10px #ff003c', marginTop: '20px', fontSize: '1.2rem' }}>{error}</p>}
    </div>
  );
}
