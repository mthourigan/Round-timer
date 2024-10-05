import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [timeLeft, setTimeLeft] = useState(60000); // Default to 1 minute for a round
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [roundCount, setRoundCount] = useState(0);
  const [maxRounds, setMaxRounds] = useState(''); // Store max rounds as string to allow empty (infinite)
  const [startTime, setStartTime] = useState(null);
  const [pausedTime, setPausedTime] = useState(0);
  const [duration, setDuration] = useState(60); // Default round duration in seconds
  const [breakTime, setBreakTime] = useState(5); // Default break duration in seconds

  useEffect(() => {
    let interval = null;

    if (isActive && (maxRounds === '' || roundCount < parseInt(maxRounds))) {
      interval = setInterval(() => {
        const elapsedTime = Date.now() - startTime + pausedTime;
        const currentDuration = isBreak ? breakTime * 1000 : duration * 1000; // Convert seconds to milliseconds
        const newTimeLeft = currentDuration - elapsedTime;
        if (newTimeLeft <= 0) {
          clearInterval(interval);
          if (isBreak) {
            // End of break, start a new round
            setRoundCount(prevCount => prevCount + 1);
            setIsBreak(false);
            setTimeLeft(duration * 1000);
          } else {
            // End of round, start break
            setIsBreak(true);
            setTimeLeft(breakTime * 1000);
          }
          setStartTime(Date.now());
          setPausedTime(0);
        } else {
          setTimeLeft(newTimeLeft);
        }
      }, 10);
    } else {
      clearInterval(interval);
      if (!isBreak && roundCount === parseInt(maxRounds)) {
        setIsActive(false); // Stop the timer if max rounds are reached
      }
    }

    return () => clearInterval(interval);
  }, [isActive, startTime, isBreak, roundCount, pausedTime, duration, breakTime, maxRounds]);

  function toggleTimer() {
    if (!isActive && roundCount === 0) {
      setRoundCount(1); // Start with the first round
      setStartTime(Date.now());
    }
    setIsActive(!isActive);
  }

  function resetTimer() {
    setIsActive(false);
    setTimeLeft(duration * 1000);
    setIsBreak(false);
    setRoundCount(0);
    setPausedTime(0);
    setStartTime(null);
  }

  function handleDurationChange(event) {
    const newDuration = Math.abs(parseInt(event.target.value) || 0);
    setDuration(newDuration);
    if (!isActive) {
      setTimeLeft(newDuration * 1000); // Update time left only if the timer is not active
    }
  }

  function handleBreakDurationChange(event) {
    const newBreakTime = Math.abs(parseInt(event.target.value) || 0);
    setBreakTime(newBreakTime);
  }

  function handleMaxRoundsChange(event) {
    setMaxRounds(event.target.value);
  }

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const milliseconds = Math.floor((timeLeft % 1000) / 10);

  return (
    <div className="App">
      <header className="App-header">
        <div className="controls-top">
          Round Duration (seconds):
          <input type="number" onChange={handleDurationChange} value={duration} />
          Break Duration (seconds):
          <input type="number" onChange={handleBreakDurationChange} value={breakTime} />
          Set Rounds (leave blank for infinite):
          <input type="number" onChange={handleMaxRoundsChange} value={maxRounds} placeholder="Infinite" />
        </div>
        <div className="round-info">
          {isBreak ? 'Break' : `Round ${roundCount}${maxRounds ? ` of ${maxRounds}` : ''}`}
        </div>
        <div className="timer">
          <div className="minutes">{minutes < 10 ? `0${minutes}` : minutes}</div>:
          <div className="seconds">{seconds < 10 ? `0${seconds}` : seconds}</div>:
          <div className="milliseconds">{milliseconds < 10 ? `0${milliseconds}` : milliseconds}</div>
        </div>
        <div className="controls-bottom">
          <button onClick={toggleTimer}>
            {isActive ? 'Pause' : 'Start'}
          </button>
          <button onClick={resetTimer}>Reset</button>
        </div>
      </header>
    </div>
  );
}

export default App;
