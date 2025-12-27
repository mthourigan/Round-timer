import React, { useState } from 'react';
import './Timer-codex.scss';
import { useCountdownTimer } from './useCountdownTimer';

function TimerCodex() {
  const [workMinutes, setWorkMinutes] = useState(5);
  const [workSeconds, setWorkSeconds] = useState(0);
  const [breakMinutes, setBreakMinutes] = useState(0);
  const [breakSeconds, setBreakSeconds] = useState(10);
  const [infiniteIteration, setInfiniteIteration] = useState(false);
  const [roundCount, setRoundCount] = useState(10);

  const {
    displayMinutes,
    displaySeconds,
    isRunning,
    hasStarted,
    currentPhase,
    roundsCompleted,
    workProgress,
    toggleStartPause,
    resetTimer,
  } = useCountdownTimer({
    workMinutes,
    workSeconds,
    breakMinutes,
    breakSeconds,
    infiniteIteration,
    roundCount,
  });

  // Input helpers
  function handleMinutesChange(setter) {
    return (event) => {
      const value = Math.max(0, parseInt(event.target.value, 10) || 0);
      setter(value);
    };
  }

  function handleSecondsChange(setter, companionSetter) {
    return (event) => {
      const raw = Math.max(0, parseInt(event.target.value, 10) || 0);
      const minutesOverflow = Math.floor(raw / 60);
      const seconds = raw % 60;
      if (!hasStarted && companionSetter) {
        companionSetter((prev) => prev + minutesOverflow);
      }
      setter(seconds);
    };
  }

  function handleRoundCountChange(event) {
    const value = Math.max(1, parseInt(event.target.value, 10) || 1);
    setRoundCount(value);
  }

  const displayInputValue = (value, showEmptyForZero = true) => {
    if (showEmptyForZero && value === 0 && !hasStarted) {
      return '';
    }
    return value;
  };

  const displayRoundTotal = infiniteIteration ? '∞' : Math.max(roundCount, 1);
  const displayRoundCurrent = infiniteIteration
    ? roundsCompleted + 1
    : Math.min(roundsCompleted + 1, Math.max(roundCount, 1));
  const startLabel = isRunning ? 'Pause' : hasStarted ? 'Resume' : 'Start';
  const backgroundClass = !hasStarted ? 'default' : currentPhase === 'work' ? 'work' : 'break';
  const nextRoundNumber = infiniteIteration
    ? roundsCompleted + 1
    : Math.min(roundsCompleted + 1, Math.max(roundCount, 1));
  const showControls = !hasStarted;

  return (
    <>
      <div className={`codex-shell ${backgroundClass}`}>
        <div className="top">
          {currentPhase === 'break' ? (
            <span className="round-indicator">
              Rest&ensp;•&ensp;Round {nextRoundNumber} coming up...
            </span>
          ) : (
            <span className="round-indicator">
              Round {displayRoundCurrent} of {displayRoundTotal}
            </span>
          )}
        </div>

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
            <button className="start-button" type="button" onClick={toggleStartPause}>
              {startLabel}
            </button>
            {hasStarted && !isRunning && (
              <button className="start-button" type="button" onClick={resetTimer}>
                Reset
              </button>
            )}
          </div>
        </div>

        {showControls && (
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
                      onChange={handleMinutesChange(setWorkMinutes)}
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
                      onChange={handleSecondsChange(setWorkSeconds, setWorkMinutes)}
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
                      onChange={handleMinutesChange(setBreakMinutes)}
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
                      onChange={handleSecondsChange(setBreakSeconds, setBreakMinutes)}
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
                  onChange={handleRoundCountChange}
                  disabled={infiniteIteration || hasStarted}
                />
              </div>

              <label className="infinite">
                <span className="label text-secondary">Infinite</span>
                <span className="toggle">
                  <input
                    type="checkbox"
                    checked={infiniteIteration}
                    onChange={(event) => setInfiniteIteration(event.target.checked)}
                    disabled={hasStarted}
                    aria-label="Toggle infinite rounds"
                  />
                  <span className="toggle-track" aria-hidden="true" />
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {hasStarted && currentPhase === 'work' && (
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${Math.min(100, Math.max(0, workProgress * 100))}%` }}
          />
        </div>
      )}
    </>
  );
}

export default TimerCodex;
