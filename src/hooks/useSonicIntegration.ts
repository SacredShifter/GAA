import { useEffect, useRef, useState, useCallback } from 'react';
import { SonicGAAIntegration, CoherenceData, CoherenceFeedback } from '../utils/sonicGAAIntegration';

export interface UseSonicIntegrationOptions {
  userId?: string;
  sessionId?: string;
  autoStart?: boolean;
  mode?: 'individual' | 'collective';
}

export interface SonicIntegrationState {
  isConnected: boolean;
  currentCoherence: number;
  lastFeedback: CoherenceFeedback | null;
  historicalData: CoherenceData[];
  isLoading: boolean;
}

export const useSonicIntegration = (options: UseSonicIntegrationOptions = {}) => {
  const {
    userId,
    sessionId,
    autoStart = false,
    mode = 'individual',
  } = options;

  const integrationRef = useRef<SonicGAAIntegration | null>(null);
  const [state, setState] = useState<SonicIntegrationState>({
    isConnected: false,
    currentCoherence: 0.5,
    lastFeedback: null,
    historicalData: [],
    isLoading: false,
  });

  useEffect(() => {
    if (!integrationRef.current) {
      integrationRef.current = new SonicGAAIntegration();
    }

    if (autoStart) {
      startListening();
    }

    return () => {
      if (integrationRef.current) {
        integrationRef.current.stopListening();
      }
    };
  }, [autoStart]);

  useEffect(() => {
    if (!integrationRef.current) return;

    const handleCoherenceUpdate = (event: CustomEvent) => {
      const feedback = event.detail.payload as CoherenceFeedback;
      setState((prev) => ({
        ...prev,
        currentCoherence: feedback.coherenceIndex,
        lastFeedback: feedback,
      }));
    };

    const handleBridgeReady = () => {
      setState((prev) => ({ ...prev, isConnected: true }));
    };

    const handleBridgeDisconnected = () => {
      setState((prev) => ({ ...prev, isConnected: false }));
    };

    const eventBus = (window as any).GlobalEventHorizon || document.createElement('div');
    eventBus.addEventListener('gaa:coherence:update', handleCoherenceUpdate);
    eventBus.addEventListener('gaa:bridge:ready', handleBridgeReady);
    eventBus.addEventListener('sonic:bridge:disconnected', handleBridgeDisconnected);

    return () => {
      eventBus.removeEventListener('gaa:coherence:update', handleCoherenceUpdate);
      eventBus.removeEventListener('gaa:bridge:ready', handleBridgeReady);
      eventBus.removeEventListener('sonic:bridge:disconnected', handleBridgeDisconnected);
    };
  }, []);

  const startListening = useCallback(() => {
    if (!integrationRef.current) return;

    integrationRef.current.startListening();
    setState((prev) => ({ ...prev, isConnected: true }));

    if (userId && sessionId) {
      emitSessionStart(userId, sessionId);
    }
  }, [userId, sessionId]);

  const stopListening = useCallback(() => {
    if (!integrationRef.current) return;

    integrationRef.current.stopListening();
    setState((prev) => ({ ...prev, isConnected: false }));

    if (sessionId) {
      emitSessionEnd(sessionId);
    }
  }, [sessionId]);

  const emitSessionStart = useCallback((uid: string, sid: string) => {
    const eventBus = (window as any).GlobalEventHorizon || document.createElement('div');
    const event = new CustomEvent('gaa:session:start', {
      detail: {
        type: 'gaa:session:start',
        sourceId: 'gaa-core',
        timestamp: new Date().toISOString(),
        payload: {
          userId: uid,
          sessionId: sid,
          mode,
        },
        essenceLabels: ['session', 'start', 'gaa'],
      },
    });
    eventBus.dispatchEvent(event);
  }, [mode]);

  const emitSessionEnd = useCallback((sid: string) => {
    const eventBus = (window as any).GlobalEventHorizon || document.createElement('div');
    const event = new CustomEvent('gaa:session:end', {
      detail: {
        type: 'gaa:session:end',
        sourceId: 'gaa-core',
        timestamp: new Date().toISOString(),
        payload: {
          sessionId: sid,
        },
        essenceLabels: ['session', 'end', 'gaa'],
      },
    });
    eventBus.dispatchEvent(event);
  }, []);

  const fetchHistory = useCallback(async () => {
    if (!userId || !integrationRef.current) return;

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const history = await integrationRef.current.getCoherenceHistory(userId);
      setState((prev) => ({
        ...prev,
        historicalData: history,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to fetch coherence history:', error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [userId]);

  const requestCoherence = useCallback(() => {
    if (!userId) return;

    const eventBus = (window as any).GlobalEventHorizon || document.createElement('div');
    const event = new CustomEvent('sonic:request:coherence', {
      detail: {
        type: 'sonic:request:coherence',
        sourceId: 'gaa-core',
        timestamp: new Date().toISOString(),
        payload: { userId },
        essenceLabels: ['coherence', 'request', 'gaa'],
      },
    });
    eventBus.dispatchEvent(event);
  }, [userId]);

  const sendManualFeedback = useCallback((coherence: number) => {
    if (!integrationRef.current) return;
    integrationRef.current.sendFeedback(coherence);
  }, []);

  return {
    state,
    startListening,
    stopListening,
    fetchHistory,
    requestCoherence,
    sendManualFeedback,
    integration: integrationRef.current,
  };
};
