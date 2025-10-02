import { useState, useCallback, useEffect, useRef } from 'react';
import { EgyptianAudioEngine } from '../utils/egyptianAudioEngine';
import {
  EGYPTIAN_CODE_CHAPTERS,
  getNextChapter,
  getTotalDuration,
  type EgyptianChapter,
} from '../utils/egyptianCodeFrequencies';

export interface EgyptianCodeState {
  currentChapter: EgyptianChapter | null;
  chapterIndex: number;
  isPlaying: boolean;
  isPaused: boolean;
  progress: number;
  elapsedTime: number;
  totalDuration: number;
  intensity: number;
}

export const useEgyptianCode = () => {
  const [state, setState] = useState<EgyptianCodeState>({
    currentChapter: null,
    chapterIndex: 0,
    isPlaying: false,
    isPaused: false,
    progress: 0,
    elapsedTime: 0,
    totalDuration: getTotalDuration(),
    intensity: 0.5,
  });

  const audioEngineRef = useRef<EgyptianAudioEngine | null>(null);
  const chapterStartTimeRef = useRef<number>(0);
  const progressIntervalRef = useRef<number | null>(null);
  const chapterTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const engine = new EgyptianAudioEngine();
    engine.initialize().catch(console.error);
    audioEngineRef.current = engine;

    return () => {
      engine.destroy();
    };
  }, []);

  const startProgressTracking = useCallback((chapter: EgyptianChapter) => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    chapterStartTimeRef.current = Date.now();

    progressIntervalRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - chapterStartTimeRef.current) / 1000;
      const progress = Math.min(1, elapsed / chapter.duration);

      setState(prev => ({
        ...prev,
        progress,
        elapsedTime: prev.elapsedTime + 0.1,
      }));

      if (progress >= 1) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      }
    }, 100);
  }, []);

  const scheduleNextChapter = useCallback((currentChapter: EgyptianChapter) => {
    if (chapterTimeoutRef.current) {
      clearTimeout(chapterTimeoutRef.current);
    }

    chapterTimeoutRef.current = window.setTimeout(() => {
      const nextChapter = getNextChapter(currentChapter.id);

      if (nextChapter) {
        if (audioEngineRef.current) {
          audioEngineRef.current.playChapter(nextChapter, state.intensity);
        }

        setState(prev => ({
          ...prev,
          currentChapter: nextChapter,
          chapterIndex: prev.chapterIndex + 1,
          progress: 0,
        }));

        startProgressTracking(nextChapter);
        scheduleNextChapter(nextChapter);
      } else {
        stop();
      }
    }, currentChapter.duration * 1000);
  }, [state.intensity]);

  const start = useCallback(async () => {
    if (!audioEngineRef.current) return;

    const firstChapter = EGYPTIAN_CODE_CHAPTERS[0];

    try {
      await audioEngineRef.current.playChapter(firstChapter, state.intensity);

      setState(prev => ({
        ...prev,
        currentChapter: firstChapter,
        chapterIndex: 0,
        isPlaying: true,
        isPaused: false,
        progress: 0,
        elapsedTime: 0,
      }));

      startProgressTracking(firstChapter);
      scheduleNextChapter(firstChapter);
    } catch (error) {
      console.error('Failed to start Egyptian Code:', error);
    }
  }, [state.intensity, startProgressTracking, scheduleNextChapter]);

  const stop = useCallback(() => {
    if (audioEngineRef.current) {
      audioEngineRef.current.stop();
    }

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    if (chapterTimeoutRef.current) {
      clearTimeout(chapterTimeoutRef.current);
      chapterTimeoutRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      currentChapter: null,
      chapterIndex: 0,
      progress: 0,
      elapsedTime: 0,
    }));
  }, []);

  const pause = useCallback(() => {
    if (audioEngineRef.current) {
      audioEngineRef.current.stop();
    }

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    if (chapterTimeoutRef.current) {
      clearTimeout(chapterTimeoutRef.current);
      chapterTimeoutRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isPlaying: false,
      isPaused: true,
    }));
  }, []);

  const resume = useCallback(async () => {
    if (!audioEngineRef.current || !state.currentChapter) return;

    try {
      await audioEngineRef.current.playChapter(state.currentChapter, state.intensity);

      setState(prev => ({
        ...prev,
        isPlaying: true,
        isPaused: false,
      }));

      if (state.currentChapter) {
        const remainingTime = state.currentChapter.duration * (1 - state.progress);

        chapterTimeoutRef.current = window.setTimeout(() => {
          const nextChapter = getNextChapter(state.currentChapter!.id);

          if (nextChapter) {
            if (audioEngineRef.current) {
              audioEngineRef.current.playChapter(nextChapter, state.intensity);
            }

            setState(prev => ({
              ...prev,
              currentChapter: nextChapter,
              chapterIndex: prev.chapterIndex + 1,
              progress: 0,
            }));

            startProgressTracking(nextChapter);
            scheduleNextChapter(nextChapter);
          } else {
            stop();
          }
        }, remainingTime * 1000);

        startProgressTracking(state.currentChapter);
      }
    } catch (error) {
      console.error('Failed to resume Egyptian Code:', error);
    }
  }, [state.currentChapter, state.intensity, state.progress, startProgressTracking, scheduleNextChapter, stop]);

  const skipToChapter = useCallback(async (chapterIndex: number) => {
    if (chapterIndex < 0 || chapterIndex >= EGYPTIAN_CODE_CHAPTERS.length) {
      return;
    }

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    if (chapterTimeoutRef.current) {
      clearTimeout(chapterTimeoutRef.current);
      chapterTimeoutRef.current = null;
    }

    const newChapter = EGYPTIAN_CODE_CHAPTERS[chapterIndex];

    if (audioEngineRef.current) {
      await audioEngineRef.current.playChapter(newChapter, state.intensity);
    }

    setState(prev => ({
      ...prev,
      currentChapter: newChapter,
      chapterIndex,
      progress: 0,
      isPlaying: true,
    }));

    startProgressTracking(newChapter);
    scheduleNextChapter(newChapter);
  }, [state.intensity, startProgressTracking, scheduleNextChapter]);

  const setIntensity = useCallback((intensity: number) => {
    setState(prev => ({ ...prev, intensity: Math.max(0, Math.min(1, intensity)) }));
  }, []);

  const getSpectrumData = useCallback(() => {
    if (!audioEngineRef.current) {
      return {
        frequencyData: new Uint8Array(0),
        averageEnergy: 0,
        peakFrequency: 0,
        bassEnergy: 0,
        midEnergy: 0,
        trebleEnergy: 0,
      };
    }

    const frequencyData = audioEngineRef.current.getSpectrumData();
    let sum = 0;
    for (let i = 0; i < frequencyData.length; i++) {
      sum += frequencyData[i];
    }
    const averageEnergy = sum / frequencyData.length / 255;

    return {
      frequencyData,
      averageEnergy,
      peakFrequency: 0,
      bassEnergy: 0,
      midEnergy: 0,
      trebleEnergy: 0,
    };
  }, []);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (chapterTimeoutRef.current) {
        clearTimeout(chapterTimeoutRef.current);
      }
    };
  }, []);

  return {
    state,
    chapters: EGYPTIAN_CODE_CHAPTERS,
    start,
    stop,
    pause,
    resume,
    skipToChapter,
    setIntensity,
    getSpectrumData,
  };
};
