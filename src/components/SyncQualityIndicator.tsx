import React from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

interface SyncQualityIndicatorProps {
  offsetMs: number;
  rttMs: number;
  driftMs: number;
  quality: 'good' | 'fair' | 'poor';
  isConnected: boolean;
  theme?: 'dark' | 'light';
}

export const SyncQualityIndicator: React.FC<SyncQualityIndicatorProps> = ({
  offsetMs,
  rttMs,
  driftMs,
  quality,
  isConnected,
  theme = 'dark',
}) => {
  const bgClass = theme === 'dark' ? 'bg-slate-900/90' : 'bg-white/90';
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const secondaryTextClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';

  const getQualityColor = () => {
    switch (quality) {
      case 'good':
        return 'text-green-400';
      case 'fair':
        return 'text-yellow-400';
      case 'poor':
        return 'text-red-400';
    }
  };

  const getQualityText = () => {
    switch (quality) {
      case 'good':
        return 'Excellent Sync';
      case 'fair':
        return 'Fair Sync';
      case 'poor':
        return 'Poor Sync';
    }
  };

  const getDriftQuality = () => {
    if (driftMs < 2) return { text: 'Locked', color: 'text-green-400' };
    if (driftMs < 6) return { text: 'Stable', color: 'text-yellow-400' };
    return { text: 'Drifting', color: 'text-red-400' };
  };

  const driftQuality = getDriftQuality();

  if (!isConnected) {
    return (
      <div
        className={`fixed bottom-6 left-6 ${bgClass} backdrop-blur-lg rounded-lg border border-red-500/30 p-3 flex items-center gap-2 shadow-lg`}
      >
        <WifiOff className="w-5 h-5 text-red-400" />
        <span className={`text-sm ${textClass}`}>Disconnected</span>
      </div>
    );
  }

  return (
    <div
      className={`fixed bottom-6 left-6 ${bgClass} backdrop-blur-lg rounded-lg border ${
        quality === 'good'
          ? 'border-green-500/30'
          : quality === 'fair'
          ? 'border-yellow-500/30'
          : 'border-red-500/30'
      } p-3 shadow-lg`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {quality === 'poor' ? (
            <AlertCircle className={`w-5 h-5 ${getQualityColor()}`} />
          ) : (
            <Wifi className={`w-5 h-5 ${getQualityColor()}`} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className={`text-sm font-semibold ${getQualityColor()} mb-1`}>
            {getQualityText()}
          </div>

          <div className={`text-xs ${secondaryTextClass} space-y-0.5`}>
            <div className="flex justify-between gap-4">
              <span>Network:</span>
              <span className={textClass}>{rttMs}ms RTT</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Clock:</span>
              <span className={textClass}>
                {offsetMs > 0 ? '+' : ''}
                {offsetMs}ms
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Phase:</span>
              <span className={driftQuality.color}>
                {driftQuality.text} (±{Math.abs(Math.round(driftMs))}ms)
              </span>
            </div>
          </div>

          {quality === 'poor' && (
            <div className="mt-2 text-xs text-red-400">
              Poor network conditions detected. Sync may be degraded.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
