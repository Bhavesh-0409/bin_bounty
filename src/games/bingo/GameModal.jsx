import React from 'react';
import Arithmetic from './games/Arithmetic';
import Pinpoint from './games/cross';
import Zoom from './games/Zoom';
import Zip from './games/Zip';

export default function GameModal({ activeGame, onComplete, onClose }) {
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(2px)'
  };

  const modalStyle = {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '12px',
    minWidth: '350px',
    position: 'relative',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
  };

  const closeBtnStyle = {
    position: 'absolute',
    top: '15px',
    right: '15px',
    cursor: 'pointer',
    background: '#eee',
    border: 'none',
    fontSize: '16px',
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold'
  };

  const renderGame = () => {
    switch (activeGame) {
      case "ARITH":
        return <Arithmetic onComplete={() => onComplete("ARITH")} />;
      case "PINPOINT":
        return <Pinpoint onComplete={() => onComplete("PINPOINT")} />;
      case "ZOOM":
        return <Zoom onComplete={() => onComplete("ZOOM")} />;
      case "ZIP":
        return <Zip onComplete={() => onComplete("ZIP")} />;
      default:
        return <div>Unknown game type: {activeGame}</div>;
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button style={closeBtnStyle} onClick={onClose} aria-label="Close modal">X</button>
        {renderGame()}
      </div>
    </div>
  );
}
