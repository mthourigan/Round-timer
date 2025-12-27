import React from 'react';

function TimerControls({
  hasStarted,
  workMinutes,
  workSeconds,
  breakMinutes,
  breakSeconds,
  roundCount,
  infiniteIteration,
  onWorkMinutesChange,
  onWorkSecondsChange,
  onBreakMinutesChange,
  onBreakSecondsChange,
  onRoundCountChange,
  onToggleInfinite,
  displayInputValue,
}) {
  return (
    <div className="bottom">
      <div className="controls-time">
        <div className="input-group">
          <span className="group-label">Work</span>
          <div className="input-row">
            <div className="input-stack">
              <label htmlFor="codex-work-min">Min</label>
              <input
                id="codex-work-min"
                type="number"
                value={displayInputValue(workMinutes)}
                onChange={onWorkMinutesChange}
                disabled={hasStarted}
                placeholder="0"
              />
            </div>
            <div className="input-stack">
              <label htmlFor="codex-work-sec">Sec</label>
              <input
                id="codex-work-sec"
                type="number"
                value={displayInputValue(workSeconds)}
                onChange={onWorkSecondsChange}
                disabled={hasStarted}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="input-group">
          <span className="group-label">Rest</span>
          <div className="input-row">
            <div className="input-stack">
              <label htmlFor="codex-rest-min">Min</label>
              <input
                id="codex-rest-min"
                type="number"
                value={displayInputValue(breakMinutes)}
                onChange={onBreakMinutesChange}
                disabled={hasStarted}
                placeholder="0"
              />
            </div>
            <div className="input-stack">
              <label htmlFor="codex-rest-sec">Sec</label>
              <input
                id="codex-rest-sec"
                type="number"
                value={displayInputValue(breakSeconds)}
                onChange={onBreakSecondsChange}
                disabled={hasStarted}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="meta">
        <div className={`rounds ${infiniteIteration ? 'hidden' : ''}`}>
          <span className="text-secondary">Rounds</span>
          <input
            type="number"
            value={roundCount}
            onChange={onRoundCountChange}
            disabled={infiniteIteration || hasStarted}
          />
        </div>

        <label className="infinite">
          <span className="label text-secondary">Infinite</span>
          <span className="toggle">
            <input
              type="checkbox"
              checked={infiniteIteration}
              onChange={onToggleInfinite}
              disabled={hasStarted}
              aria-label="Toggle infinite rounds"
            />
            <span className="toggle-track" aria-hidden="true" />
          </span>
        </label>
      </div>
    </div>
  );
}

export default TimerControls;
