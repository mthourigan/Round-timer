import { useCallback, useEffect, useRef, useState } from 'react';
import { Howl } from 'howler';
import startSoundMp3 from './audio/start-sound_1.mp3';
import startSoundOgg from './audio/start-sound_1.ogg';
import endSoundMp3 from './audio/end-sound_1.mp3';
import endSoundOgg from './audio/end-sound_1.ogg';

export function useCountdownTimer({
  workMinutes,
  workSeconds,
  breakMinutes,
  breakSeconds,
  infiniteIteration,
  roundCount,
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('work');
  const [roundsCompleted, setRoundsCompleted] = useState(0);
  const [displayMinutes, setDisplayMinutes] = useState(workMinutes);
  const [displaySeconds, setDisplaySeconds] = useState(workSeconds);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const elapsedTimeRef = useRef(0);
  const totalDurationRef = useRef(0);
  const phaseRef = useRef('work'); // work | break | rest-hold
  const roundsCompletedRef = useRef(0);
  const previousPhaseRef = useRef(null);
  const finalHoldRef = useRef(false);
  const suppressEndSoundRef = useRef(false);
  const startSoundRef = useRef(null);
  const endSoundRef = useRef(null);

  const getTotalDuration = useCallback(
    (phase) => {
      const minutes = phase === 'work' ? workMinutes : breakMinutes;
      const seconds = phase === 'work' ? workSeconds : breakSeconds;
      return (minutes * 60 + seconds) * 1000;
    },
    [breakMinutes, breakSeconds, workMinutes, workSeconds]
  );

  const setDisplayTime = useCallback((timeLeft) => {
    const remainingSeconds = timeLeft > 0 ? Math.ceil(timeLeft / 1000) : 0;
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    setDisplayMinutes(minutes);
    setDisplaySeconds(seconds);
  }, []);

  const incrementRoundsCompleted = useCallback(() => {
    roundsCompletedRef.current += 1;
    setRoundsCompleted(roundsCompletedRef.current);
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
    }

    elapsedTimeRef.current = 0;
    totalDurationRef.current = getTotalDuration('work');
    startTimeRef.current = null;
    setIsRunning(false);
    setHasStarted(false);
    phaseRef.current = 'work';
    setCurrentPhase('work');
    roundsCompletedRef.current = 0;
    setRoundsCompleted(0);
    setDisplayMinutes(workMinutes);
    setDisplaySeconds(workSeconds);
    finalHoldRef.current = false;
    suppressEndSoundRef.current = false;
  }, [getTotalDuration, workMinutes, workSeconds]);

  const startPhase = useCallback(
    (phase) => {
      phaseRef.current = phase;
      setCurrentPhase(phase);
      totalDurationRef.current = getTotalDuration(phase);
      elapsedTimeRef.current = 0;
      startTimeRef.current = performance.now();
      setDisplayTime(totalDurationRef.current);
      timerRef.current = requestAnimationFrame(updateTimer);
    },
    [getTotalDuration, setDisplayTime]
  );

  const handlePhaseCompletion = useCallback(() => {
    if (phaseRef.current === 'work') {
      incrementRoundsCompleted();

      const isFinal = !infiniteIteration && roundsCompletedRef.current >= roundCount;
      if (endSoundRef.current) {
        endSoundRef.current.play();
        suppressEndSoundRef.current = true;
      }

      phaseRef.current = 'rest-hold';
      setCurrentPhase('break');
      finalHoldRef.current = isFinal;
      totalDurationRef.current = 300;
      elapsedTimeRef.current = 0;
      startTimeRef.current = performance.now();
      setDisplayMinutes(0);
      setDisplaySeconds(0);
      timerRef.current = requestAnimationFrame(updateTimer);
    } else if (phaseRef.current === 'break') {
      startPhase('work');
    }
  }, [
    incrementRoundsCompleted,
    infiniteIteration,
    roundCount,
    startPhase,
  ]);

  const updateTimer = useCallback(
    (timestamp) => {
      elapsedTimeRef.current = timestamp - startTimeRef.current;
      const timeLeft = totalDurationRef.current - elapsedTimeRef.current;

      if (phaseRef.current === 'rest-hold') {
        if (timeLeft <= 0) {
          if (finalHoldRef.current) {
            resetTimer();
            return;
          }
          phaseRef.current = 'break';
          setCurrentPhase('break');
          totalDurationRef.current = getTotalDuration('break');
          elapsedTimeRef.current = 0;
          startTimeRef.current = performance.now();
          setDisplayTime(totalDurationRef.current);
          timerRef.current = requestAnimationFrame(updateTimer);
          return;
        }
        setDisplayMinutes(0);
        setDisplaySeconds(0);
        timerRef.current = requestAnimationFrame(updateTimer);
      } else if (timeLeft <= 0) {
        setDisplayTime(0);
        handlePhaseCompletion();
      } else {
        setDisplayTime(timeLeft);
        timerRef.current = requestAnimationFrame(updateTimer);
      }
    },
    [getTotalDuration, handlePhaseCompletion, resetTimer, setDisplayTime]
  );

  const toggleStartPause = useCallback(() => {
    if (!hasStarted) {
      setHasStarted(true);
      totalDurationRef.current =
        phaseRef.current === 'work' ? getTotalDuration('work') : getTotalDuration('break');
    }
    if (!isRunning && startSoundRef.current && phaseRef.current === 'work') {
      startSoundRef.current.play();
    }
    setIsRunning((prev) => !prev);
  }, [getTotalDuration, hasStarted, isRunning]);

  // Update total duration and visible time when inputs change and timer is idle.
  useEffect(() => {
    if (!isRunning && elapsedTimeRef.current === 0) {
      const activePhase = phaseRef.current === 'rest-hold' ? 'break' : phaseRef.current;
      totalDurationRef.current = getTotalDuration(activePhase);
      const minutes = activePhase === 'work' ? workMinutes : breakMinutes;
      const seconds = activePhase === 'work' ? workSeconds : breakSeconds;
      setDisplayMinutes(minutes);
      setDisplaySeconds(seconds);
    }
  }, [breakMinutes, breakSeconds, getTotalDuration, isRunning, workMinutes, workSeconds]);

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
  }, [isRunning, updateTimer]);

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
        (previousPhaseRef.current === 'break' ||
          previousPhaseRef.current === 'rest-hold' ||
          previousPhaseRef.current === null) &&
        currentPhase === 'work'
      ) {
        if (startSoundRef.current) startSoundRef.current.play();
      } else if (previousPhaseRef.current === 'work' && currentPhase === 'break') {
        if (!suppressEndSoundRef.current && endSoundRef.current) endSoundRef.current.play();
        suppressEndSoundRef.current = false;
      }
    }
    previousPhaseRef.current = currentPhase;
  }, [currentPhase, isRunning]);

  return {
    displayMinutes,
    displaySeconds,
    isRunning,
    hasStarted,
    currentPhase,
    roundsCompleted,
    toggleStartPause,
    resetTimer,
  };
}
