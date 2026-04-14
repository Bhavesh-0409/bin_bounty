import React from 'react';

export default function BingoGrid({ grid, onTileClick }) {
  const getIcon = (type) => {
    if (type === "ARITH") return "🧮";
    if (type === "PINPOINT") return "📍";
    if (type === "ZOOM") return "🔍";
    if (type === "ZIP") return "⚡";
    return "";
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '15px',
      maxWidth: '500px',
      width: '100%',
      margin: '0 auto',
      padding: '20px'
    }}>
      {grid.map((cell) => {
        const isComp = cell.status === "completed";
        return (
          <div 
            key={cell.id} 
            className="cyber-tile"
            onClick={() => onTileClick(cell.type)}
            style={{
              aspectRatio: '1/1',
              backgroundColor: '#111',
              border: `2px solid ${isComp ? '#00ff00' : '#00ffe0'}`,
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isComp ? 'default' : 'pointer',
              color: isComp ? '#00ff00' : '#00ffe0',
              textShadow: isComp ? '0 0 10px #00ff00' : '0 0 5px #00ffe0',
              fontSize: '24px',
              transition: 'all 0.3s ease',
              boxShadow: isComp ? '0 0 10px #00ff00 inset' : 'none'
            }}
            onMouseEnter={(e) => {
              if (!isComp) {
                e.currentTarget.style.boxShadow = '0 0 15px #00ffe0, 0 0 10px #00ffe0 inset';
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isComp) {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            <div style={{ fontSize: '32px' }}>{isComp ? "✅" : "?"}</div>
          </div>
        );
      })}
    </div>
  );
}
