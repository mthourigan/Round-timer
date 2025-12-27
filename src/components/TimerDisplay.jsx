import React from 'react';

function TimerDisplay({
  displayMinutes,
  displaySeconds,
  startLabel,
  hasStarted,
  isRunning,
  onToggleStartPause,
  onReset,
}) {
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
        <button className="start-button" type="button" onClick={onToggleStartPause}>
          {startLabel}
        </button>
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
