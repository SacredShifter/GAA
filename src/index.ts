export { GAA } from './components/GAA';
export type { GAAProps } from './components/GAA';

export { useGAA } from './hooks/useGAA';
export type { UseGAAOptions, UseGAAReturn, GAAState, GAAConfig } from './hooks/useGAA';

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

export { VisualMap } from './components/VisualMap';

export { AnalyticsDashboard } from './components/AnalyticsDashboard';

export { ImmersiveVisuals } from './components/ImmersiveVisuals';

export { GaaModuleWrapper, getModuleManifest, getExposedItems } from './integrations/GaaModuleWrapper';
export type {
  ModuleManifest,
  GESemanticEvent,
  CodexStreamEntry,
  GaaModuleWrapperProps,
} from './integrations/GaaModuleWrapper';
