import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { BiometricMonitor, type BiometricReading } from '../utils/biometricMonitor';
import {
  QuantumCoherenceEngine,
  type CollectiveWaveFunction,
  type QuantumState,
} from '../utils/quantumCoherenceEngine';
import {
  AIJourneyOrchestrator,
  type AIInsight,
  type SessionPattern,
} from '../utils/aiJourneyOrchestrator';

export interface CollectiveConsciousnessState {
  isActive: boolean;
  sessionId: string | null;
  participantCount: number;
  myBiometrics: BiometricReading | null;
  myQuantumState: QuantumState | null;
  collectiveWaveFunction: CollectiveWaveFunction | null;
  aiInsights: AIInsight[];
  globalCoherence: number;
  fieldStrength: number;
  emergentFrequency: number;
  quantumEntanglementMetric: number;
  biometricDeviceConnected: boolean;
  isMonitoring: boolean;
}

export interface UseCollectiveConsciousnessOptions {
  userId?: string;
  sessionId?: string;
  enableBiometrics?: boolean;
  enableAI?: boolean;
  enableQuantum?: boolean;
  autoStart?: boolean;
}

export const useCollectiveConsciousness = (
  options: UseCollectiveConsciousnessOptions = {}
) => {
  const {
    userId,
    sessionId: initialSessionId,
    enableBiometrics = true,
    enableAI = true,
    enableQuantum = true,
    autoStart = false,
  } = options;

  const [state, setState] = useState<CollectiveConsciousnessState>({
    isActive: false,
    sessionId: initialSessionId || null,
    participantCount: 0,
    myBiometrics: null,
    myQuantumState: null,
    collectiveWaveFunction: null,
    aiInsights: [],
    globalCoherence: 0,
    fieldStrength: 0,
    emergentFrequency: 432,
    quantumEntanglementMetric: 0,
    biometricDeviceConnected: false,
    isMonitoring: false,
  });

  const biometricMonitor = useRef<BiometricMonitor | null>(null);
  const quantumEngine = useRef<QuantumCoherenceEngine | null>(null);
  const aiOrchestrator = useRef<AIJourneyOrchestrator | null>(null);
  const biometricMap = useRef<Map<string, BiometricReading>>(new Map());
  const updateInterval = useRef<number | null>(null);
  const realtimeChannel = useRef<any>(null);

  useEffect(() => {
    if (enableBiometrics && !biometricMonitor.current) {
      biometricMonitor.current = new BiometricMonitor();
    }

    if (enableQuantum && !quantumEngine.current) {
      quantumEngine.current = new QuantumCoherenceEngine();
    }

    if (enableAI && !aiOrchestrator.current) {
      aiOrchestrator.current = new AIJourneyOrchestrator();
    }

    if (autoStart) {
      startSession();
    }

    return () => {
      stopSession();
      biometricMonitor.current?.destroy();
    };
  }, []);

  const initializeBiometricDevice = useCallback(
    async (deviceType: 'webcam' | 'bluetooth') => {
      if (!biometricMonitor.current) return false;

      try {
        const success =
          deviceType === 'webcam'
            ? await biometricMonitor.current.initializeWebcamPPG()
            : await biometricMonitor.current.initializeBluetoothHRM();

        if (success) {
          setState((prev) => ({ ...prev, biometricDeviceConnected: true }));
        }

        return success;
      } catch (error) {
        console.error('Failed to initialize biometric device:', error);
        return false;
      }
    },
    []
  );

  const startBiometricMonitoring = useCallback(() => {
    if (!biometricMonitor.current || !userId) return;

    biometricMonitor.current.startMonitoring((reading) => {
      setState((prev) => ({ ...prev, myBiometrics: reading, isMonitoring: true }));

      biometricMap.current.set(userId, reading);

      if (state.sessionId && enableQuantum && quantumEngine.current) {
        quantumEngine.current.updateUserCoherence(
          userId,
          reading.coherenceScore,
          state.emergentFrequency
        );
      }

      saveBiometricReading(reading);
    });
  }, [userId, state.sessionId, state.emergentFrequency, enableQuantum]);

  const stopBiometricMonitoring = useCallback(() => {
    biometricMonitor.current?.stopMonitoring();
    setState((prev) => ({ ...prev, isMonitoring: false }));
  }, []);

  const saveBiometricReading = async (reading: BiometricReading) => {
    if (!userId || !state.sessionId) return;

    try {
      await supabase.from('biometric_streams').insert({
        user_id: userId,
        session_id: state.sessionId,
        timestamp: new Date(reading.timestamp).toISOString(),
        heart_rate: reading.heartRate,
        hrv_rmssd: reading.hrvRMSSD,
        coherence_score: reading.coherenceScore,
        estimated_brainwave_state: reading.estimatedBrainwaveState,
        ppg_quality: reading.ppgQuality,
        device_type: reading.deviceType,
      });
    } catch (error) {
      console.error('Failed to save biometric reading:', error);
    }
  };

  const startSession = useCallback(async () => {
    if (!userId) {
      console.warn('Cannot start session without userId');
      return;
    }

    const sessionId = state.sessionId || crypto.randomUUID();

    if (enableQuantum && quantumEngine.current) {
      const initialState = quantumEngine.current.initializeUserState(userId, 0.5);
      setState((prev) => ({ ...prev, myQuantumState: initialState }));
    }

    subscribeToRealtimeUpdates(sessionId);

    if (enableBiometrics && state.biometricDeviceConnected) {
      startBiometricMonitoring();
    }

    updateInterval.current = window.setInterval(() => {
      updateCollectiveState();
    }, 2000);

    setState((prev) => ({
      ...prev,
      isActive: true,
      sessionId,
    }));
  }, [userId, state.sessionId, enableQuantum, enableBiometrics, state.biometricDeviceConnected]);

  const stopSession = useCallback(async () => {
    if (updateInterval.current) {
      clearInterval(updateInterval.current);
      updateInterval.current = null;
    }

    stopBiometricMonitoring();

    if (realtimeChannel.current) {
      await supabase.removeChannel(realtimeChannel.current);
      realtimeChannel.current = null;
    }

    if (userId && quantumEngine.current) {
      quantumEngine.current.removeUser(userId);
    }

    setState((prev) => ({
      ...prev,
      isActive: false,
      participantCount: 0,
    }));
  }, [userId]);

  const subscribeToRealtimeUpdates = (sessionId: string) => {
    const channel = supabase.channel(`cc_session_${sessionId}`);

    channel
      .on('broadcast', { event: 'biometric_update' }, (payload) => {
        handleBiometricBroadcast(payload);
      })
      .on('broadcast', { event: 'quantum_state' }, (payload) => {
        handleQuantumStateBroadcast(payload);
      })
      .subscribe();

    realtimeChannel.current = channel;
  };

  const handleBiometricBroadcast = (payload: any) => {
    const { userId: broadcastUserId, biometric } = payload.payload;

    if (broadcastUserId && broadcastUserId !== userId) {
      biometricMap.current.set(broadcastUserId, biometric);

      if (enableQuantum && quantumEngine.current && biometric.coherenceScore) {
        quantumEngine.current.updateUserCoherence(
          broadcastUserId,
          biometric.coherenceScore,
          state.emergentFrequency
        );
      }
    }
  };

  const handleQuantumStateBroadcast = (payload: any) => {
    const { userId: broadcastUserId, quantumState } = payload.payload;

    if (broadcastUserId && broadcastUserId !== userId && quantumEngine.current) {
      console.log('Received quantum state from:', broadcastUserId);
    }
  };

  const updateCollectiveState = useCallback(async () => {
    if (!state.sessionId) return;

    let collectiveWave: CollectiveWaveFunction | null = null;

    if (enableQuantum && quantumEngine.current) {
      collectiveWave = quantumEngine.current.calculateCollectiveWaveFunction();
    }

    let insights: AIInsight[] = [];
    if (enableAI && aiOrchestrator.current && collectiveWave) {
      insights = aiOrchestrator.current.analyzeCurrentState(
        collectiveWave,
        biometricMap.current,
        Date.now() - (state.isActive ? 0 : 60000)
      );
    }

    const fieldState = {
      session_id: state.sessionId,
      timestamp: new Date().toISOString(),
      participant_count: biometricMap.current.size,
      avg_coherence: collectiveWave?.globalCoherence || 0,
      field_strength: calculateFieldStrength(collectiveWave, biometricMap.current),
      dominant_frequency: collectiveWave?.emergentFrequency || 432,
      phase_synchrony: calculatePhaseSynchrony(collectiveWave),
      quantum_entanglement_metric: collectiveWave?.collapseProbability || 0,
      emergence_index: calculateEmergenceIndex(collectiveWave),
      coherence_stability: calculateCoherenceStability(biometricMap.current),
    };

    try {
      await supabase.from('collective_field_states').insert(fieldState);
    } catch (error) {
      console.error('Failed to save collective field state:', error);
    }

    setState((prev) => ({
      ...prev,
      collectiveWaveFunction: collectiveWave,
      aiInsights: insights,
      globalCoherence: collectiveWave?.globalCoherence || 0,
      fieldStrength: fieldState.field_strength,
      emergentFrequency: collectiveWave?.emergentFrequency || 432,
      quantumEntanglementMetric: collectiveWave?.collapseProbability || 0,
      participantCount: biometricMap.current.size,
    }));

    if (collectiveWave && realtimeChannel.current && userId) {
      realtimeChannel.current.send({
        type: 'broadcast',
        event: 'quantum_state',
        payload: {
          userId,
          quantumState: state.myQuantumState,
        },
      });
    }
  }, [state.sessionId, state.isActive, state.myQuantumState, enableQuantum, enableAI, userId]);

  const calculateFieldStrength = (
    collectiveWave: CollectiveWaveFunction | null,
    biometrics: Map<string, BiometricReading>
  ): number => {
    if (!collectiveWave) return 0;

    const coherenceComponent = collectiveWave.globalCoherence * 40;
    const participantComponent = Math.min(30, collectiveWave.participants.length * 3);
    const entanglementComponent = collectiveWave.collapseProbability * 30;

    return Math.min(100, coherenceComponent + participantComponent + entanglementComponent);
  };

  const calculatePhaseSynchrony = (collectiveWave: CollectiveWaveFunction | null): number => {
    if (!collectiveWave || collectiveWave.entanglements.length === 0) return 0;

    const avgCorrelation =
      collectiveWave.entanglements.reduce((sum, e) => sum + e.correlation, 0) /
      collectiveWave.entanglements.length;

    return avgCorrelation;
  };

  const calculateEmergenceIndex = (collectiveWave: CollectiveWaveFunction | null): number => {
    if (!collectiveWave) return 0;

    const frequencyNovelty = Math.abs(collectiveWave.emergentFrequency - 432) / 432;
    const entanglementNovelty = collectiveWave.entanglements.length / (collectiveWave.participants.length + 1);

    return (frequencyNovelty + entanglementNovelty) / 2;
  };

  const calculateCoherenceStability = (biometrics: Map<string, BiometricReading>): number => {
    if (biometrics.size === 0) return 0;

    const coherenceValues = Array.from(biometrics.values()).map((b) => b.coherenceScore);
    const mean = coherenceValues.reduce((sum, c) => sum + c, 0) / coherenceValues.length;
    const variance =
      coherenceValues.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / coherenceValues.length;

    return 1 - Math.min(1, variance);
  };

  const proposeIntention = useCallback(
    async (intentionText: string, category: string) => {
      if (!userId || !state.sessionId) return null;

      try {
        const { data, error } = await supabase
          .from('collective_intentions')
          .insert({
            session_id: state.sessionId,
            proposed_by: userId,
            intention_text: intentionText,
            category,
            is_active: true,
          })
          .select()
          .single();

        if (error) throw error;

        return data;
      } catch (error) {
        console.error('Failed to propose intention:', error);
        return null;
      }
    },
    [userId, state.sessionId]
  );

  const voteOnIntention = useCallback(
    async (intentionId: string) => {
      if (!userId) return false;

      const votePower = state.myBiometrics?.coherenceScore || 1.0;

      try {
        await supabase.from('intention_votes').insert({
          intention_id: intentionId,
          user_id: userId,
          vote_power: votePower,
        });

        return true;
      } catch (error) {
        console.error('Failed to vote on intention:', error);
        return false;
      }
    },
    [userId, state.myBiometrics]
  );

  const collapseToIntention = useCallback(
    (targetFrequency: number) => {
      if (quantumEngine.current) {
        quantumEngine.current.collapseWaveFunction(targetFrequency);

        setState((prev) => ({
          ...prev,
          emergentFrequency: targetFrequency,
        }));
      }
    },
    []
  );

  const forgetBiometricDevice = useCallback(() => {
    if (biometricMonitor.current) {
      biometricMonitor.current.forgetBluetoothDevice();
      setState((prev) => ({
        ...prev,
        biometricDeviceConnected: false,
      }));
    }
  }, []);

  return {
    state,
    initializeBiometricDevice,
    forgetBiometricDevice,
    startSession,
    stopSession,
    proposeIntention,
    voteOnIntention,
    collapseToIntention,
    quantumEngine: quantumEngine.current,
    aiOrchestrator: aiOrchestrator.current,
    biometricMonitor: biometricMonitor.current,
  };
};

export type UseCollectiveConsciousnessReturn = ReturnType<typeof useCollectiveConsciousness>;
