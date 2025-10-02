import React, { useEffect, useCallback } from 'react';
import { GAA, type GAAProps } from '../components/GAA';
import type { GAAState } from '../hooks/useGAA';

export interface ModuleManifest {
  id: string;
  name: string;
  version: string;
  capabilities: string[];
  essenceLabels: string[];
  telosAlignment: string[];
  resourceFootprintMB: number;
  integrityScore: number;
  dependencies?: string[];
}

export interface GESemanticEvent {
  type: string;
  source: string;
  timestamp: number;
  data: any;
  essenceLabel?: string;
}

export interface CodexStreamEntry {
  id: string;
  userId: string;
  circleId?: string;
  timestamp: number;
  content: string;
  type: 'insight' | 'resonance' | 'pattern' | 'alignment';
  metadata?: Record<string, any>;
}

export interface GaaModuleWrapperProps extends Omit<GAAProps, 'userId' | 'circleId'> {
  session?: {
    user: {
      id: string;
      email?: string;
    };
    circle?: {
      id: string;
      name?: string;
    };
  };
  onEmitEvent?: (event: GESemanticEvent) => void;
  onCodexInsight?: (entry: CodexStreamEntry) => void;
  globalEventHorizon?: {
    emit: (event: GESemanticEvent) => void;
    subscribe: (eventType: string, handler: (event: GESemanticEvent) => void) => void;
    unsubscribe: (eventType: string, handler: (event: GESemanticEvent) => void) => void;
  };
  manifest?: ModuleManifest;
}

const DEFAULT_MANIFEST: ModuleManifest = {
  id: 'gaa-module',
  name: 'Global Awareness Attunement',
  version: '1.0.0',
  capabilities: [
    'resonance-generation',
    'frequency-manipulation',
    'collective-sync',
    'visual-mapping',
    'analytics-tracking',
    'immersive-experience',
  ],
  essenceLabels: [
    'consciousness',
    'vibration',
    'harmony',
    'synchronization',
    'awareness',
    'resonance',
    'unity',
  ],
  telosAlignment: [
    'collective-consciousness-elevation',
    'harmonic-convergence',
    'individual-empowerment',
    'sacred-geometry-activation',
    'frequency-healing',
  ],
  resourceFootprintMB: 15,
  integrityScore: 1.0,
  dependencies: ['three', 'supabase'],
};

export const GaaModuleWrapper: React.FC<GaaModuleWrapperProps> = ({
  session,
  onEmitEvent,
  onCodexInsight,
  globalEventHorizon,
  manifest = DEFAULT_MANIFEST,
  ...gaaProps
}) => {
  const userId = session?.user?.id;
  const circleId = session?.circle?.id;

  const emitToGlobalEventHorizon = useCallback(
    (eventType: string, data: any, essenceLabel?: string) => {
      const event: GESemanticEvent = {
        type: eventType,
        source: manifest.id,
        timestamp: Date.now(),
        data,
        essenceLabel,
      };

      if (globalEventHorizon) {
        globalEventHorizon.emit(event);
      }

      if (onEmitEvent) {
        onEmitEvent(event);
      }
    },
    [globalEventHorizon, onEmitEvent, manifest.id]
  );

  const generateCodexInsight = useCallback(
    (state: GAAState, insightType: CodexStreamEntry['type']) => {
      if (!userId) return;

      let content = '';
      let metadata: Record<string, any> = {};

      switch (insightType) {
        case 'resonance':
          content = `Resonating at ${Math.floor(state.frequency)}Hz with ${(state.intensity * 100).toFixed(0)}% intensity`;
          metadata = {
            frequency: state.frequency,
            intensity: state.intensity,
            waveType: state.waveType,
            geometryMode: state.geometryMode,
          };
          break;
        case 'pattern':
          content = `Pattern detected: ${state.geometryMode} geometry with ${state.waveType} wave`;
          metadata = {
            geometryMode: state.geometryMode,
            waveType: state.waveType,
            pulseSpeed: state.pulseSpeed,
          };
          break;
        case 'alignment':
          content = `Aligned with ${state.mode} mode, pulse speed ${state.pulseSpeed.toFixed(1)}x`;
          metadata = {
            mode: state.mode,
            pulseSpeed: state.pulseSpeed,
            enableOrbitControls: state.enableOrbitControls,
          };
          break;
        case 'insight':
        default:
          content = `GAA session active: exploring ${state.geometryMode} visualization`;
          metadata = { state };
          break;
      }

      const entry: CodexStreamEntry = {
        id: `gaa-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        circleId,
        timestamp: Date.now(),
        content,
        type: insightType,
        metadata,
      };

      if (onCodexInsight) {
        onCodexInsight(entry);
      }
    },
    [userId, circleId, onCodexInsight]
  );

  const handleResonanceChange = useCallback(
    (state: GAAState) => {
      emitToGlobalEventHorizon(
        'gaa.resonance.changed',
        {
          frequency: state.frequency,
          intensity: state.intensity,
          isPlaying: state.isPlaying,
        },
        'vibration'
      );

      if (state.isPlaying) {
        generateCodexInsight(state, 'resonance');
      }

      if (gaaProps.onResonanceChange) {
        gaaProps.onResonanceChange(state);
      }
    },
    [emitToGlobalEventHorizon, generateCodexInsight, gaaProps]
  );

  const handleSync = useCallback(() => {
    emitToGlobalEventHorizon(
      'gaa.collective.sync',
      {
        userId,
        circleId,
        timestamp: Date.now(),
      },
      'synchronization'
    );

    if (userId) {
      const syncInsight: CodexStreamEntry = {
        id: `gaa-sync-${Date.now()}`,
        userId,
        circleId,
        timestamp: Date.now(),
        content: 'Joined collective synchronization session',
        type: 'alignment',
        metadata: { action: 'sync-join' },
      };

      if (onCodexInsight) {
        onCodexInsight(syncInsight);
      }
    }

    if (gaaProps.onSync) {
      gaaProps.onSync();
    }
  }, [emitToGlobalEventHorizon, userId, circleId, onCodexInsight, gaaProps]);

  useEffect(() => {
    emitToGlobalEventHorizon(
      'module.initialized',
      {
        manifest,
        userId,
        circleId,
      },
      'consciousness'
    );

    if (globalEventHorizon) {
      const handleShifterEvent = (event: GESemanticEvent) => {
        if (event.type === 'shifter.theme.changed') {
        }

        if (event.type === 'shifter.circle.changed') {
        }
      };

      globalEventHorizon.subscribe('shifter.*', handleShifterEvent);

      return () => {
        globalEventHorizon.unsubscribe('shifter.*', handleShifterEvent);

        emitToGlobalEventHorizon(
          'module.deactivated',
          { manifest, userId },
          'rhythm'
        );
      };
    }
  }, [globalEventHorizon, emitToGlobalEventHorizon, manifest, userId, circleId]);

  useEffect(() => {
    return () => {
      emitToGlobalEventHorizon(
        'module.destroyed',
        { manifest, userId },
        'rhythm'
      );
    };
  }, []);

  return (
    <GAA
      {...gaaProps}
      userId={userId}
      circleId={circleId}
      onResonanceChange={handleResonanceChange}
      onSync={handleSync}
    />
  );
};

export const getModuleManifest = (): ModuleManifest => DEFAULT_MANIFEST;

export const getExposedItems = () => ({
  GaaModuleWrapper,
  getModuleManifest,
  version: DEFAULT_MANIFEST.version,
  capabilities: DEFAULT_MANIFEST.capabilities,
  essenceLabels: DEFAULT_MANIFEST.essenceLabels,
});
