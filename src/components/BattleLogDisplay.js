import React, { useRef, useEffect } from 'react';

function BattleLogDisplay({ log }) {
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  return (
    <div className="battle-log-container">
      {log.map((msg, idx) => (
        <div key={idx}>{msg}</div>
      ))}
      <div ref={logEndRef} />
    </div>
  );
}

export default BattleLogDisplay;