import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface SyncSession {
  id: string;
  user_id: string;
  circle_id?: string;
  frequency: number;
  intensity: number;
  wave_type: string;
  pulse_speed: number;
  geometry_mode: string;
  is_active: boolean;
  created_at: string;
}

export interface SyncState {
  activeSessions: SyncSession[];
  mySession: SyncSession | null;
  totalUsers: number;
  isConnected: boolean;
}

export const useSync = (circleId?: string, userId?: string) => {
  const [state, setState] = useState<SyncState>({
    activeSessions: [],
    mySession: null,
    totalUsers: 0,
    isConnected: false,
  });
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const fetchActiveSessions = useCallback(async () => {
    try {
      let query = supabase
        .from('gaa_sync_sessions')
        .select('*')
        .eq('is_active', true);

      if (circleId) {
        query = query.eq('circle_id', circleId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const sessions = data as SyncSession[];
      const mySession = userId ? sessions.find(s => s.user_id === userId) : null;

      setState(prev => ({
        ...prev,
        activeSessions: sessions,
        mySession: mySession || prev.mySession,
        totalUsers: sessions.length,
      }));
    } catch (error) {
      console.error('Error fetching active sessions:', error);
    }
  }, [circleId, userId]);

  const joinSync = useCallback(async (config: {
    frequency: number;
    intensity: number;
    wave_type: string;
    pulse_speed: number;
    geometry_mode: string;
  }) => {
    if (!userId) {
      console.warn('Cannot join sync: userId not provided');
      return null;
    }

    try {
      const { data: existingSession } = await supabase
        .from('gaa_sync_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (existingSession) {
        const { data, error } = await supabase
          .from('gaa_sync_sessions')
          .update({
            ...config,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingSession.id)
          .select()
          .single();

        if (error) throw error;

        setState(prev => ({ ...prev, mySession: data as SyncSession }));
        return data;
      }

      const { data, error } = await supabase
        .from('gaa_sync_sessions')
        .insert({
          user_id: userId,
          circle_id: circleId,
          ...config,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      setState(prev => ({ ...prev, mySession: data as SyncSession }));
      return data;
    } catch (error) {
      console.error('Error joining sync:', error);
      return null;
    }
  }, [userId, circleId]);

  const leaveSync = useCallback(async () => {
    if (!state.mySession) return;

    try {
      const { error } = await supabase
        .from('gaa_sync_sessions')
        .update({ is_active: false })
        .eq('id', state.mySession.id);

      if (error) throw error;

      setState(prev => ({ ...prev, mySession: null }));
    } catch (error) {
      console.error('Error leaving sync:', error);
    }
  }, [state.mySession]);

  const updateSyncState = useCallback(async (config: {
    frequency?: number;
    intensity?: number;
    wave_type?: string;
    pulse_speed?: number;
    geometry_mode?: string;
  }) => {
    if (!state.mySession) return;

    try {
      const { data, error } = await supabase
        .from('gaa_sync_sessions')
        .update({
          ...config,
          updated_at: new Date().toISOString(),
        })
        .eq('id', state.mySession.id)
        .select()
        .single();

      if (error) throw error;

      setState(prev => ({ ...prev, mySession: data as SyncSession }));
    } catch (error) {
      console.error('Error updating sync state:', error);
    }
  }, [state.mySession]);

  useEffect(() => {
    fetchActiveSessions();

    const channelName = circleId ? `sync:circle:${circleId}` : 'sync:global';
    const realtimeChannel = supabase.channel(channelName);

    realtimeChannel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gaa_sync_sessions',
          filter: circleId ? `circle_id=eq.${circleId}` : undefined,
        },
        () => {
          fetchActiveSessions();
        }
      )
      .subscribe((status) => {
        setState(prev => ({ ...prev, isConnected: status === 'SUBSCRIBED' }));
      });

    setChannel(realtimeChannel);

    return () => {
      realtimeChannel.unsubscribe();
    };
  }, [circleId, fetchActiveSessions]);

  useEffect(() => {
    return () => {
      if (state.mySession?.is_active) {
        leaveSync();
      }
    };
  }, []);

  return {
    state,
    joinSync,
    leaveSync,
    updateSyncState,
    refresh: fetchActiveSessions,
  };
};
