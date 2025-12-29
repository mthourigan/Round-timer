import React, { useState } from 'react';
import './Timer-codex.scss';
import { useCountdownTimer } from './useCountdownTimer';
import TimerControls from './components/TimerControls';
import TimerDisplay from './components/TimerDisplay';

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
    progress,
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
  const ringAngle = Math.min(1, Math.max(0, progress ?? 0)) * 360;

  return (
    <>
      <div className={`codex-shell ${backgroundClass}`}>
        <div className="top">
          <div className="round-indicator-container">
            {currentPhase === 'break' ? (
              <span className="round-indicator">
                Rest now, round {nextRoundNumber} coming up ...
              </span>
            ) : (
              <span className="round-indicator">
                Round {displayRoundCurrent} / {displayRoundTotal}
              </span>
            )}
          </div>
        </div>

        <TimerDisplay displayMinutes={displayMinutes} displaySeconds={displaySeconds} />

        {showControls && (
          <TimerControls
            hasStarted={hasStarted}
            workMinutes={workMinutes}
            workSeconds={workSeconds}
            breakMinutes={breakMinutes}
            breakSeconds={breakSeconds}
            roundCount={roundCount}
            infiniteIteration={infiniteIteration}
            onWorkMinutesChange={handleMinutesChange(setWorkMinutes)}
            onWorkSecondsChange={handleSecondsChange(setWorkSeconds, setWorkMinutes)}
            onBreakMinutesChange={handleMinutesChange(setBreakMinutes)}
            onBreakSecondsChange={handleSecondsChange(setBreakSeconds, setBreakMinutes)}
            onRoundCountChange={handleRoundCountChange}
            onToggleInfinite={(event) => setInfiniteIteration(event.target.checked)}
            displayInputValue={displayInputValue}
          />
        )}

        <div className="floating-actions">
          <div className="start-wrap">
            <div className="start-ring" style={{ '--progress-angle': `${ringAngle}deg` }} />
            <button className="start-button" type="button" onClick={toggleStartPause}>
              {startLabel}
            </button>
          </div>
          {hasStarted && !isRunning && (
            <button className="start-button" type="button" onClick={resetTimer}>
              Reset
            </button>
          )}
        </div>
      </div>

    </>
  );
}

export default TimerCodex;
