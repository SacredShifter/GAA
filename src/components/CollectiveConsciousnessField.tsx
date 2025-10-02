import React, { useState } from 'react';
import { Play, Pause, Heart, Brain, Network, Sparkles, Users, TrendingUp } from 'lucide-react';
import { useCollectiveConsciousness } from '../hooks/useCollectiveConsciousness';
import { SpacetimeFieldVisualization } from './SpacetimeFieldVisualization';

export interface CollectiveConsciousnessFieldProps {
  userId?: string;
  sessionId?: string;
  theme?: 'dark' | 'light';
  showControls?: boolean;
}

export const CollectiveConsciousnessField: React.FC<CollectiveConsciousnessFieldProps> = ({
  userId,
  sessionId,
  theme = 'dark',
  showControls = true,
}) => {
  const [deviceType, setDeviceType] = useState<'webcam' | 'bluetooth' | null>(null);
  const [intentionText, setIntentionText] = useState('');
  const [intentionCategory, setIntentionCategory] = useState<string>('exploration');
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [showBiometrics, setShowBiometrics] = useState(true);

  const cc = useCollectiveConsciousness({
    userId,
    sessionId,
    enableBiometrics: true,
    enableAI: true,
    enableQuantum: true,
    autoStart: false,
  });

  const handleInitializeBiometrics = async (type: 'webcam' | 'bluetooth') => {
    const success = await cc.initializeBiometricDevice(type);
    if (success) {
      setDeviceType(type);
    } else {
      alert(`Failed to initialize ${type} device. Please check permissions and try again.`);
    }
  };

  const handleProposeIntention = async () => {
    if (!intentionText.trim()) return;

    const intention = await cc.proposeIntention(intentionText, intentionCategory);
    if (intention) {
      setIntentionText('');
      alert('Intention proposed! Others can now vote on it.');
    }
  };

  const getCoherenceColor = (coherence: number): string => {
    if (coherence > 0.8) return 'text-green-400';
    if (coherence > 0.6) return 'text-blue-400';
    if (coherence > 0.4) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getFieldStrengthColor = (strength: number): string => {
    if (strength > 80) return 'bg-green-500';
    if (strength > 60) return 'bg-blue-500';
    if (strength > 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div
      className="w-full h-screen relative overflow-hidden"
      style={{ backgroundColor: theme === 'dark' ? '#0a0a0f' : '#f5f5f5' }}
    >
      <div className="absolute inset-0">
        <SpacetimeFieldVisualization
          collectiveWave={cc.state.collectiveWaveFunction}
          biometrics={new Map()}
          showPast={true}
          showFuture={true}
          theme={theme}
        />
      </div>

      {showControls && (
        <>
          <div className="absolute top-6 left-6 z-10 space-y-4">
            <div
              className={`${theme === 'dark' ? 'bg-gray-900 bg-opacity-90' : 'bg-white bg-opacity-90'} backdrop-blur-sm rounded-2xl p-6 shadow-2xl border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <Network className="w-6 h-6 text-blue-400" />
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Collective Consciousness Field
                </h2>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    Status:
                  </span>
                  <span
                    className={`font-semibold ${cc.state.isActive ? 'text-green-400' : 'text-gray-400'}`}
                  >
                    {cc.state.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    <Users className="inline w-4 h-4 mr-1" />
                    Participants:
                  </span>
                  <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {cc.state.participantCount}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    Global Coherence:
                  </span>
                  <span className={`font-bold ${getCoherenceColor(cc.state.globalCoherence)}`}>
                    {(cc.state.globalCoherence * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                      Field Strength:
                    </span>
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                      {cc.state.fieldStrength.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`${getFieldStrengthColor(cc.state.fieldStrength)} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${cc.state.fieldStrength}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    Emergent Frequency:
                  </span>
                  <span className={`font-mono ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>
                    {cc.state.emergentFrequency.toFixed(1)} Hz
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    Quantum Entanglement:
                  </span>
                  <span className={`font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                    {(cc.state.quantumEntanglementMetric * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700 space-y-2">
                {!cc.state.isActive ? (
                  <>
                    {!cc.state.biometricDeviceConnected ? (
                      <div className="space-y-2">
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Initialize biometric monitoring:
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleInitializeBiometrics('webcam')}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2"
                          >
                            <Heart className="w-4 h-4" />
                            Webcam PPG
                          </button>
                          <button
                            onClick={() => handleInitializeBiometrics('bluetooth')}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2"
                          >
                            <Brain className="w-4 h-4" />
                            Bluetooth
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={cc.startSession}
                        className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold"
                      >
                        <Play className="w-5 h-5" />
                        Start Session
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={cc.stopSession}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold"
                  >
                    <Pause className="w-5 h-5" />
                    Stop Session
                  </button>
                )}
              </div>
            </div>

            {showBiometrics && cc.state.myBiometrics && (
              <div
                className={`${theme === 'dark' ? 'bg-gray-900 bg-opacity-90' : 'bg-white bg-opacity-90'} backdrop-blur-sm rounded-2xl p-6 shadow-2xl border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="w-5 h-5 text-red-400" />
                  <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Your Biometrics
                  </h3>
                </div>

                <div className="space-y-2 text-sm">
                  {cc.state.myBiometrics.heartRate && (
                    <div className="flex items-center justify-between">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                        Heart Rate:
                      </span>
                      <span className={`font-bold ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                        {cc.state.myBiometrics.heartRate} BPM
                      </span>
                    </div>
                  )}

                  {cc.state.myBiometrics.hrvRMSSD && (
                    <div className="flex items-center justify-between">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                        HRV (RMSSD):
                      </span>
                      <span className={`font-mono ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                        {cc.state.myBiometrics.hrvRMSSD.toFixed(1)} ms
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                      Coherence:
                    </span>
                    <span
                      className={`font-bold ${getCoherenceColor(cc.state.myBiometrics.coherenceScore)}`}
                    >
                      {(cc.state.myBiometrics.coherenceScore * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                      Brainwave State:
                    </span>
                    <span className={`font-semibold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} uppercase text-xs`}>
                      {cc.state.myBiometrics.estimatedBrainwaveState}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                      Signal Quality:
                    </span>
                    <span className={`font-mono ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>
                      {(cc.state.myBiometrics.ppgQuality * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {showAIPanel && cc.state.aiInsights.length > 0 && (
            <div className="absolute top-6 right-6 z-10 w-96">
              <div
                className={`${theme === 'dark' ? 'bg-gray-900 bg-opacity-90' : 'bg-white bg-opacity-90'} backdrop-blur-sm rounded-2xl p-6 shadow-2xl border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    AI Insights
                  </h3>
                </div>

                <div className="space-y-3">
                  {cc.state.aiInsights.slice(0, 3).map((insight, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-xs font-semibold uppercase ${
                            insight.type === 'opportunity'
                              ? 'text-green-400'
                              : insight.type === 'warning'
                                ? 'text-yellow-400'
                                : insight.type === 'prediction'
                                  ? 'text-blue-400'
                                  : 'text-purple-400'
                          }`}
                        >
                          {insight.type}
                        </span>
                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {(insight.confidence * 100).toFixed(0)}% confidence
                        </span>
                      </div>

                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {insight.text}
                      </p>

                      {insight.suggestedFrequency && (
                        <button
                          onClick={() => cc.collapseToIntention(insight.suggestedFrequency!)}
                          className="mt-2 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                        >
                          Apply {insight.suggestedFrequency.toFixed(0)} Hz
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="absolute bottom-6 left-6 right-6 z-10">
            <div
              className={`${theme === 'dark' ? 'bg-gray-900 bg-opacity-90' : 'bg-white bg-opacity-90'} backdrop-blur-sm rounded-2xl p-6 shadow-2xl border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Propose Collective Intention
                </h3>
              </div>

              <div className="flex gap-3">
                <select
                  value={intentionCategory}
                  onChange={(e) => setIntentionCategory(e.target.value)}
                  className={`px-3 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`}
                >
                  <option value="healing">Healing</option>
                  <option value="growth">Growth</option>
                  <option value="manifestation">Manifestation</option>
                  <option value="exploration">Exploration</option>
                  <option value="connection">Connection</option>
                  <option value="wisdom">Wisdom</option>
                </select>

                <input
                  type="text"
                  value={intentionText}
                  onChange={(e) => setIntentionText(e.target.value)}
                  placeholder="Enter your intention..."
                  className={`flex-1 px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-gray-100 text-gray-900 placeholder-gray-400'}`}
                />

                <button
                  onClick={handleProposeIntention}
                  disabled={!cc.state.isActive || !intentionText.trim()}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  Propose
                </button>
              </div>

              <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Your intention will be shared with the collective for voting. Coherence level
                determines vote power.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
