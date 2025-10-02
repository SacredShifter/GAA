import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { ClockSyncManager } from '../utils/clockSync';
import { PrecisionAudioEngine } from '../utils/precisionAudioEngine';
import { TempoGrid, createBarMarkMessage, type SyncConfig, type BarMark } from '../utils/syncProtocol';
import { getGeometricPackByShape } from '../utils/geometricFrequencies';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface PrecisionSyncState {
  isCalibrating: boolean;
  isReady: boolean;
  isPlaying: boolean;
  offsetMs: number;
  rttMs: number;
  syncQuality: 'good' | 'fair' | 'poor';
  driftMs: number;
  sessionId: string | null;
  participantCount: number;
  timeUntilStart: number | null;
}

export interface UsePrecisionSyncOptions {
  userId?: string;
  circleId?: string;
}

export const usePrecisionSync = (options: UsePrecisionSyncOptions = {}) => {
  const { userId, circleId } = options;

  const [state, setState] = useState<PrecisionSyncState>({
    isCalibrating: false,
    isReady: false,
    isPlaying: false,
    offsetMs: 0,
    rttMs: 0,
    syncQuality: 'good',
    driftMs: 0,
    sessionId: null,
    participantCount: 0,
    timeUntilStart: null,
  });

  const clockSyncRef = useRef<ClockSyncManager | null>(null);
  const audioEngineRef = useRef<PrecisionAudioEngine | null>(null);
  const tempoGridRef = useRef<TempoGrid | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const driftCheckIntervalRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  const initializeClockSync = useCallback(async () => {
    setState(prev => ({ ...prev, isCalibrating: true }));

    try {
      const clockSync = new ClockSyncManager();
      await clockSync.initialize();
      clockSyncRef.current = clockSync;

      clockSync.startAutoRecalibration();

      setState(prev => ({
        ...prev,
        isCalibrating: false,
        isReady: true,
        offsetMs: clockSync.getOffset(),
        rttMs: clockSync.getRTT(),
        syncQuality: clockSync.getQuality(),
      }));
    } catch (error) {
      console.error('Clock sync failed:', error);
      setState(prev => ({
        ...prev,
        isCalibrating: false,
        isReady: false,
      }));
    }
  }, []);

  const createSession = useCallback(
    async (config: {
      f0: number;
      waveform: 'sine' | 'triangle' | 'square' | 'sawtooth';
      geometricPack?: string;
      binauralHz?: number;
      bpm?: number;
      beatsPerBar?: number;
    }): Promise<string | null> => {
      if (!userId || !clockSyncRef.current) return null;

      const clockSync = clockSyncRef.current;
      const serverNow = clockSync.getServerTime();

      const bpm = config.bpm || 60;
      const beatsPerBar = config.beatsPerBar || 8;
      const bar0EpochMs = serverNow;

      const pack = config.geometricPack
        ? getGeometricPackByShape(config.geometricPack)
        : getGeometricPackByShape('octave');

      try {
        const { data, error } = await supabase
          .from('gaa_sync_sessions')
          .insert({
            user_id: userId,
            circle_id: circleId,
            frequency: config.f0,
            intensity: 0.5,
            wave_type: config.waveform,
            pulse_speed: 1,
            geometry_mode: 'waves',
            is_active: true,
            bpm,
            beats_per_bar: beatsPerBar,
            f0: config.f0,
            ratios: pack.ratios,
            bar0_epoch_ms: bar0EpochMs,
            binaural_hz: config.binauralHz,
            waveform: config.waveform,
            geometric_pack: config.geometricPack || 'octave',
          })
          .select()
          .single();

        if (error) throw error;

        setState(prev => ({ ...prev, sessionId: data.id }));

        return data.id;
      } catch (error) {
        console.error('Failed to create session:', error);
        return null;
      }
    },
    [userId, circleId]
  );

  const joinSession = useCallback(
    async (sessionId: string): Promise<void> => {
      if (!clockSyncRef.current) {
        throw new Error('Clock sync not initialized');
      }

      try {
        const { data: session, error } = await supabase
          .from('gaa_sync_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (error) throw error;

        const syncConfig: SyncConfig = {
          sessionId: session.id,
          bar0EpochMs: session.bar0_epoch_ms,
          bpm: session.bpm,
          beatsPerBar: session.beats_per_bar,
          f0: session.f0,
          ratios: session.ratios,
          binauralHz: session.binaural_hz,
          waveform: session.waveform,
          geometricPack: session.geometric_pack,
        };

        tempoGridRef.current = new TempoGrid(
          syncConfig.bpm,
          syncConfig.beatsPerBar,
          syncConfig.bar0EpochMs
        );

        const audioEngine = new PrecisionAudioEngine();
        await audioEngine.initialize();
        audioEngineRef.current = audioEngine;

        const pack = getGeometricPackByShape(session.geometric_pack || 'octave');

        await audioEngine.scheduleStart({
          syncConfig,
          clockSync: clockSyncRef.current,
          geometricPack: pack,
        });

        setState(prev => ({
          ...prev,
          sessionId,
          isPlaying: true,
        }));

        const serverNow = clockSyncRef.current.getServerTime();
        const timeUntilStart = tempoGridRef.current.getTimeUntilNextBar(serverNow);

        setState(prev => ({ ...prev, timeUntilStart }));

        countdownIntervalRef.current = window.setInterval(() => {
          if (!tempoGridRef.current || !clockSyncRef.current) return;

          const now = clockSyncRef.current.getServerTime();
          const remaining = tempoGridRef.current.getTimeUntilNextBar(now);

          if (remaining <= 0) {
            setState(prev => ({ ...prev, timeUntilStart: null }));
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
              countdownIntervalRef.current = null;
            }
          } else {
            setState(prev => ({ ...prev, timeUntilStart: remaining }));
          }
        }, 50);

        startDriftMonitoring();

        subscribeToSession(sessionId);
      } catch (error) {
        console.error('Failed to join session:', error);
        throw error;
      }
    },
    []
  );

  const startDriftMonitoring = useCallback(() => {
    if (driftCheckIntervalRef.current) {
      clearInterval(driftCheckIntervalRef.current);
    }

    driftCheckIntervalRef.current = window.setInterval(() => {
      if (
        !tempoGridRef.current ||
        !clockSyncRef.current ||
        !audioEngineRef.current
      )
        return;

      const serverNow = clockSyncRef.current.getServerTime();
      const currentBar = tempoGridRef.current.getBarIndexAtTime(serverNow);
      const barStartMs = tempoGridRef.current.getBarStartTime(currentBar);
      const driftMs = serverNow - barStartMs;

      setState(prev => ({ ...prev, driftMs: Math.abs(driftMs) }));

      if (Math.abs(driftMs) > 2) {
        audioEngineRef.current.applyDriftCorrection(driftMs);
      }

      logDiagnostics(driftMs);
    }, tempoGridRef.current.getBarLengthMs());
  }, []);

  const logDiagnostics = useCallback(
    async (driftMs: number) => {
      if (!userId || !state.sessionId || !clockSyncRef.current) return;

      const quality =
        Math.abs(driftMs) < 2
          ? 'good'
          : Math.abs(driftMs) < 6
          ? 'fair'
          : 'poor';

      try {
        await supabase.from('gaa_resonance_log').insert({
          user_id: userId,
          session_id: state.sessionId,
          frequency: 0,
          intensity: 0,
          client_offset_ms: clockSyncRef.current.getOffset(),
          rtt_ms: clockSyncRef.current.getRTT(),
          bar_drift_ms: Math.round(driftMs),
          sync_quality: quality,
          last_heartbeat_at: new Date().toISOString(),
        });
      } catch (error) {
        console.warn('Failed to log diagnostics:', error);
      }
    },
    [userId, state.sessionId]
  );

  const subscribeToSession = useCallback((sessionId: string) => {
    const channel = supabase.channel(`gaa_session_${sessionId}`);

    channel
      .on('broadcast', { event: 'BAR_MARK' }, (payload) => {
        const barMark = payload.payload as BarMark;
        handleBarMark(barMark);
      })
      .subscribe();

    channelRef.current = channel;
  }, []);

  const handleBarMark = useCallback((barMark: BarMark) => {
    if (!clockSyncRef.current || !audioEngineRef.current) return;

    const serverNow = clockSyncRef.current.getServerTime();
    const driftMs = serverNow - barMark.barEpochMs;

    if (Math.abs(driftMs) > 10) {
      audioEngineRef.current.applyDriftCorrection(driftMs);
    }
  }, []);

  const stop = useCallback(async () => {
    if (audioEngineRef.current) {
      audioEngineRef.current.stop();
      await audioEngineRef.current.destroy();
      audioEngineRef.current = null;
    }

    if (driftCheckIntervalRef.current) {
      clearInterval(driftCheckIntervalRef.current);
      driftCheckIntervalRef.current = null;
    }

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    if (channelRef.current) {
      await channelRef.current.unsubscribe();
      channelRef.current = null;
    }

    if (state.sessionId && userId) {
      await supabase
        .from('gaa_sync_sessions')
        .update({ is_active: false })
        .eq('id', state.sessionId);
    }

    setState(prev => ({
      ...prev,
      isPlaying: false,
      sessionId: null,
      timeUntilStart: null,
    }));
  }, [state.sessionId, userId]);

  useEffect(() => {
    return () => {
      if (clockSyncRef.current) {
        clockSyncRef.current.stopAutoRecalibration();
      }
      stop();
    };
  }, [stop]);

  return {
    state,
    initializeClockSync,
    createSession,
    joinSession,
    stop,
  };
};
