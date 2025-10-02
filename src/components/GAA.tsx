import React, { useState, useEffect } from 'react';
import { EnhancedVisuals, type GeometryMode } from './EnhancedVisuals';
import { useGAA, type UseGAAOptions, type GAAConfig } from '../hooks/useGAA';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { GAAControls } from './GAAControls';
import { CollectiveSyncModal } from './CollectiveSyncModal';
import { PresetsModal } from './PresetsModal';
import { HelpModal } from './HelpModal';
import { VisionModal } from './VisionModal';
import { ThresholdNotification } from './ThresholdNotification';
import { AudioCalibration } from './AudioCalibration';

export interface GAAProps extends UseGAAOptions {
  theme?: 'dark' | 'light';
  showControls?: boolean;
  onSync?: () => void;
}

export const GAA: React.FC<GAAProps> = ({
  userId,
  circleId,
  initialConfig,
  onResonanceChange,
  enableSync = false,
  theme = 'dark',
  showControls = true,
  onSync,
}) => {
  const gaa = useGAA({
    userId,
    circleId,
    initialConfig,
    onResonanceChange,
    enableSync,
  });

  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showPresetsModal, setShowPresetsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showVisionModal, setShowVisionModal] = useState(false);

  const geometryModes: GeometryMode[] = ['waves', 'lattice', 'sacredGeometry', 'particles', 'dome'];
  const currentGeometryIndex = geometryModes.indexOf(gaa.state.geometryMode);

  const togglePlay = () => {
    if (gaa.state.isPlaying) {
      gaa.stop();
    } else {
      gaa.start();
    }
  };

  const adjustFrequency = (delta: number) => {
    const newFreq = Math.max(20, Math.min(2000, gaa.state.frequency + delta));
    gaa.updateConfig({ frequency: newFreq });
  };

  const adjustIntensity = (delta: number) => {
    const newIntensity = Math.max(0, Math.min(1, gaa.state.intensity + delta));
    gaa.updateConfig({ intensity: newIntensity });
  };

  const nextGeometry = () => {
    const nextIndex = (currentGeometryIndex + 1) % geometryModes.length;
    gaa.setGeometryMode(geometryModes[nextIndex]);
  };

  const previousGeometry = () => {
    const prevIndex = (currentGeometryIndex - 1 + geometryModes.length) % geometryModes.length;
    gaa.setGeometryMode(geometryModes[prevIndex]);
  };

  useKeyboardShortcuts({
    onTogglePlay: togglePlay,
    onIncreaseFrequency: () => adjustFrequency(10),
    onDecreaseFrequency: () => adjustFrequency(-10),
    onIncreaseIntensity: () => adjustIntensity(0.05),
    onDecreaseIntensity: () => adjustIntensity(-0.05),
    onNextGeometry: nextGeometry,
    onPreviousGeometry: previousGeometry,
    onSavePreset: () => setShowPresetsModal(true),
  });

  const handleCollectiveSync = () => {
    setShowSyncModal(true);
    onSync?.();
  };

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{ backgroundColor: theme === 'dark' ? '#282a36' : '#ffffff' }}
    >
      <EnhancedVisuals
        frequency={gaa.state.frequency}
        intensity={gaa.state.intensity}
        pulseSpeed={gaa.state.pulseSpeed}
        isPlaying={gaa.state.isPlaying}
        geometryMode={gaa.state.geometryMode}
        getSpectrumData={gaa.getSpectrumData}
        enableOrbitControls={gaa.state.enableOrbitControls}
      />

      {showControls && (
        <GAAControls
          state={gaa.state}
          syncState={gaa.sync}
          onStart={() => gaa.start()}
          onStop={() => gaa.stop()}
          onUpdateConfig={gaa.updateConfig}
          onSetPulseSpeed={gaa.setPulseSpeed}
          onSetGeometryMode={gaa.setGeometryMode}
          onSetEnableOrbitControls={gaa.setEnableOrbitControls}
          onCollectiveSync={handleCollectiveSync}
          onOpenPresets={() => setShowPresetsModal(true)}
          onOpenHelp={() => setShowHelpModal(true)}
          onOpenVision={() => setShowVisionModal(true)}
          theme={theme}
        />
      )}

      <CollectiveSyncModal
        open={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        syncState={gaa.sync}
        theme={theme}
      />

      <PresetsModal
        open={showPresetsModal}
        onClose={() => setShowPresetsModal(false)}
        presets={gaa.presets.presets}
        isLoading={gaa.presets.isLoading}
        onLoadPreset={gaa.loadPreset}
        onSavePreset={gaa.presets.savePreset}
        onDeletePreset={gaa.presets.deletePreset}
        currentState={gaa.state}
        theme={theme}
      />

      <HelpModal
        open={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        theme={theme}
      />

      <VisionModal
        isOpen={showVisionModal}
        onClose={() => setShowVisionModal(false)}
        theme={theme}
      />

      {gaa.sync && gaa.sync.isConnected && (
        <ThresholdNotification
          userCount={gaa.sync.totalUsers}
          theme={theme}
        />
      )}

      <AudioCalibration
        getActualFrequencies={gaa.getActualFrequencies}
        getSpectrumData={gaa.getSpectrumData}
        isPlaying={gaa.state.isPlaying}
        targetFrequency={gaa.state.frequency}
        targetBeat={gaa.state.binauralBeat}
        theme={theme}
      />
    </div>
  );
};
