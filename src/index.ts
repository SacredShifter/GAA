export { GAA } from './components/GAA';
export type { GAAProps } from './components/GAA';

export { PrecisionGAA } from './components/PrecisionGAA';
export type { PrecisionGAAProps } from './components/PrecisionGAA';

export { useGAA } from './hooks/useGAA';
export type { UseGAAOptions, UseGAAReturn, GAAState, GAAConfig } from './hooks/useGAA';

export { usePrecisionSync } from './hooks/usePrecisionSync';
export type { PrecisionSyncState, UsePrecisionSyncOptions } from './hooks/usePrecisionSync';

export { useEnhancedAudio } from './hooks/useEnhancedAudio';
export type { AudioEngineState, WaveType, AudioMode, SpectrumData } from './hooks/useEnhancedAudio';

export { useSync } from './hooks/useSync';
export type { SyncSession, SyncState } from './hooks/useSync';

export { usePresets } from './hooks/usePresets';
export type { Preset } from './hooks/usePresets';

export { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
export type { KeyboardShortcuts } from './hooks/useKeyboardShortcuts';

export { useAnalytics } from './hooks/useAnalytics';
export type {
  SessionAnalytics,
  FrequencyDistribution,
  GlobalMetrics,
  UserAnalyticsSummary,
  AnalyticsState,
} from './hooks/useAnalytics';

export { EnhancedVisuals } from './components/EnhancedVisuals';
export type { GeometryMode } from './components/EnhancedVisuals';

export { EnhancedVisualsV2 } from './components/EnhancedVisualsV2';

export { VisualMap } from './components/VisualMap';

export { AnalyticsDashboard } from './components/AnalyticsDashboard';

export { ImmersiveVisuals } from './components/ImmersiveVisuals';

export { VisionModal } from './components/VisionModal';

export { AboutModal } from './components/AboutModal';

export { AudioCalibration } from './components/AudioCalibration';

export { ThresholdNotification } from './components/ThresholdNotification';

export { SyncQualityIndicator } from './components/SyncQualityIndicator';

export { SafetyWarningModal } from './components/SafetyWarningModal';

export { usePerformanceQuality } from './hooks/usePerformanceQuality';

export { performanceDetector } from './utils/performanceDetector';
export type { QualityLevel, QualitySettings, DeviceCapabilities } from './utils/performanceDetector';

export { ClockSyncManager, calibrateClock, serverEpochToContextTime, contextTimeToServerEpoch } from './utils/clockSync';
export type { ClockSyncResult, TimingMeasurement } from './utils/clockSync';

export { TempoGrid, calculateSweepFactor, createSyncConfigMessage, createBarMarkMessage, createHeartbeatMessage } from './utils/syncProtocol';
export type { SyncConfig, BarMark, SyncMessage } from './utils/syncProtocol';

export { PrecisionAudioEngine } from './utils/precisionAudioEngine';
export type { PrecisionAudioEngineConfig } from './utils/precisionAudioEngine';

export { SafetyMonitor, createHeadphoneWarningMessage, shouldShowBinauralRestriction, DEFAULT_SAFETY_CONFIG } from './utils/safetyMonitor';
export type { SafetyConfig, SafetyWarning } from './utils/safetyMonitor';

export { GEOMETRIC_PACKS, BASE_FREQUENCIES, calculateHarmonicStack, getGeometricPackByShape, centsToFrequencyRatio, frequencyRatioToCents } from './utils/geometricFrequencies';
export type { GeometricFrequencyPack } from './utils/geometricFrequencies';

export { EGYPTIAN_CODE_CHAPTERS, getTotalDuration, getChapterById, getChapterIndex, getNextChapter, getPreviousChapter, generatePhiIntervals, generateHarmonicStack, PHI } from './utils/egyptianCodeFrequencies';
export type { EgyptianChapter } from './utils/egyptianCodeFrequencies';

export { EgyptianAudioEngine } from './utils/egyptianAudioEngine';

export { EgyptianCodeGAA } from './components/EgyptianCodeGAA';
export type { EgyptianCodeGAAProps } from './components/EgyptianCodeGAA';

export { EgyptianVisuals } from './components/EgyptianVisuals';

export { useEgyptianCode } from './hooks/useEgyptianCode';
export type { EgyptianCodeState } from './hooks/useEgyptianCode';

export { GaaModuleWrapper, getModuleManifest, getExposedItems } from './integrations/GaaModuleWrapper';
export type {
  ModuleManifest,
  GESemanticEvent,
  CodexStreamEntry,
  GaaModuleWrapperProps,
} from './integrations/GaaModuleWrapper';

export { CollectiveConsciousnessField } from './components/CollectiveConsciousnessField';
export type { CollectiveConsciousnessFieldProps } from './components/CollectiveConsciousnessField';

export { SpacetimeFieldVisualization } from './components/SpacetimeFieldVisualization';
export type { SpacetimeFieldVisualizationProps } from './components/SpacetimeFieldVisualization';

export { useCollectiveConsciousness } from './hooks/useCollectiveConsciousness';
export type {
  CollectiveConsciousnessState,
  UseCollectiveConsciousnessOptions,
  UseCollectiveConsciousnessReturn,
} from './hooks/useCollectiveConsciousness';

export { BiometricMonitor } from './utils/biometricMonitor';
export type { BiometricReading, PPGSignal } from './utils/biometricMonitor';

export { QuantumCoherenceEngine } from './utils/quantumCoherenceEngine';
export type {
  QuantumState,
  Complex,
  EntanglementPair,
  CollectiveWaveFunction,
} from './utils/quantumCoherenceEngine';

export { AIJourneyOrchestrator } from './utils/aiJourneyOrchestrator';
export type {
  AIInsight,
  SessionPattern,
  HistoricalSession,
} from './utils/aiJourneyOrchestrator';
