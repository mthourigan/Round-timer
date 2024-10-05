import React, { useState, useEffect, useRef } from 'react';
import './Timer.css';

function Timer() {
  const [workDuration, setWorkDuration] = useState({ minutes: 5, seconds: 0 });
  const [breakDuration, setBreakDuration] = useState({ minutes: 0, seconds: 10 });
  const [isInfinite, setIsInfinite] = useState(false);
  const [roundCount, setRoundCount] = useState(10);
  const [currentRound, setCurrentRound] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [timeLeft, setTimeLeft] = useState(workDuration.minutes * 60000 + workDuration.seconds * 1000);
  const [isReset, setIsReset] = useState(true);

  const startTimeRef = useRef(0);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now();
      tick();
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning]);

  const tick = () => {
    const now = performance.now();
    const elapsed = now - startTimeRef.current;
    const newTimeLeft = Math.max(0, timeLeft - elapsed);

    if (newTimeLeft === 0) {
      handlePeriodEnd();
    } else {
      setTimeLeft(newTimeLeft);
      startTimeRef.current = now;
      animationFrameRef.current = requestAnimationFrame(tick);
    }
  };

  const handlePeriodEnd = () => {
    if (isBreak) {
      setIsBreak(false);
      setCurrentRound((prev) => prev + 1);
      if (currentRound + 1 >= roundCount && !isInfinite) {
        setIsRunning(false);
        setIsReset(true);
      } else {
        setTimeLeft(workDuration.minutes * 60000 + workDuration.seconds * 1000);
      }
    } else {
      setIsBreak(true);
      setTimeLeft(breakDuration.minutes * 60000 + breakDuration.seconds * 1000);
    }
    startTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(tick);
  };

  const startPauseTimer = () => {
    if (isReset) {
      setCurrentRound(0);
      setIsBreak(false);
      setTimeLeft(workDuration.minutes * 60000 + workDuration.seconds * 1000);
    }
    setIsRunning(!isRunning);
    setIsReset(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setCurrentRound(0);
    setTimeLeft(workDuration.minutes * 60000 + workDuration.seconds * 1000);
    setIsReset(true);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = Math.floor((time % 1000) / 10);
    return {
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
      milliseconds: milliseconds.toString().padStart(2, '0')
    };
  };

  const adjustWorkDuration = (field, amount) => {
    if (isReset) {
      setWorkDuration((prev) => {
        const newDuration = { ...prev, [field]: Math.max(0, prev[field] + amount) };
        setTimeLeft(newDuration.minutes * 60000 + newDuration.seconds * 1000);
        return newDuration;
      });
    }
  };

  const { minutes, seconds, milliseconds } = formatTime(timeLeft);

  return (
    <div className='timer-body'>
      <div className='controls-top'>
        <div className='duration-input'>
          <label htmlFor="workduration">Work duration</label>
          <input
            className='work-minutes'
            type='number'
            value={workDuration.minutes}
            onChange={(e) => setWorkDuration({ ...workDuration, minutes: Math.max(0, parseInt(e.target.value) || 0) })}
            disabled={!isReset}
          />
          <input
            className='work-seconds'
            type='number'
            value={workDuration.seconds}
            onChange={(e) => setWorkDuration({ ...workDuration, seconds: Math.max(0, Math.min(59, parseInt(e.target.value) || 0)) })}
            disabled={!isReset}
          />
        </div>
        <div className='duration-input'>
          <label htmlFor="breakduration">Break duration</label>
          <input
            className='break-minutes'
            type='number'
            value={breakDuration.minutes}
            onChange={(e) => setBreakDuration({ ...breakDuration, minutes: Math.max(0, parseInt(e.target.value) || 0) })}
            disabled={!isReset}
          />
          <input
            className='break-seconds'
            type='number'
            value={breakDuration.seconds}
            onChange={(e) => setBreakDuration({ ...breakDuration, seconds: Math.max(0, Math.min(59, parseInt(e.target.value) || 0)) })}
            disabled={!isReset}
          />
        </div>
        <div className='iterations'>
          <span>infinite?</span>
          <input
            type="checkbox"
            checked={isInfinite}
            onChange={() => setIsInfinite(!isInfinite)}
            disabled={!isReset}
          />
          <input
            className='round-count'
            type="number"
            value={roundCount}
            onChange={(e) => setRoundCount(Math.max(1, parseInt(e.target.value) || 1))}
            disabled={isInfinite || !isReset}
          />
        </div>
      </div>

      <div className='clock'>
        <div className='minutes'>
          {isReset && <button onClick={() => adjustWorkDuration('minutes', 1)}>up</button>}
          <h1 className='minute-count'>{minutes}</h1>
          {isReset && <button onClick={() => adjustWorkDuration('minutes', -1)}>down</button>}
        </div>
        <div className='seconds'>
          {isReset && <button onClick={() => adjustWorkDuration('seconds', 1)}>up</button>}
          <h1 className='second-count'>{seconds}</h1>
          {isReset && <button onClick={() => adjustWorkDuration('seconds', -1)}>down</button>}
        </div>
        <div className='milliseconds'>
          <p className='millisecond-count'>{milliseconds}</p>
        </div>
      </div>

      <div className='controls-bottom'>
        <div>
          <button onClick={startPauseTimer}>{isRunning ? 'Pause' : 'Start'}</button>
          {!isRunning && <button onClick={resetTimer}>Reset</button>}
        </div>
      </div>

      <div className='status'>
        <p>Current period: {isBreak ? 'Break' : 'Work'}</p>
        <p>Round: {currentRound + 1} / {isInfinite ? '∞' : roundCount}</p>
      </div>
    </div>
  );
}

export default Timer;