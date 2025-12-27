import React, { useState, useEffect, useRef } from 'react';
import './Timer.scss';
import startSound from './audio/start-sound_1.mp3';
import endSound from './audio/end-sound_1.mp3';

function Timer() {
  // ... (keep existing state variables)

  // Audio contexts
  const startAudioContextRef = useRef(null);
  const endAudioContextRef = useRef(null);

  // Audio buffer refs
  const startAudioBufferRef = useRef(null);
  const endAudioBufferRef = useRef(null);

  // Initialize audio
  useEffect(() => {
    // Function to load audio file
    const loadAudioFile = async (url) => {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      return arrayBuffer;
    };

    // Function to setup audio context and buffer
    const setupAudio = async (url, contextRef, bufferRef) => {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        contextRef.current = new AudioContext();
        const arrayBuffer = await loadAudioFile(url);
        bufferRef.current = await contextRef.current.decodeAudioData(arrayBuffer);
        console.log(`Audio loaded successfully: ${url}`);
      } catch (error) {
        console.error(`Error setting up audio: ${url}`, error);
      }
    };

    // Setup both audio files
    setupAudio(startSound, startAudioContextRef, startAudioBufferRef);
    setupAudio(endSound, endAudioContextRef, endAudioBufferRef);

    // Cleanup function
    return () => {
      if (startAudioContextRef.current) startAudioContextRef.current.close();
      if (endAudioContextRef.current) endAudioContextRef.current.close();
    };
  }, []);

  // Function to play audio
  const playAudio = (contextRef, bufferRef) => {
    if (contextRef.current && bufferRef.current) {
      const source = contextRef.current.createBufferSource();
      source.buffer = bufferRef.current;
      source.connect(contextRef.current.destination);
      source.start(0);
    } else {
      console.warn('Audio context or buffer not ready');
    }
  };

  // Play sounds on phase change
  useEffect(() => {
    if (isRunning) {
      if (
        (previousPhaseRef.current === 'break' || previousPhaseRef.current === null) &&
        currentPhase === 'work'
      ) {
        // Transitioned to 'work' phase, play start-sound
        playAudio(startAudioContextRef, startAudioBufferRef);
      } else if (previousPhaseRef.current === 'work' && currentPhase === 'break') {
        // Transitioned from 'work' to 'break', play end-sound
        playAudio(endAudioContextRef, endAudioBufferRef);
      }
    }
    previousPhaseRef.current = currentPhase;
  }, [currentPhase, isRunning]);

  // ... (keep the rest of the component code)
}

export default Timer;