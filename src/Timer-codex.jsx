import React, { useEffect, useRef, useState } from 'react';
import { Howl } from 'howler';
import './Timer-codex.css';
import startSoundMp3 from './audio/start-sound_1.mp3';
import startSoundOgg from './audio/start-sound_1.ogg';
import endSoundMp3 from './audio/end-sound_1.mp3';
import endSoundOgg from './audio/end-sound_1.ogg';

function TimerCodex() {
  const [workMinutes, setWorkMinutes] = useState(5);
  const [workSeconds, setWorkSeconds] = useState(0);
  const [breakMinutes, setBreakMinutes] = useState(0);
  const [breakSeconds, setBreakSeconds] = useState(0);
  const [infiniteIteration, setInfiniteIteration] = useState(false);
  const [roundCount, setRoundCount] = useState(10);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('work');
  const [roundsCompleted, setRoundsCompleted] = useState(0);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const elapsedTimeRef = useRef(0);
  const totalDurationRef = useRef(getTotalDuration('work'));
  const currentPhaseRef = useRef('work');
  const roundsCompletedRef = useRef(0);
  const previousPhaseRef = useRef(null);
  const startSoundRef = useRef(null);
  const endSoundRef = useRef(null);

  const [displayMinutes, setDisplayMinutes] = useState(workMinutes);
  const [displaySeconds, setDisplaySeconds] = useState(workSeconds);
  const [displayMilliseconds, setDisplayMilliseconds] = useState(0);

  function getTotalDuration(phase) {
    const minutes = phase === 'work' ? workMinutes : breakMinutes;
    const seconds = phase === 'work' ? workSeconds : breakSeconds;
    return (minutes * 60 + seconds) * 1000;
  }

  // Update total duration and visible time when inputs change and timer is idle.
  useEffect(() => {
    if (!isRunning && elapsedTimeRef.current === 0) {
      totalDurationRef.current = getTotalDuration(currentPhase);
      if (currentPhase === 'work') {
        setDisplayMinutes(workMinutes);
        setDisplaySeconds(workSeconds);
      } else {
        setDisplayMinutes(breakMinutes);
        setDisplaySeconds(breakSeconds);
      }
      setDisplayMilliseconds(0);
    }
  }, [workMinutes, workSeconds, breakMinutes, breakSeconds, currentPhase, isRunning]);

  // Start / pause animation loop.
  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now() - elapsedTimeRef.current;
      timerRef.current = requestAnimationFrame(updateTimer);
    } else if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
      }
    };
  }, [isRunning]);

  function updateTimer(timestamp) {
    elapsedTimeRef.current = timestamp - startTimeRef.current;
    const timeLeft = totalDurationRef.current - elapsedTimeRef.current;

    if (timeLeft <= 0) {
      handlePhaseCompletion();
    } else {
      setDisplayTime(timeLeft);
      timerRef.current = requestAnimationFrame(updateTimer);
    }
  }

  function setDisplayTime(timeLeft) {
    const totalSeconds = Math.floor(timeLeft / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((timeLeft % 1000) / 10);

    setDisplayMinutes(minutes);
    setDisplaySeconds(seconds);
    setDisplayMilliseconds(milliseconds);
  }

  function handlePhaseCompletion() {
    if (currentPhaseRef.current === 'work') {
      incrementRoundsCompleted();

      if (!infiniteIteration && roundsCompletedRef.current >= roundCount) {
        resetTimer();
        return;
      }

      setAndUpdateCurrentPhase('break');
      totalDurationRef.current = getTotalDuration('break');
    } else {
      setAndUpdateCurrentPhase('work');
      totalDurationRef.current = getTotalDuration('work');
    }

    elapsedTimeRef.current = 0;
    startTimeRef.current = performance.now();
    timerRef.current = requestAnimationFrame(updateTimer);
  }

  function toggleStartPause() {
    if (!hasStarted) {
      setHasStarted(true);
      totalDurationRef.current = getTotalDuration(currentPhaseRef.current);
    }
    if (!isRunning && startSoundRef.current) {
      startSoundRef.current.play();
    }
    setIsRunning((prev) => !prev);
  }

  function resetTimer() {
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
    }

    elapsedTimeRef.current = 0;
    totalDurationRef.current = getTotalDuration('work');
    startTimeRef.current = null;
    setIsRunning(false);
    setHasStarted(false);
    setCurrentPhase('work');
    currentPhaseRef.current = 'work';
    roundsCompletedRef.current = 0;
    setRoundsCompleted(0);
    setDisplayMinutes(workMinutes);
    setDisplaySeconds(workSeconds);
    setDisplayMilliseconds(0);
  }

  function setAndUpdateCurrentPhase(phase) {
    currentPhaseRef.current = phase;
    setCurrentPhase(phase);
  }

  function incrementRoundsCompleted() {
    roundsCompletedRef.current += 1;
    setRoundsCompleted(roundsCompletedRef.current);
  }

  // Initialize Howl instances once.
  useEffect(() => {
    startSoundRef.current = new Howl({
      src: [startSoundMp3, startSoundOgg],
      preload: true,
    });

    endSoundRef.current = new Howl({
      src: [endSoundMp3, endSoundOgg],
      preload: true,
    });
  }, []);

  // Play sounds on phase change.
  useEffect(() => {
    if (isRunning) {
      if (
        (previousPhaseRef.current === 'break' || previousPhaseRef.current === null) &&
        currentPhase === 'work'
      ) {
        if (startSoundRef.current) startSoundRef.current.play();
      } else if (previousPhaseRef.current === 'work' && currentPhase === 'break') {
        if (endSoundRef.current) endSoundRef.current.play();
      }
    }
    previousPhaseRef.current = currentPhase;
  }, [currentPhase, isRunning]);

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

  const displayRoundTotal = infiniteIteration
    ? '∞'
    : String(Math.max(roundCount, 1)).padStart(2, '0');
  const displayRoundCurrent = infiniteIteration
    ? roundsCompleted + 1
    : Math.min(roundsCompleted + 1, Math.max(roundCount, 1));
  const startLabel = isRunning ? 'Pause' : hasStarted ? 'Resume' : 'Start';
  const backgroundClass = !hasStarted ? 'default' : currentPhaseRef.current === 'work' ? 'work' : 'break';
  const showControls = !hasStarted;

  return (
    <div className={`codex-shell ${backgroundClass}`}>
      <div className="codex-top">
        <span className="codex-round-indicator">
          {displayRoundCurrent} of {displayRoundTotal}
        </span>
      </div>

      <div className="codex-center">
        <div className="codex-display">
          <span className="codex-time-main">
            {String(displayMinutes).padStart(2, '0')}
          </span>
          <span className="codex-colon">:</span>
          <span className="codex-time-main">
            {String(displaySeconds).padStart(2, '0')}
          </span>
          <span className="codex-dot">.</span>
          <span className="codex-millis">
            {String(displayMilliseconds).padStart(2, '0')}
          </span>
        </div>

        <div className="codex-actions">
          <button className="codex-start-button" type="button" onClick={toggleStartPause}>
            {startLabel}
          </button>
          {hasStarted && !isRunning && (
            <button className="codex-start-button" type="button" onClick={resetTimer}>
              Reset
            </button>
          )}
        </div>
      </div>

      {showControls && (
        <div className="codex-bottom">
          <div className="codex-input-group">
            <span className="codex-group-label">Work</span>
            <div className="codex-input-row">
              <div className="codex-input-stack">
                <label htmlFor="codex-work-min">Min</label>
                <input
                  id="codex-work-min"
                  type="number"
                  value={workMinutes}
                  onChange={handleMinutesChange(setWorkMinutes)}
                  disabled={hasStarted}
                />
              </div>
              <div className="codex-input-stack">
                <label htmlFor="codex-work-sec">Sec</label>
                <input
                  id="codex-work-sec"
                  type="number"
                  value={workSeconds}
                  onChange={handleSecondsChange(setWorkSeconds, setWorkMinutes)}
                  disabled={hasStarted}
                />
              </div>
            </div>
          </div>

          <div className="codex-input-group">
            <span className="codex-group-label">Rest</span>
            <div className="codex-input-row">
              <div className="codex-input-stack">
                <label htmlFor="codex-rest-min">Min</label>
                <input
                  id="codex-rest-min"
                  type="number"
                  value={breakMinutes}
                  onChange={handleMinutesChange(setBreakMinutes)}
                  disabled={hasStarted}
                />
              </div>
              <div className="codex-input-stack">
                <label htmlFor="codex-rest-sec">Sec</label>
                <input
                  id="codex-rest-sec"
                  type="number"
                  value={breakSeconds}
                  onChange={handleSecondsChange(setBreakSeconds, setBreakMinutes)}
                  disabled={hasStarted}
                />
              </div>
            </div>
          </div>

          <div className="codex-meta">
            <label className="codex-infinite">
              <span>Infinite</span>
              <input
                type="checkbox"
                checked={infiniteIteration}
                onChange={(event) => setInfiniteIteration(event.target.checked)}
                disabled={hasStarted}
              />
            </label>
            <div className="codex-rounds">
              <span>Rounds</span>
              <input
                type="number"
                value={roundCount}
                onChange={handleRoundCountChange}
                disabled={infiniteIteration || hasStarted}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TimerCodex;
