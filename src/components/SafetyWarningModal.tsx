import React from 'react';
import { AlertTriangle, Volume2, Clock, Info } from 'lucide-react';
import type { SafetyWarning } from '../utils/safetyMonitor';

interface SafetyWarningModalProps {
  warnings: SafetyWarning[];
  onAcknowledge: () => void;
  theme?: 'dark' | 'light';
}

export const SafetyWarningModal: React.FC<SafetyWarningModalProps> = ({
  warnings,
  onAcknowledge,
  theme = 'dark',
}) => {
  if (warnings.length === 0) return null;

  const latestWarning = warnings[warnings.length - 1];

  const bgClass = theme === 'dark' ? 'bg-slate-900' : 'bg-white';
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const secondaryTextClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';

  const getIcon = () => {
    switch (latestWarning.type) {
      case 'volume':
        return <Volume2 className="w-6 h-6" />;
      case 'duration':
        return <Clock className="w-6 h-6" />;
      case 'binaural':
      case 'age':
        return <AlertTriangle className="w-6 h-6" />;
      default:
        return <Info className="w-6 h-6" />;
    }
  };

  const getColor = () => {
    switch (latestWarning.severity) {
      case 'critical':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      case 'info':
        return 'text-blue-400';
    }
  };

  const getBorderColor = () => {
    switch (latestWarning.severity) {
      case 'critical':
        return 'border-red-500/50';
      case 'warning':
        return 'border-yellow-500/50';
      case 'info':
        return 'border-blue-500/50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`${bgClass} rounded-xl border ${getBorderColor()} shadow-2xl max-w-md w-full p-6`}
      >
        <div className="flex items-start gap-4 mb-4">
          <div className={`flex-shrink-0 ${getColor()}`}>{getIcon()}</div>
          <div className="flex-1">
            <h3 className={`text-lg font-bold ${textClass} mb-2`}>
              {latestWarning.severity === 'critical'
                ? 'Safety Alert'
                : latestWarning.severity === 'warning'
                ? 'Warning'
                : 'Information'}
            </h3>
            <p className={`text-sm ${secondaryTextClass}`}>
              {latestWarning.message}
            </p>
          </div>
        </div>

        {latestWarning.type === 'volume' && (
          <div
            className={`mt-4 p-3 rounded-lg ${
              theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'
            }`}
          >
            <p className={`text-xs ${secondaryTextClass}`}>
              <strong>Hearing Safety Tips:</strong>
              <br />• Keep volume at a comfortable level
              <br />• Take regular breaks every 30 minutes
              <br />• Stop if you experience any discomfort
            </p>
          </div>
        )}

        {latestWarning.type === 'duration' && (
          <div
            className={`mt-4 p-3 rounded-lg ${
              theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'
            }`}
          >
            <p className={`text-xs ${secondaryTextClass}`}>
              Extended listening can cause ear fatigue. Take a 5-10 minute break
              to give your ears a rest.
            </p>
          </div>
        )}

        {latestWarning.type === 'age' && (
          <div
            className={`mt-4 p-3 rounded-lg ${
              theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'
            }`}
          >
            <p className={`text-xs ${secondaryTextClass}`}>
              Binaural beats can affect brain activity and are not recommended
              for users under 16 without parental guidance. Single tone and
              harmonic modes are still available.
            </p>
          </div>
        )}

        <button
          onClick={onAcknowledge}
          className={`w-full mt-6 px-4 py-2 rounded-lg font-semibold transition-colors ${
            latestWarning.severity === 'critical'
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : latestWarning.severity === 'warning'
              ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          I Understand
        </button>
      </div>
    </div>
  );
};
