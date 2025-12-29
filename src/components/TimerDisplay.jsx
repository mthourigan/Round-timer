import React from 'react';

function TimerDisplay({
  displayMinutes,
  displaySeconds,
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
    </div>
  );
}

export default TimerDisplay;
