import React from 'react';

function TimerDisplay({
  displayMinutes,
  displaySeconds,
  startLabel,
  hasStarted,
  isRunning,
  progress = 0,
  onToggleStartPause,
  onReset,
}) {
  const clamped = Math.min(1, Math.max(0, progress));
  const demoAngle = clamped * 360;

  return (
    <div className="center">
      <div className="display">
        <span className="time-main">
          {String(displayMinutes).padStart(2, '0')}
        </span>
        <span className="colon">:</span>
        <span className="time-main">
          {String(displaySeconds).padStart(2, '0')}
        </span>
      </div>

      <div className="actions">
        <div className="start-wrap">
          <div className="start-ring" style={{ '--progress-angle': `${demoAngle}deg` }} />
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
    </div>
  );
}

export default TimerDisplay;
