import React, { useState, useEffect, useRef } from 'react';
import './Timer.css';

import startSound from './audio/start-sound.mp3';
import endSound from './audio/end-sound.mp3';

function Timer() {
  // State variables
  const [workMinutes, setWorkMinutes] = useState(5);
  const [workSeconds, setWorkSeconds] = useState(0);
  const [breakMinutes, setBreakMinutes] = useState(0);
  const [breakSeconds, setBreakSeconds] = useState(10);
  const [infiniteIteration, setInfiniteIteration] = useState(false);
  const [roundCount, setRoundCount] = useState(10);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('work'); // 'work' or 'break'
  const [roundsCompleted, setRoundsCompleted] = useState(0);

  // Ref variables to store mutable values
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const elapsedTimeRef = useRef(0);
  const totalDurationRef = useRef(getTotalDuration('work'));

  const currentPhaseRef = useRef('work');
  const roundsCompletedRef = useRef(0);

  // Audio refs
  const startAudioRef = useRef(null);
  const endAudioRef = useRef(null);

  // Previous phase ref
  const previousPhaseRef = useRef(null);

  // Initialize audio elements
  useEffect(() => {
    startAudioRef.current = new Audio(startSound);
    endAudioRef.current = new Audio(endSound);
  }, []);

  // Play sounds on phase change
  useEffect(() => {
    if (isRunning) {
      if (
        (previousPhaseRef.current === 'break' || previousPhaseRef.current === null) &&
        currentPhase === 'work'
      ) {
        // Transitioned to 'work' phase, play start-sound
        if (startAudioRef.current) {
          startAudioRef.current.play();
        }
      } else if (previousPhaseRef.current === 'work' && currentPhase === 'break') {
        // Transitioned from 'work' to 'break', play end-sound
        if (endAudioRef.current) {
          endAudioRef.current.play();
        }
      }
    }
    previousPhaseRef.current = currentPhase;
  }, [currentPhase, isRunning]);

  // Function to get total duration in milliseconds
  function getTotalDuration(phase) {
    const minutes = phase === 'work' ? workMinutes : breakMinutes;
    const seconds = phase === 'work' ? workSeconds : breakSeconds;
    return (minutes * 60 + seconds) * 1000;
  }

  // Update total duration when durations or phase change
  useEffect(() => {
    if (!isRunning) {
      totalDurationRef.current = getTotalDuration(currentPhase);
      elapsedTimeRef.current = 0;
      setDisplayTime(totalDurationRef.current);
    }
  }, [workMinutes, workSeconds, breakMinutes, breakSeconds, currentPhase]);

  // Timer function
  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now() - elapsedTimeRef.current;
      timerRef.current = requestAnimationFrame(updateTimer);
    } else {
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
      }
    };
  }, [isRunning]);

  // Update timer
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

  // Handle phase completion
  function handlePhaseCompletion() {
    if (currentPhaseRef.current === 'work') {
      incrementRoundsCompleted();

      if (!infiniteIteration && roundsCompletedRef.current >= roundCount) {
        // Timer ends after the last work phase
        resetTimer();
        return;
      } else {
        setAndUpdateCurrentPhase('break');
        totalDurationRef.current = getTotalDuration('break');
      }
    } else if (currentPhaseRef.current === 'break') {
      // After break, switch to work
      setAndUpdateCurrentPhase('work');
      totalDurationRef.current = getTotalDuration('work');
    }
    elapsedTimeRef.current = 0;
    startTimeRef.current = performance.now();
    timerRef.current = requestAnimationFrame(updateTimer);
  }

  // Set display time
  const [displayMinutes, setDisplayMinutes] = useState(workMinutes);
  const [displaySeconds, setDisplaySeconds] = useState(workSeconds);
  const [displayMilliseconds, setDisplayMilliseconds] = useState(0);

  function setDisplayTime(timeLeft) {
    const totalSeconds = Math.floor(timeLeft / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((timeLeft % 1000) / 10); // Two-digit milliseconds

    setDisplayMinutes(minutes);
    setDisplaySeconds(seconds);
    setDisplayMilliseconds(milliseconds);
  }

  // Update display when durations change and timer is not running
  useEffect(() => {
    if (!isRunning && elapsedTimeRef.current === 0) {
      if (currentPhase === 'work') {
        setDisplayMinutes(workMinutes);
        setDisplaySeconds(workSeconds);
        setDisplayMilliseconds(0);
      } else if (currentPhase === 'break') {
        setDisplayMinutes(breakMinutes);
        setDisplaySeconds(breakSeconds);
        setDisplayMilliseconds(0);
      }
    }
  }, [workMinutes, workSeconds, breakMinutes, breakSeconds, currentPhase]);

  // Start/Pause button handler
  function toggleStartPause() {
    if (!hasStarted) {
      setHasStarted(true);
    }
    setIsRunning(!isRunning);
  }

  // Reset button handler
  function resetTimer() {
    setIsRunning(false);
    setHasStarted(false);
    setCurrentPhase('work');
    currentPhaseRef.current = 'work';
    previousPhaseRef.current = null; // Reset previous phase
    setRoundsCompleted(0);
    roundsCompletedRef.current = 0;
    totalDurationRef.current = getTotalDuration('work');
    elapsedTimeRef.current = 0;
    setDisplayMinutes(workMinutes);
    setDisplaySeconds(workSeconds);
    setDisplayMilliseconds(0);
  }

  // Adjust minutes and seconds (only when timer hasn't started)
  function adjustTime(type, amount) {
    if (hasStarted) return;
    if (type === 'workMinutes') {
      setWorkMinutes((prev) => Math.max(0, prev + amount));
    } else if (type === 'workSeconds') {
      setWorkSeconds((prev) => {
        let newValue = prev + amount;
        if (newValue >= 60) {
          setWorkMinutes((m) => m + 1);
          newValue -= 60;
        } else if (newValue < 0 && workMinutes > 0) {
          setWorkMinutes((m) => m - 1);
          newValue += 60;
        } else {
          newValue = Math.max(0, newValue);
        }
        return newValue;
      });
    } else if (type === 'breakMinutes') {
      setBreakMinutes((prev) => Math.max(0, prev + amount));
    } else if (type === 'breakSeconds') {
      setBreakSeconds((prev) => {
        let newValue = prev + amount;
        if (newValue >= 60) {
          setBreakMinutes((m) => m + 1);
          newValue -= 60;
        } else if (newValue < 0 && breakMinutes > 0) {
          setBreakMinutes((m) => m - 1);
          newValue += 60;
        } else {
          newValue = Math.max(0, newValue);
        }
        return newValue;
      });
    }
  }

  // Handle input changes
  function handleInputChange(e, setter) {
    const value = parseInt(e.target.value, 10);
    setter(isNaN(value) ? 0 : value);
  }

  // Helper functions to update currentPhase and roundsCompleted along with their refs
  function setAndUpdateCurrentPhase(phase) {
    currentPhaseRef.current = phase;
    setCurrentPhase(phase);
  }

  function incrementRoundsCompleted() {
    roundsCompletedRef.current += 1;
    setRoundsCompleted(roundsCompletedRef.current);
  }

  // Determine the background class
  let backgroundClass = '';

  if (!hasStarted) {
    backgroundClass = 'default';
  } else if (currentPhaseRef.current === 'work') {
    backgroundClass = 'work';
  } else if (currentPhaseRef.current === 'break') {
    backgroundClass = 'break';
  }

  return (
    <div className={`timer-body ${backgroundClass}`}>
      <div className='controls-top'>
        <div className='current-round'>
          <p className='time-type'>
            {infiniteIteration
              ? roundsCompletedRef.current + 1
              : Math.min(roundsCompletedRef.current + 1, roundCount)}
            {' of '}
            {infiniteIteration ? '∞' : roundCount}
          </p>
        </div>
        <div className='col-inputs'>
          <div className='duration-input'>
            <div className='time-type'>
              <p>Work</p>
            </div>
            <div className='field-container'>
              <label className='field-label' htmlFor='workMinutes'>
                Minutes
              </label>
              <input
                id='workMinutes'
                className='time-inputs'
                type='number'
                placeholder='00'
                value={workMinutes}
                onChange={(e) => handleInputChange(e, setWorkMinutes)}
                disabled={hasStarted}
              />
            </div>
            <div className='field-container'>
              <label className='field-label' htmlFor='workSeconds'>
                Seconds
              </label>
              <input
                id='workSeconds'
                className='time-inputs'
                type='number'
                placeholder='00'
                value={workSeconds}
                onChange={(e) => handleInputChange(e, setWorkSeconds)}
                disabled={hasStarted}
              />
            </div>
          </div>
          <div className='duration-input'>
            <div className='time-type'>
              <p>Rest</p>
            </div>
            <div className='field-container'>
              <label className='field-label' htmlFor='breakMinutes'>
                Minutes
              </label>
              <input
                id='breakMinutes'
                className='time-inputs'
                type='number'
                placeholder='00'
                value={breakMinutes}
                onChange={(e) => handleInputChange(e, setBreakMinutes)}
                disabled={hasStarted}
              />
            </div>
            <div className='field-container'>
              <label className='field-label' htmlFor='breakSeconds'>
                Seconds
              </label>
              <input
                id='breakSeconds'
                className='time-inputs'
                type='number'
                placeholder='00'
                value={breakSeconds}
                onChange={(e) => handleInputChange(e, setBreakSeconds)}
                disabled={hasStarted}
              />
            </div>
          </div>
          <div className='duration-input'>
            <div className='time-type'>
              <span>Infinite</span>
              <input
                type='checkbox'
                checked={infiniteIteration}
                onChange={(e) => setInfiniteIteration(e.target.checked)}
                disabled={hasStarted}
              />
            </div>
            {!infiniteIteration && (
              <div className='field-container'>
                <label className='field-label'>Rounds</label>
                <input
                  className='time-inputs'
                  type='number'
                  placeholder='00'
                  value={roundCount}
                  onChange={(e) => handleInputChange(e, setRoundCount)}
                  disabled={hasStarted}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className='clock'>
        <div className='minutes'>
          {!hasStarted && (
            <button
              className='toggle-duration'
              onClick={() => adjustTime('workMinutes', 1)}
            >
              ▲
            </button>
          )}
          <span className='large-count'>
            {String(displayMinutes).padStart(2, '0')}
          </span>
          {!hasStarted && (
            <button
              className='toggle-duration'
              onClick={() => adjustTime('workMinutes', -1)}
            >
              ▼
            </button>
          )}
        </div>
        <div className='colon'>
          <span className='large-count'>:</span>
        </div>
        <div className='seconds'>
          {!hasStarted && (
            <button
              className='toggle-duration'
              onClick={() => adjustTime('workSeconds', 1)}
            >
              ▲
            </button>
          )}
          <span className='large-count'>
            {String(displaySeconds).padStart(2, '0')}
          </span>
          {!hasStarted && (
            <button
              className='toggle-duration'
              onClick={() => adjustTime('workSeconds', -1)}
            >
              ▼
            </button>
          )}
        </div>
        <div className='milliseconds'>
          <span className='milliseconds-count'>
            {String(displayMilliseconds).padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className='controls-bottom'>
        <div className='col-actions'>
          <button className='play-button' onClick={toggleStartPause}>
            {isRunning ? 'Pause' : 'Start'}
          </button>
          {hasStarted && !isRunning && (
            <button className='play-button' onClick={resetTimer}>
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Timer;
