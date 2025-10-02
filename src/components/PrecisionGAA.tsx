import React, { useState, useEffect } from 'react';
import { EnhancedVisuals, type GeometryMode } from './EnhancedVisuals';
import { usePrecisionSync } from '../hooks/usePrecisionSync';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { GAAControls } from './GAAControls';
import { SyncQualityIndicator } from './SyncQualityIndicator';
import { SafetyWarningModal } from './SafetyWarningModal';
import { SafetyMonitor } from '../utils/safetyMonitor';
import type { GAAState } from '../hooks/useGAA';

export interface PrecisionGAAProps {
  userId?: string;
  circleId?: string;
  theme?: 'dark' | 'light';
  showControls?: boolean;
  userAge?: number;
}

export const PrecisionGAA: React.FC<PrecisionGAAProps> = ({
  userId,
  circleId,
  theme = 'dark',
  showControls = true,
  userAge,
}) => {
  const precisionSync = usePrecisionSync({ userId, circleId });
  const [safetyMonitor] = useState(() => new SafetyMonitor());
  const [safetyWarnings, setSafetyWarnings] = useState<any[]>([]);
  const [gaaState, setGaaState] = useState<Partial<GAAState>>({
    frequency: 432,
    intensity: 0.5,
    waveType: 'sine',
    pulseSpeed: 1,
    geometryMode: 'waves',
    isPlaying: false,
    mode: 'binaural',
    harmonicCount: 3,
    sweepStart: 396,
    sweepEnd: 852,
    sweepDuration: 10,
    binauralBeat: 7,
    enableOrbitControls: false,
  });

  useEffect(() => {
    if (userAge) {
      safetyMonitor.setUserAge(userAge);
    }
  }, [userAge, safetyMonitor]);

  useEffect(() => {
    if (!precisionSync.state.isCalibrating && !precisionSync.state.isReady) {
      precisionSync.initializeClockSync();
    }
  }, [precisionSync]);

  const handleStart = async () => {
    try {
      const binauralValidation = safetyMonitor.validateBinauralFrequency(
        gaaState.binauralBeat || 7
      );

      if (binauralValidation.warning) {
        setSafetyWarnings([binauralValidation.warning]);
        if (!binauralValidation.valid) {
          return;
        }
      }

      safetyMonitor.startSession();

      const sessionId = await precisionSync.createSession({
        f0: gaaState.frequency || 432,
        waveform: gaaState.waveType || 'sine',
        geometricPack: 'octave',
        binauralHz: binauralValidation.adjustedHz,
        bpm: 60,
        beatsPerBar: 8,
      });

      if (sessionId) {
        await precisionSync.joinSession(sessionId);
        setGaaState((prev) => ({ ...prev, isPlaying: true }));
      }
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const handleStop = async () => {
    await precisionSync.stop();
    safetyMonitor.endSession();
    setGaaState((prev) => ({ ...prev, isPlaying: false }));
  };

  const handleUpdateConfig = async (updates: Partial<GAAState>) => {
    setGaaState((prev) => ({ ...prev, ...updates }));
  };

  const togglePlay = () => {
    if (gaaState.isPlaying) {
      handleStop();
    } else {
      handleStart();
    }
  };

  const adjustFrequency = (delta: number) => {
    const newFreq = Math.max(20, Math.min(2000, (gaaState.frequency || 432) + delta));
    handleUpdateConfig({ frequency: newFreq });
  };

  const adjustIntensity = (delta: number) => {
    const newIntensity = Math.max(0, Math.min(1, (gaaState.intensity || 0.5) + delta));
    handleUpdateConfig({ intensity: newIntensity });
  };

  const geometryModes: GeometryMode[] = [
    'waves',
    'lattice',
    'sacredGeometry',
    'particles',
    'dome',
  ];
  const currentGeometryIndex = geometryModes.indexOf(
    gaaState.geometryMode || 'waves'
  );

  const nextGeometry = () => {
    const nextIndex = (currentGeometryIndex + 1) % geometryModes.length;
    handleUpdateConfig({ geometryMode: geometryModes[nextIndex] });
  };

  const previousGeometry = () => {
    const prevIndex =
      (currentGeometryIndex - 1 + geometryModes.length) % geometryModes.length;
    handleUpdateConfig({ geometryMode: geometryModes[prevIndex] });
  };

  useKeyboardShortcuts({
    onTogglePlay: togglePlay,
    onIncreaseFrequency: () => adjustFrequency(10),
    onDecreaseFrequency: () => adjustFrequency(-10),
    onIncreaseIntensity: () => adjustIntensity(0.05),
    onDecreaseIntensity: () => adjustIntensity(-0.05),
    onNextGeometry: nextGeometry,
    onPreviousGeometry: previousGeometry,
    onSavePreset: () => {},
  });

  const getSpectrumData = () => {
    return {
      frequencyData: new Uint8Array(0),
      averageEnergy: 0,
      peakFrequency: 0,
      bassEnergy: 0,
      midEnergy: 0,
      trebleEnergy: 0,
    };
  };

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{ backgroundColor: theme === 'dark' ? '#282a36' : '#ffffff' }}
    >
      <EnhancedVisuals
        frequency={gaaState.frequency || 432}
        intensity={gaaState.intensity || 0.5}
        pulseSpeed={gaaState.pulseSpeed || 1}
        isPlaying={gaaState.isPlaying || false}
        geometryMode={gaaState.geometryMode || 'waves'}
        getSpectrumData={getSpectrumData}
        enableOrbitControls={gaaState.enableOrbitControls || false}
      />

      {showControls && (
        <GAAControls
          state={gaaState as GAAState}
          onStart={handleStart}
          onStop={handleStop}
          onUpdateConfig={handleUpdateConfig}
          onSetPulseSpeed={(speed) => handleUpdateConfig({ pulseSpeed: speed })}
          onSetGeometryMode={(mode) => handleUpdateConfig({ geometryMode: mode })}
          onSetEnableOrbitControls={(enabled) =>
            handleUpdateConfig({ enableOrbitControls: enabled })
          }
          onCollectiveSync={() => {}}
          onOpenPresets={() => {}}
          onOpenHelp={() => {}}
          onOpenVision={() => {}}
          theme={theme}
        />
      )}

      {precisionSync.state.isCalibrating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl p-8 text-center max-w-md">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-white mb-2">
              Calibrating Clock Sync
            </h3>
            <p className="text-gray-400 text-sm">
              Measuring network latency and synchronizing with server time...
            </p>
          </div>
        </div>
      )}

      {precisionSync.state.timeUntilStart !== null &&
        precisionSync.state.timeUntilStart > 0 && (
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
            <div className="bg-slate-900 rounded-xl p-8 text-center border border-cyan-500/30 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-4">
                Synchronizing...
              </h3>
              <div className="text-6xl font-bold text-cyan-400 mb-2">
                {Math.ceil(precisionSync.state.timeUntilStart / 1000)}
              </div>
              <p className="text-gray-400 text-sm">
                Starting at next bar boundary
              </p>
            </div>
          </div>
        )}

      {precisionSync.state.isPlaying && (
        <SyncQualityIndicator
          offsetMs={precisionSync.state.offsetMs}
          rttMs={precisionSync.state.rttMs}
          driftMs={precisionSync.state.driftMs}
          quality={precisionSync.state.syncQuality}
          isConnected={true}
          theme={theme}
        />
      )}

      {safetyWarnings.length > 0 && (
        <SafetyWarningModal
          warnings={safetyWarnings}
          onAcknowledge={() => setSafetyWarnings([])}
          theme={theme}
        />
      )}
    </div>
  );
};
