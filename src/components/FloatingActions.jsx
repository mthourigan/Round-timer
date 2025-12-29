import React from 'react';

function FloatingActions({
  ringAngle,
  startLabel,
  hasStarted,
  isRunning,
  onToggleStartPause,
  onReset,
}) {
  return (
    <div className="floating-actions">
      <div className="start-wrap">
        <div className="start-ring" style={{ '--progress-angle': `${ringAngle}deg` }} />
        <button className="start-button" type="button" onClick={onToggleStartPause}>
          {startLabel}
        </button>
      </div>
      {hasStarted && !isRunning && (
        <button className="start-button" type="button" onClick={onReset}>
          Reset
        </button>
      )}
    </div>
  );
}

export default FloatingActions;
