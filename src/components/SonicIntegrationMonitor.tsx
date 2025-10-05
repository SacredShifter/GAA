import React, { useEffect, useState } from 'react';
import { Activity, Radio, Users, TrendingUp, Zap } from 'lucide-react';
import { useSonicIntegration } from '../hooks/useSonicIntegration';

export interface SonicIntegrationMonitorProps {
  userId?: string;
  sessionId?: string;
  mode?: 'individual' | 'collective';
  theme?: 'dark' | 'light';
  compact?: boolean;
}

export const SonicIntegrationMonitor: React.FC<SonicIntegrationMonitorProps> = ({
  userId,
  sessionId,
  mode = 'individual',
  theme = 'dark',
  compact = false,
}) => {
  const { state, startListening, stopListening, fetchHistory } = useSonicIntegration({
    userId,
    sessionId,
    autoStart: true,
    mode,
  });

  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (userId && showHistory) {
      fetchHistory();
    }
  }, [userId, showHistory, fetchHistory]);

  const getCoherenceColor = (coherence: number): string => {
    if (coherence > 0.8) return theme === 'dark' ? 'text-green-400' : 'text-green-600';
    if (coherence > 0.6) return theme === 'dark' ? 'text-blue-400' : 'text-blue-600';
    if (coherence > 0.4) return theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600';
    return theme === 'dark' ? 'text-red-400' : 'text-red-600';
  };

  const getCoherenceLabel = (coherence: number): string => {
    if (coherence > 0.85) return 'Excellent';
    if (coherence > 0.7) return 'Good';
    if (coherence > 0.5) return 'Moderate';
    if (coherence > 0.3) return 'Low';
    return 'Very Low';
  };

  if (compact) {
    return (
      <div
        className={`${
          theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
        } rounded-lg p-3 shadow-lg border ${
          theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio
              className={`w-4 h-4 ${state.isConnected ? 'text-green-400 animate-pulse' : 'text-gray-500'}`}
            />
            <span className="text-xs font-medium">Sonic Bridge</span>
          </div>
          <div className={`text-sm font-bold ${getCoherenceColor(state.currentCoherence)}`}>
            {(state.currentCoherence * 100).toFixed(0)}%
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
      } rounded-xl p-6 shadow-2xl border ${
        theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-purple-400" />
          <h3 className="text-lg font-bold">Sonic Shifter Integration</h3>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              state.isConnected ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
            }`}
          />
          <span className="text-xs">
            {state.isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div
          className={`${
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
          } rounded-lg p-4`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-gray-400">Coherence Index</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${getCoherenceColor(state.currentCoherence)}`}>
              {(state.currentCoherence * 100).toFixed(1)}%
            </span>
            <span className={`text-sm ${getCoherenceColor(state.currentCoherence)}`}>
              {getCoherenceLabel(state.currentCoherence)}
            </span>
          </div>
          <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                state.currentCoherence > 0.8
                  ? 'bg-green-400'
                  : state.currentCoherence > 0.6
                  ? 'bg-blue-400'
                  : state.currentCoherence > 0.4
                  ? 'bg-yellow-400'
                  : 'bg-red-400'
              }`}
              style={{ width: `${state.currentCoherence * 100}%` }}
            />
          </div>
        </div>

        {state.lastFeedback && (
          <div
            className={`${
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
            } rounded-lg p-4`}
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-400">Feedback</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Gain Modulation:</span>
                <span className="font-mono">
                  {state.lastFeedback.gainModulation.toFixed(2)}x
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Phase Shift:</span>
                <span className="font-mono">
                  {(state.lastFeedback.phaseShift * (180 / Math.PI)).toFixed(1)}°
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {state.lastFeedback?.recommendation && (
        <div
          className={`${
            theme === 'dark' ? 'bg-blue-900/30 border-blue-500/30' : 'bg-blue-50 border-blue-200'
          } border rounded-lg p-4 mb-4`}
        >
          <p className="text-sm">{state.lastFeedback.recommendation}</p>
        </div>
      )}

      {mode === 'collective' && (
        <div
          className={`${
            theme === 'dark' ? 'bg-purple-900/30 border-purple-500/30' : 'bg-purple-50 border-purple-200'
          } border rounded-lg p-4 mb-4`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium">Collective Mode Active</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Synchronizing with group resonance field
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={state.isConnected ? stopListening : startListening}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            state.isConnected
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {state.isConnected ? 'Disconnect' : 'Connect'}
        </button>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            theme === 'dark'
              ? 'bg-gray-800 hover:bg-gray-700'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          {showHistory ? 'Hide' : 'Show'} History
        </button>
      </div>

      {showHistory && state.historicalData.length > 0 && (
        <div
          className={`mt-4 ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
          } rounded-lg p-4`}
        >
          <h4 className="text-sm font-medium mb-3">Recent Coherence History</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {state.historicalData.slice(0, 10).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-400">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 font-mono">
                    {entry.frequencyHz.toFixed(1)} Hz
                  </span>
                  <span
                    className={`font-bold ${getCoherenceColor(entry.coherenceIndex)}`}
                  >
                    {(entry.coherenceIndex * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
