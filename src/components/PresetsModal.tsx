import React, { useState } from 'react';
import { X, Save, Trash2, Play } from 'lucide-react';
import type { Preset } from '../hooks/usePresets';
import type { GAAState } from '../hooks/useGAA';

interface PresetsModalProps {
  open: boolean;
  onClose: () => void;
  presets: Preset[];
  isLoading: boolean;
  onLoadPreset: (preset: Preset) => void;
  onSavePreset: (preset: Preset) => void;
  onDeletePreset: (id: string) => void;
  currentState: GAAState;
  theme: 'dark' | 'light';
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  open,
  onClose,
  presets,
  isLoading,
  onLoadPreset,
  onSavePreset,
  onDeletePreset,
  currentState,
  theme,
}) => {
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');

  if (!open) return null;

  const bgClass = theme === 'dark' ? 'bg-slate-900' : 'bg-white';
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const secondaryTextClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const inputClass = theme === 'dark'
    ? 'bg-slate-800 border-slate-700 text-white'
    : 'bg-gray-100 border-gray-300 text-gray-900';

  const handleSave = () => {
    if (!presetName.trim()) return;

    onSavePreset({
      name: presetName,
      description: presetDescription,
      frequency: currentState.frequency,
      intensity: currentState.intensity,
      wave_type: currentState.waveType,
      pulse_speed: currentState.pulseSpeed,
      geometry_mode: currentState.geometryMode,
      audio_mode: currentState.mode,
      harmonic_count: currentState.harmonicCount,
      sweep_start: currentState.sweepStart,
      sweep_end: currentState.sweepEnd,
      sweep_duration: currentState.sweepDuration,
      binaural_beat: currentState.binauralBeat,
    });

    setPresetName('');
    setPresetDescription('');
    setShowSaveForm(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`relative ${bgClass} rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto`}>
        <div className="sticky top-0 bg-gradient-to-br from-purple-600 to-blue-600 p-6 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <h2 className="text-3xl font-bold text-white mb-2">Presets</h2>
          <p className="text-purple-100">Save and load your favorite configurations</p>
        </div>

        <div className="p-6 space-y-4">
          <button
            onClick={() => setShowSaveForm(!showSaveForm)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors"
          >
            <Save className="w-5 h-5" />
            Save Current Configuration
          </button>

          {showSaveForm && (
            <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Preset name"
                className={`w-full px-3 py-2 rounded-lg border ${inputClass} mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
              <textarea
                value={presetDescription}
                onChange={(e) => setPresetDescription(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className={`w-full px-3 py-2 rounded-lg border ${inputClass} mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={!presetName.trim()}
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowSaveForm(false);
                    setPresetName('');
                    setPresetDescription('');
                  }}
                  className={`px-4 py-2 ${inputClass} hover:bg-white/10 font-medium rounded-lg transition-colors`}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h3 className={`text-lg font-semibold ${textClass} mb-3`}>
              Available Presets
            </h3>

            {isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto" />
              </div>
            )}

            {presets.map((preset, index) => (
              <div
                key={preset.id || index}
                className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'} hover:border-purple-500 transition-colors`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className={`font-semibold ${textClass} mb-1`}>{preset.name}</h4>
                    {preset.description && (
                      <p className={`text-sm ${secondaryTextClass} mb-2`}>
                        {preset.description}
                      </p>
                    )}
                    <div className={`flex flex-wrap gap-2 text-xs ${secondaryTextClass}`}>
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                        {preset.frequency} Hz
                      </span>
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                        {preset.wave_type}
                      </span>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">
                        {preset.geometry_mode}
                      </span>
                      {preset.audio_mode && preset.audio_mode !== 'single' && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
                          {preset.audio_mode}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        onLoadPreset(preset);
                        onClose();
                      }}
                      className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                      title="Load preset"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    {preset.id && preset.user_id && (
                      <button
                        onClick={() => onDeletePreset(preset.id!)}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        title="Delete preset"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {presets.length === 0 && !isLoading && (
              <div className={`text-center py-8 ${secondaryTextClass}`}>
                No presets yet. Save your first configuration!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
