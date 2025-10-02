import React, { useState } from 'react';
import {
  Play,
  Pause,
  Settings,
  Save,
  Users,
  HelpCircle,
  Camera,
  Waves,
  Grid3x3,
  Hexagon,
  Sparkles,
  Shield,
  Eye,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
} from 'lucide-react';
import type { GAAState, GAAConfig } from '../hooks/useGAA';
import type { SyncState } from '../hooks/useSync';
import type { GeometryMode } from './EnhancedVisuals';

interface GAAControlsProps {
  state: GAAState;
  syncState?: SyncState;
  onStart: () => void;
  onStop: () => void;
  onUpdateConfig: (config: GAAConfig) => void;
  onSetPulseSpeed: (speed: number) => void;
  onSetGeometryMode: (mode: GeometryMode) => void;
  onSetEnableOrbitControls: (enabled: boolean) => void;
  onCollectiveSync: () => void;
  onOpenPresets: () => void;
  onOpenHelp: () => void;
  onOpenVision: () => void;
  theme: 'dark' | 'light';
}

const SACRED_FREQUENCIES = [
  { value: 396, label: '396 Hz - Liberation' },
  { value: 417, label: '417 Hz - Change' },
  { value: 432, label: '432 Hz - Harmony' },
  { value: 528, label: '528 Hz - Transformation' },
  { value: 639, label: '639 Hz - Connection' },
  { value: 741, label: '741 Hz - Expression' },
  { value: 852, label: '852 Hz - Intuition' },
];

const GEOMETRY_ICONS = {
  waves: Waves,
  lattice: Grid3x3,
  sacredGeometry: Hexagon,
  particles: Sparkles,
  dome: Shield,
};

export const GAAControls: React.FC<GAAControlsProps> = ({
  state,
  syncState,
  onStart,
  onStop,
  onUpdateConfig,
  onSetPulseSpeed,
  onSetGeometryMode,
  onSetEnableOrbitControls,
  onCollectiveSync,
  onOpenPresets,
  onOpenHelp,
  onOpenVision,
  theme,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customFreq, setCustomFreq] = useState(state.frequency.toString());
  const [isMinimized, setIsMinimized] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const bgClass = theme === 'dark'
    ? 'bg-slate-900/95 border-purple-500/30'
    : 'bg-white/95 border-gray-300';
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const secondaryTextClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const inputClass = theme === 'dark'
    ? 'bg-slate-800 border-slate-700 text-white'
    : 'bg-gray-100 border-gray-300 text-gray-900';

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed bottom-6 right-6 z-50 p-4 rounded-full bg-purple-600 hover:bg-purple-700 shadow-2xl"
      >
        {mobileOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Settings className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Desktop: Sidebar | Mobile: Full Screen Overlay */}
      <div
        className={`fixed right-0 top-0 h-full md:top-1/2 md:-translate-y-1/2 md:right-6 ${bgClass} backdrop-blur-lg rounded-none md:rounded-2xl border-l md:border shadow-2xl w-full md:w-96 max-h-full md:max-h-[90vh] overflow-y-auto z-40 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        } ${isMinimized && !mobileOpen ? 'md:w-16' : ''}`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-inherit z-10 border-b border-gray-700">
          <div className="flex items-center justify-between p-4 md:p-6">
            {!isMinimized && (
              <h2 className={`text-xl md:text-2xl font-bold ${textClass}`}>GAA Control</h2>
            )}
            <div className="flex gap-2 ml-auto">
              {!isMinimized && (
                <>
                  <button
                    onClick={() => {
                      onOpenVision();
                      setMobileOpen(false);
                    }}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    title="The Vision"
                  >
                    <Eye className={`w-5 h-5 text-cyan-400`} />
                  </button>
                  <button
                    onClick={() => {
                      onOpenHelp();
                      setMobileOpen(false);
                    }}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    title="Help"
                  >
                    <HelpCircle className={`w-5 h-5 ${secondaryTextClass}`} />
                  </button>
                  <button
                    onClick={() => {
                      onOpenPresets();
                      setMobileOpen(false);
                    }}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    title="Presets"
                  >
                    <Save className={`w-5 h-5 ${secondaryTextClass}`} />
                  </button>
                </>
              )}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hidden md:block p-2 rounded-lg hover:bg-white/10 transition-colors"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? (
                  <ChevronUp className={`w-5 h-5 ${secondaryTextClass}`} />
                ) : (
                  <ChevronDown className={`w-5 h-5 ${secondaryTextClass}`} />
                )}
              </button>
            </div>
          </div>
        </div>

        {!isMinimized && (
          <div className="p-4 md:p-6">
            {/* Sync Status */}
            {syncState && syncState.isConnected && (
              <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <Users className="w-4 h-4" />
                  <span>{syncState.totalUsers} users syncing</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Frequency */}
              <div>
                <label className={`block text-sm font-medium ${secondaryTextClass} mb-2`}>
                  Frequency
                </label>
                <select
                  value={state.frequency}
                  onChange={(e) => onUpdateConfig({ frequency: Number(e.target.value) })}
                  className={`w-full px-3 py-2 rounded-lg border ${inputClass} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                >
                  {SACRED_FREQUENCIES.map((freq) => (
                    <option key={freq.value} value={freq.value}>
                      {freq.label}
                    </option>
                  ))}
                  <option value={state.frequency}>Custom: {state.frequency} Hz</option>
                </select>
                <div className="mt-2">
                  <input
                    type="number"
                    value={customFreq}
                    onChange={(e) => setCustomFreq(e.target.value)}
                    onBlur={(e) => {
                      const freq = Number(e.target.value);
                      if (freq >= 20 && freq <= 2000) {
                        onUpdateConfig({ frequency: freq });
                      }
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${inputClass} focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm`}
                    placeholder="Custom frequency (20-2000 Hz)"
                    min="20"
                    max="2000"
                  />
                </div>
              </div>

              {/* Audio Mode */}
              <div>
                <label className={`block text-sm font-medium ${secondaryTextClass} mb-2`}>
                  Audio Mode
                </label>
                <select
                  value={state.mode}
                  onChange={(e) => onUpdateConfig({ audioMode: e.target.value as any })}
                  className={`w-full px-3 py-2 rounded-lg border ${inputClass} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                >
                  <option value="single">Single Tone</option>
                  <option value="harmonic">Harmonic Stack</option>
                  <option value="sweep">Frequency Sweep</option>
                  <option value="binaural">Binaural Beat</option>
                </select>
              </div>

              {/* Wave Type */}
              <div>
                <label className={`block text-sm font-medium ${secondaryTextClass} mb-2`}>
                  Wave Type
                </label>
                <select
                  value={state.waveType}
                  onChange={(e) => onUpdateConfig({ waveType: e.target.value as any })}
                  className={`w-full px-3 py-2 rounded-lg border ${inputClass} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                >
                  <option value="sine">Sine</option>
                  <option value="triangle">Triangle</option>
                  <option value="square">Square</option>
                  <option value="sawtooth">Sawtooth</option>
                </select>
              </div>

              {/* Intensity */}
              <div>
                <label className={`flex items-center justify-between text-sm font-medium ${secondaryTextClass} mb-2`}>
                  <span>Intensity: {Math.round(state.intensity * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={state.intensity}
                  onChange={(e) => onUpdateConfig({ intensity: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Pulse Speed */}
              <div>
                <label className={`flex items-center justify-between text-sm font-medium ${secondaryTextClass} mb-2`}>
                  <span>Pulse Speed: {state.pulseSpeed.toFixed(1)}x</span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={state.pulseSpeed}
                  onChange={(e) => onSetPulseSpeed(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Geometry Mode */}
              <div>
                <label className={`block text-sm font-medium ${secondaryTextClass} mb-2`}>
                  Geometry Mode
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {(Object.keys(GEOMETRY_ICONS) as GeometryMode[]).map((mode) => {
                    const Icon = GEOMETRY_ICONS[mode];
                    return (
                      <button
                        key={mode}
                        onClick={() => onSetGeometryMode(mode)}
                        className={`p-3 rounded-lg border transition-all ${
                          state.geometryMode === mode
                            ? 'bg-purple-500 border-purple-400 text-white'
                            : `${inputClass} hover:bg-white/10`
                        }`}
                        title={mode}
                      >
                        <Icon className="w-5 h-5 mx-auto" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Advanced Settings */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`w-full flex items-center justify-between px-4 py-2 rounded-lg ${inputClass} hover:bg-white/10 transition-colors`}
              >
                <span className={`text-sm font-medium ${secondaryTextClass}`}>Advanced Settings</span>
                {showAdvanced ? (
                  <ChevronUp className={`w-4 h-4 ${secondaryTextClass}`} />
                ) : (
                  <ChevronDown className={`w-4 h-4 ${secondaryTextClass}`} />
                )}
              </button>

              {showAdvanced && (
                <div className="space-y-3 p-4 bg-black/20 rounded-lg">
                  {state.mode === 'harmonic' && (
                    <div>
                      <label className={`block text-sm ${secondaryTextClass} mb-1`}>
                        Harmonics: {state.harmonicCount}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={state.harmonicCount}
                        onChange={(e) => onUpdateConfig({ harmonicCount: Number(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  )}

                  {state.mode === 'sweep' && (
                    <>
                      <div>
                        <label className={`block text-sm ${secondaryTextClass} mb-1`}>
                          Sweep Start: {state.sweepStart} Hz
                        </label>
                        <input
                          type="number"
                          value={state.sweepStart}
                          onChange={(e) => onUpdateConfig({ sweepStart: Number(e.target.value) })}
                          className={`w-full px-2 py-1 rounded ${inputClass}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm ${secondaryTextClass} mb-1`}>
                          Sweep End: {state.sweepEnd} Hz
                        </label>
                        <input
                          type="number"
                          value={state.sweepEnd}
                          onChange={(e) => onUpdateConfig({ sweepEnd: Number(e.target.value) })}
                          className={`w-full px-2 py-1 rounded ${inputClass}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm ${secondaryTextClass} mb-1`}>
                          Duration: {state.sweepDuration}s
                        </label>
                        <input
                          type="range"
                          min="5"
                          max="60"
                          value={state.sweepDuration}
                          onChange={(e) => onUpdateConfig({ sweepDuration: Number(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                    </>
                  )}

                  {state.mode === 'binaural' && (
                    <div>
                      <label className={`block text-sm ${secondaryTextClass} mb-1`}>
                        Binaural Beat: {state.binauralBeat} Hz
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="40"
                        value={state.binauralBeat}
                        onChange={(e) => onUpdateConfig({ binauralBeat: Number(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  )}

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={state.enableOrbitControls}
                      onChange={(e) => onSetEnableOrbitControls(e.target.checked)}
                      className="rounded"
                    />
                    <span className={`text-sm ${secondaryTextClass} flex items-center gap-1`}>
                      <Camera className="w-4 h-4" />
                      Orbit Controls
                    </span>
                  </label>
                </div>
              )}

              {/* Control Buttons */}
              <div className="flex gap-3 pt-4">
                {!state.isPlaying ? (
                  <button
                    onClick={() => {
                      onStart();
                      setMobileOpen(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    Start Sync
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onStop();
                      setMobileOpen(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    <Pause className="w-5 h-5" />
                    Stop Sync
                  </button>
                )}
              </div>

              <button
                onClick={() => {
                  onCollectiveSync();
                  setMobileOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors"
              >
                <Users className="w-5 h-5" />
                Collective Sync
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
