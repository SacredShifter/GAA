import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGAA } from '../hooks/useGAA';

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn((callback) => {
        callback('SUBSCRIBED');
        return Promise.resolve();
      }),
      unsubscribe: vi.fn(),
    })),
  },
}));

describe('useGAA', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useGAA());

    expect(result.current.state).toBeDefined();
    expect(result.current.state.frequency).toBeGreaterThan(0);
    expect(result.current.state.intensity).toBeGreaterThanOrEqual(0);
    expect(result.current.state.isPlaying).toBe(false);
  });

  it('should update frequency', () => {
    const { result } = renderHook(() => useGAA());

    act(() => {
      result.current.updateConfig({ frequency: 528 });
    });

    expect(result.current.state.frequency).toBe(528);
  });

  it('should update intensity', () => {
    const { result } = renderHook(() => useGAA());

    act(() => {
      result.current.updateConfig({ intensity: 0.8 });
    });

    expect(result.current.state.intensity).toBe(0.8);
  });

  it('should update pulse speed', () => {
    const { result } = renderHook(() => useGAA());

    act(() => {
      result.current.setPulseSpeed(2);
    });

    expect(result.current.state.pulseSpeed).toBe(2);
  });

  it('should update geometry mode', () => {
    const { result } = renderHook(() => useGAA());

    act(() => {
      result.current.setGeometryMode('lattice');
    });

    expect(result.current.state.geometryMode).toBe('lattice');
  });

  it('should call onResonanceChange callback', () => {
    const onResonanceChange = vi.fn();
    const { result } = renderHook(() => useGAA({ onResonanceChange }));

    act(() => {
      result.current.updateConfig({ frequency: 432 });
    });

    expect(onResonanceChange).toHaveBeenCalled();
  });

  it('should initialize with custom config', () => {
    const initialConfig = {
      frequency: 639,
      intensity: 0.7,
      pulseSpeed: 1.5,
      geometryMode: 'sacredGeometry' as const,
    };

    const { result } = renderHook(() => useGAA({ initialConfig }));

    expect(result.current.state.frequency).toBe(639);
    expect(result.current.state.intensity).toBe(0.7);
    expect(result.current.state.pulseSpeed).toBe(1.5);
    expect(result.current.state.geometryMode).toBe('sacredGeometry');
  });
});
