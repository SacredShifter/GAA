import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { WaveType, AudioMode } from './useEnhancedAudio';
import type { GeometryMode } from '../components/EnhancedVisuals';

export interface Preset {
  id?: string;
  user_id?: string;
  name: string;
  description?: string;
  frequency: number;
  intensity: number;
  wave_type: WaveType;
  pulse_speed: number;
  geometry_mode: GeometryMode;
  audio_mode?: AudioMode;
  harmonic_count?: number;
  sweep_start?: number;
  sweep_end?: number;
  sweep_duration?: number;
  binaural_beat?: number;
  is_public?: boolean;
  created_at?: string;
}

const DEFAULT_PRESETS: Preset[] = [
  {
    name: 'Deep Calm',
    description: 'Slow 432Hz sine waves for deep meditation',
    frequency: 432,
    intensity: 0.4,
    wave_type: 'sine',
    pulse_speed: 0.5,
    geometry_mode: 'waves',
    audio_mode: 'single',
  },
  {
    name: 'Sacred Flow',
    description: '528Hz with sacred geometry for transformation',
    frequency: 528,
    intensity: 0.6,
    wave_type: 'sine',
    pulse_speed: 1,
    geometry_mode: 'sacredGeometry',
    audio_mode: 'single',
  },
  {
    name: 'Harmonic Resonance',
    description: 'Stacked harmonics for deep immersion',
    frequency: 432,
    intensity: 0.5,
    wave_type: 'sine',
    pulse_speed: 1,
    geometry_mode: 'dome',
    audio_mode: 'harmonic',
    harmonic_count: 5,
  },
  {
    name: 'Frequency Sweep',
    description: 'Journey through all sacred frequencies',
    frequency: 432,
    intensity: 0.5,
    wave_type: 'sine',
    pulse_speed: 1.5,
    geometry_mode: 'lattice',
    audio_mode: 'sweep',
    sweep_start: 396,
    sweep_end: 852,
    sweep_duration: 30,
  },
  {
    name: 'Binaural Deep Focus',
    description: '10Hz binaural beat for alpha state',
    frequency: 432,
    intensity: 0.5,
    wave_type: 'sine',
    pulse_speed: 0.8,
    geometry_mode: 'particles',
    audio_mode: 'binaural',
    binaural_beat: 10,
  },
  {
    name: 'Energy Burst',
    description: 'High intensity particles for activation',
    frequency: 741,
    intensity: 0.8,
    wave_type: 'square',
    pulse_speed: 2.5,
    geometry_mode: 'particles',
    audio_mode: 'single',
  },
];

export const usePresets = (userId?: string) => {
  const [presets, setPresets] = useState<Preset[]>(DEFAULT_PRESETS);
  const [userPresets, setUserPresets] = useState<Preset[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserPresets = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('gaa_presets')
        .select('*')
        .or(`user_id.eq.${userId},is_public.eq.true`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const dbPresets = (data || []).map(p => ({
        id: p.id,
        user_id: p.user_id,
        name: p.name,
        description: p.description,
        frequency: p.frequency,
        intensity: p.intensity,
        wave_type: p.wave_type as WaveType,
        pulse_speed: p.pulse_speed,
        geometry_mode: p.geometry_mode as GeometryMode,
        is_public: p.is_public,
        created_at: p.created_at,
      }));

      setUserPresets(dbPresets);
      setPresets([...DEFAULT_PRESETS, ...dbPresets]);
    } catch (error) {
      console.error('Error fetching presets:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const savePreset = useCallback(async (preset: Preset) => {
    if (!userId) {
      const localPresets = JSON.parse(localStorage.getItem('gaa_presets') || '[]');
      localPresets.push({ ...preset, id: crypto.randomUUID() });
      localStorage.setItem('gaa_presets', JSON.stringify(localPresets));
      setUserPresets(localPresets);
      setPresets([...DEFAULT_PRESETS, ...localPresets]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('gaa_presets')
        .insert({
          user_id: userId,
          name: preset.name,
          description: preset.description,
          frequency: preset.frequency,
          intensity: preset.intensity,
          wave_type: preset.wave_type,
          pulse_speed: preset.pulse_speed,
          geometry_mode: preset.geometry_mode,
          is_public: preset.is_public || false,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchUserPresets();
    } catch (error) {
      console.error('Error saving preset:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, fetchUserPresets]);

  const deletePreset = useCallback(async (presetId: string) => {
    if (!userId) {
      const localPresets = JSON.parse(localStorage.getItem('gaa_presets') || '[]');
      const filtered = localPresets.filter((p: Preset) => p.id !== presetId);
      localStorage.setItem('gaa_presets', JSON.stringify(filtered));
      setUserPresets(filtered);
      setPresets([...DEFAULT_PRESETS, ...filtered]);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('gaa_presets')
        .delete()
        .eq('id', presetId);

      if (error) throw error;

      await fetchUserPresets();
    } catch (error) {
      console.error('Error deleting preset:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, fetchUserPresets]);

  useEffect(() => {
    if (userId) {
      fetchUserPresets();
    } else {
      const localPresets = JSON.parse(localStorage.getItem('gaa_presets') || '[]');
      setUserPresets(localPresets);
      setPresets([...DEFAULT_PRESETS, ...localPresets]);
    }
  }, [userId, fetchUserPresets]);

  return {
    presets,
    userPresets,
    isLoading,
    savePreset,
    deletePreset,
    refresh: fetchUserPresets,
  };
};
