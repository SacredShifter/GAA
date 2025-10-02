import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Waves, Activity } from 'lucide-react';

interface AudioCalibrationProps {
  getActualFrequencies: () => { left: number; right: number; beat: number };
  getSpectrumData: () => {
    frequencyData: Uint8Array;
    averageEnergy: number;
    peakFrequency: number;
    bassEnergy: number;
    midEnergy: number;
    trebleEnergy: number;
  };
  isPlaying: boolean;
  targetFrequency: number;
  targetBeat: number;
  theme?: 'dark' | 'light';
}

export const AudioCalibration: React.FC<AudioCalibrationProps> = ({
  getActualFrequencies,
  getSpectrumData,
  isPlaying,
  targetFrequency,
  targetBeat,
  theme = 'dark',
}) => {
  const [frequencies, setFrequencies] = useState({ left: 0, right: 0, beat: 0 });
  const [spectrum, setSpectrum] = useState({
    averageEnergy: 0,
    peakFrequency: 0,
    bassEnergy: 0,
    midEnergy: 0,
    trebleEnergy: 0,
  });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const freqs = getActualFrequencies();
      const spec = getSpectrumData();
      setFrequencies(freqs);
      setSpectrum({
        averageEnergy: spec.averageEnergy,
        peakFrequency: spec.peakFrequency,
        bassEnergy: spec.bassEnergy,
        midEnergy: spec.midEnergy,
        trebleEnergy: spec.trebleEnergy,
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, getActualFrequencies, getSpectrumData]);

  const bgColor = theme === 'dark' ? 'bg-slate-900/95' : 'bg-white/95';
  const textColor = theme === 'dark' ? 'text-slate-100' : 'text-slate-900';
  const secondaryText = theme === 'dark' ? 'text-slate-400' : 'text-slate-600';
  const borderColor = theme === 'dark' ? 'border-slate-700' : 'border-slate-300';
  const accentColor = 'text-cyan-400';

  const frequencyAccurate = Math.abs(frequencies.left - targetFrequency) < 0.5;
  const beatAccurate = Math.abs(frequencies.beat - targetBeat) < 0.5;

  if (!isPlaying) {
    return (
      <div className={`fixed bottom-6 left-6 ${bgColor} backdrop-blur-lg border ${borderColor} rounded-xl p-4 z-40 shadow-2xl`}>
        <div className="flex items-center gap-2">
          <VolumeX className={`w-5 h-5 ${secondaryText}`} />
          <span className={`text-sm ${secondaryText}`}>Audio Paused</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 left-6 ${bgColor} backdrop-blur-lg border ${borderColor} rounded-xl shadow-2xl z-40`}>
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors rounded-xl`}
      >
        <div className="flex items-center gap-3">
          <Volume2 className={`w-5 h-5 ${accentColor}`} />
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${textColor}`}>Audio Monitor</span>
              {frequencyAccurate && beatAccurate && (
                <span className="w-2 h-2 rounded-full bg-green-400"></span>
              )}
            </div>
            <div className={`text-xs ${secondaryText}`}>
              {frequencies.left.toFixed(2)} Hz / {frequencies.right.toFixed(2)} Hz
            </div>
          </div>
        </div>
        <Activity className={`w-4 h-4 ${secondaryText} transition-transform ${showDetails ? 'rotate-180' : ''}`} />
      </button>

      {showDetails && (
        <div className={`px-4 pb-4 space-y-3 border-t ${borderColor} pt-3`}>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs ${secondaryText}`}>Left Channel</span>
              <span className={`text-xs font-mono ${frequencyAccurate ? 'text-green-400' : accentColor}`}>
                {frequencies.left.toFixed(3)} Hz
              </span>
            </div>
            <div className={`text-xs ${secondaryText}`}>Target: {targetFrequency.toFixed(2)} Hz</div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs ${secondaryText}`}>Right Channel</span>
              <span className={`text-xs font-mono ${accentColor}`}>
                {frequencies.right.toFixed(3)} Hz
              </span>
            </div>
            <div className={`text-xs ${secondaryText}`}>Target: {(targetFrequency + targetBeat).toFixed(2)} Hz</div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs ${secondaryText}`}>Binaural Beat</span>
              <span className={`text-xs font-mono ${beatAccurate ? 'text-green-400' : 'text-purple-400'}`}>
                {frequencies.beat.toFixed(3)} Hz
              </span>
            </div>
            <div className={`text-xs ${secondaryText}`}>Target: {targetBeat.toFixed(2)} Hz</div>
          </div>

          <div className={`pt-3 border-t ${borderColor} space-y-2`}>
            <div className="flex items-center gap-2">
              <Waves className={`w-4 h-4 ${secondaryText}`} />
              <span className={`text-xs font-medium ${textColor}`}>Spectrum Analysis</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className={`text-xs ${secondaryText} mb-1`}>Bass</div>
                <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-cyan-400 transition-all"
                    style={{ width: `${spectrum.bassEnergy * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className={`text-xs ${secondaryText} mb-1`}>Mid</div>
                <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-400 transition-all"
                    style={{ width: `${spectrum.midEnergy * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className={`text-xs ${secondaryText} mb-1`}>Treble</div>
                <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-500 to-orange-400 transition-all"
                    style={{ width: `${spectrum.trebleEnergy * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className={`text-xs ${secondaryText} mb-1`}>Avg Energy</div>
                <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-400 transition-all"
                    style={{ width: `${spectrum.averageEnergy * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className={`text-xs ${secondaryText} pt-2`}>
              Peak: {spectrum.peakFrequency.toFixed(1)} Hz
            </div>
          </div>

          <div className={`pt-3 border-t ${borderColor}`}>
            <div className="flex items-center gap-1">
              {frequencyAccurate && beatAccurate ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  <span className={`text-xs ${textColor}`}>Calibrated</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                  <span className={`text-xs ${textColor}`}>Stabilizing...</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
