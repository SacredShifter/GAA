import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface SessionAnalytics {
  id: string;
  user_id: string;
  date: string;
  total_sessions: number;
  total_duration_seconds: number;
  avg_frequency: number;
  min_frequency: number;
  max_frequency: number;
  avg_intensity: number;
  dominant_wave_type: string | null;
  dominant_geometry_mode: string | null;
}

export interface FrequencyDistribution {
  frequency_range: string;
  hour_of_day: number;
  day_of_week: number;
  usage_count: number;
  avg_duration_seconds: number;
}

export interface GlobalMetrics {
  total_active_users: number;
  avg_global_frequency: number;
  avg_global_intensity: number;
  total_active_sessions: number;
  dominant_wave_type: string;
  dominant_geometry_mode: string;
  metric_date: string;
}

export interface UserAnalyticsSummary {
  user_id: string;
  total_sessions: number;
  total_duration_seconds: number;
  avg_frequency: number;
  min_frequency: number;
  max_frequency: number;
  avg_intensity: number;
  avg_spectrum_energy: number;
  last_session_at: string;
  session_date: string;
}

export interface AnalyticsState {
  sessionAnalytics: SessionAnalytics[];
  frequencyDistribution: FrequencyDistribution[];
  globalMetrics: GlobalMetrics[];
  userSummary: UserAnalyticsSummary[];
  isLoading: boolean;
  error: string | null;
}

export const useAnalytics = (userId?: string, dateRange: { start: Date; end: Date } = {
  start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  end: new Date(),
}) => {
  const [state, setState] = useState<AnalyticsState>({
    sessionAnalytics: [],
    frequencyDistribution: [],
    globalMetrics: [],
    userSummary: [],
    isLoading: false,
    error: null,
  });

  const fetchSessionAnalytics = useCallback(async () => {
    if (!userId) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const { data, error } = await supabase
        .from('gaa_session_analytics')
        .select('*')
        .eq('user_id', userId)
        .gte('date', dateRange.start.toISOString().split('T')[0])
        .lte('date', dateRange.end.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        sessionAnalytics: data as SessionAnalytics[],
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error fetching session analytics:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to fetch session analytics',
        isLoading: false,
      }));
    }
  }, [userId, dateRange.start, dateRange.end]);

  const fetchFrequencyDistribution = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('gaa_frequency_distribution')
        .select('*')
        .eq('user_id', userId)
        .order('usage_count', { ascending: false });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        frequencyDistribution: data as FrequencyDistribution[],
      }));
    } catch (error) {
      console.error('Error fetching frequency distribution:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to fetch frequency distribution',
      }));
    }
  }, [userId]);

  const fetchGlobalMetrics = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('gaa_global_metrics')
        .select('*')
        .gte('metric_date', dateRange.start.toISOString().split('T')[0])
        .lte('metric_date', dateRange.end.toISOString().split('T')[0])
        .order('metric_date', { ascending: false });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        globalMetrics: data as GlobalMetrics[],
      }));
    } catch (error) {
      console.error('Error fetching global metrics:', error);
    }
  }, [dateRange.start, dateRange.end]);

  const fetchUserSummary = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('gaa_user_analytics_summary')
        .select('*')
        .eq('user_id', userId)
        .gte('session_date', dateRange.start.toISOString())
        .lte('session_date', dateRange.end.toISOString())
        .order('session_date', { ascending: false });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        userSummary: data as UserAnalyticsSummary[],
      }));
    } catch (error) {
      console.error('Error fetching user summary:', error);
    }
  }, [userId, dateRange.start, dateRange.end]);

  const logResonanceSession = useCallback(async (sessionData: {
    session_id?: string;
    frequency: number;
    intensity: number;
    duration_seconds: number;
    avg_spectrum_energy: number;
  }) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('gaa_resonance_log')
        .insert({
          user_id: userId,
          session_id: sessionData.session_id,
          frequency: sessionData.frequency,
          intensity: sessionData.intensity,
          duration_seconds: sessionData.duration_seconds,
          avg_spectrum_energy: sessionData.avg_spectrum_energy,
        });

      if (error) throw error;

      await aggregateDailyAnalytics();
    } catch (error) {
      console.error('Error logging resonance session:', error);
    }
  }, [userId]);

  const aggregateDailyAnalytics = useCallback(async () => {
    if (!userId) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase.rpc('aggregate_session_analytics', {
        p_user_id: userId,
        p_date: today,
      });

      if (error) throw error;
      await fetchSessionAnalytics();
    } catch (error) {
      console.error('Error aggregating daily analytics:', error);
    }
  }, [userId, fetchSessionAnalytics]);

  const updateFrequencyDistribution = useCallback(async (data: {
    frequency: number;
    duration_seconds: number;
  }) => {
    if (!userId) return;

    try {
      const now = new Date();
      const hour_of_day = now.getHours();
      const day_of_week = now.getDay();

      let frequency_range: string;
      if (data.frequency < 100) frequency_range = '0-100Hz';
      else if (data.frequency < 300) frequency_range = '100-300Hz';
      else if (data.frequency < 500) frequency_range = '300-500Hz';
      else if (data.frequency < 800) frequency_range = '500-800Hz';
      else frequency_range = '800Hz+';

      const { data: existing } = await supabase
        .from('gaa_frequency_distribution')
        .select('*')
        .eq('user_id', userId)
        .eq('frequency_range', frequency_range)
        .eq('hour_of_day', hour_of_day)
        .eq('day_of_week', day_of_week)
        .maybeSingle();

      if (existing) {
        const newCount = existing.usage_count + 1;
        const newAvgDuration = Math.floor(
          (existing.avg_duration_seconds * existing.usage_count + data.duration_seconds) / newCount
        );

        await supabase
          .from('gaa_frequency_distribution')
          .update({
            usage_count: newCount,
            avg_duration_seconds: newAvgDuration,
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('gaa_frequency_distribution')
          .insert({
            user_id: userId,
            frequency_range,
            hour_of_day,
            day_of_week,
            usage_count: 1,
            avg_duration_seconds: data.duration_seconds,
          });
      }

      await fetchFrequencyDistribution();
    } catch (error) {
      console.error('Error updating frequency distribution:', error);
    }
  }, [userId, fetchFrequencyDistribution]);

  const getFrequencyHeatmapData = useCallback(() => {
    const heatmap: number[][] = Array(7).fill(0).map(() => Array(24).fill(0));

    state.frequencyDistribution.forEach(item => {
      if (item.day_of_week >= 0 && item.day_of_week < 7 &&
          item.hour_of_day >= 0 && item.hour_of_day < 24) {
        heatmap[item.day_of_week][item.hour_of_day] = item.usage_count;
      }
    });

    return heatmap;
  }, [state.frequencyDistribution]);

  const getSessionLengthStats = useCallback(() => {
    const durations = state.sessionAnalytics.map(s => s.total_duration_seconds);
    if (durations.length === 0) return { avg: 0, median: 0, total: 0 };

    const total = durations.reduce((sum, d) => sum + d, 0);
    const avg = total / durations.length;
    const sorted = [...durations].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];

    return { avg, median, total };
  }, [state.sessionAnalytics]);

  const getFrequencyStats = useCallback(() => {
    const frequencies = state.sessionAnalytics
      .map(s => s.avg_frequency)
      .filter(f => f != null);

    if (frequencies.length === 0) return { avg: 0, min: 0, max: 0, mostUsed: 0 };

    const avg = frequencies.reduce((sum, f) => sum + f, 0) / frequencies.length;
    const min = Math.min(...frequencies);
    const max = Math.max(...frequencies);

    const frequencyGroups = new Map<number, number>();
    frequencies.forEach(f => {
      const bucket = Math.floor(f / 50) * 50;
      frequencyGroups.set(bucket, (frequencyGroups.get(bucket) || 0) + 1);
    });

    const mostUsed = Array.from(frequencyGroups.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 0;

    return { avg, min, max, mostUsed };
  }, [state.sessionAnalytics]);

  useEffect(() => {
    if (userId) {
      fetchSessionAnalytics();
      fetchFrequencyDistribution();
      fetchUserSummary();
    }
    fetchGlobalMetrics();
  }, [userId, fetchSessionAnalytics, fetchFrequencyDistribution, fetchUserSummary, fetchGlobalMetrics]);

  const refresh = useCallback(async () => {
    if (userId) {
      await Promise.all([
        fetchSessionAnalytics(),
        fetchFrequencyDistribution(),
        fetchUserSummary(),
      ]);
    }
    await fetchGlobalMetrics();
  }, [userId, fetchSessionAnalytics, fetchFrequencyDistribution, fetchUserSummary, fetchGlobalMetrics]);

  return {
    state,
    logResonanceSession,
    updateFrequencyDistribution,
    aggregateDailyAnalytics,
    getFrequencyHeatmapData,
    getSessionLengthStats,
    getFrequencyStats,
    refresh,
  };
};
