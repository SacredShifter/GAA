import React, { useState } from 'react';
import { Play, Pause, Heart, Brain, Network, Sparkles, Users, TrendingUp, ChevronDown, ChevronUp, Menu, X, Calendar } from 'lucide-react';
import { useCollectiveConsciousness } from '../hooks/useCollectiveConsciousness';
import { SpacetimeFieldVisualization } from './SpacetimeFieldVisualization';
import { EventCalendar } from './EventCalendar';
import { CreateEventModal } from './CreateEventModal';
import { MobileDock } from './MobileDock';

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
  const [controlsExpanded, setControlsExpanded] = useState(false);
  const [biometricsExpanded, setBiometricsExpanded] = useState(false);
  const [aiExpanded, setAiExpanded] = useState(false);
  const [intentionExpanded, setIntentionExpanded] = useState(false);
  const [showEventCalendar, setShowEventCalendar] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [calendarKey, setCalendarKey] = useState(0);

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
    if (!intentionText.trim()) {
      alert('Please enter an intention text.');
      return;
    }

    if (!cc.state.isActive) {
      alert('Please start a session first.');
      return;
    }

    if (!userId) {
      alert('User ID is required to propose intentions.');
      return;
    }

    const intention = await cc.proposeIntention(intentionText, intentionCategory);
    if (intention) {
      setIntentionText('');
      alert('Intention proposed! Others can now vote on it.');
    } else {
      alert('Failed to propose intention. Please check your connection and try again.');
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
          {/* Logo - Top Left */}
          <div className="fixed top-4 left-4 z-50">
            <img
              src="https://mikltjgbvxrxndtszorb.supabase.co/storage/v1/object/public/sacred-assets/uploads/Logo-MainSacredShifter-removebg-preview.png"
              alt="Sacred Shifter"
              className="h-12 md:h-16 w-auto invert opacity-90 hover:opacity-100 transition-opacity"
            />
          </div>

          {/* Desktop: Top Right Calendar Button */}
          <div className="hidden md:flex fixed top-4 right-4 z-50 gap-2">
            <button
              onClick={() => setShowEventCalendar(!showEventCalendar)}
              className={`p-3 rounded-full ${showEventCalendar ? 'bg-blue-600' : 'bg-gray-900'} bg-opacity-90 backdrop-blur-sm border ${showEventCalendar ? 'border-blue-500' : 'border-gray-800'} shadow-2xl hover:scale-105 transition-transform`}
              title="Event Calendar"
            >
              <Calendar className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Desktop: Left Panel - Status & Biometrics */}
          <div className="hidden md:block absolute top-6 left-6 z-40 max-w-sm space-y-4">
            {/* Field Status Panel */}
            <div
              className={`${theme === 'dark' ? 'bg-gray-900 bg-opacity-90' : 'bg-white bg-opacity-90'} backdrop-blur-sm rounded-2xl shadow-2xl border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} w-full md:w-80`}
            >
              <button
                onClick={() => setControlsExpanded(!controlsExpanded)}
                className="w-full flex items-center justify-between p-3 md:p-4 hover:bg-white/5 transition-colors rounded-2xl"
              >
                <div className="flex items-center gap-2 md:gap-3 flex-1">
                  <Network className="w-4 md:w-5 h-4 md:h-5 text-blue-400 flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <h2 className={`text-sm md:text-base font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Field Status
                    </h2>
                    {!controlsExpanded && (
                      <div className="flex items-center gap-3 text-xs mt-0.5">
                        <span className={`${cc.state.isActive ? 'text-green-400' : 'text-gray-400'}`}>
                          {cc.state.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                          {cc.state.participantCount} users
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {controlsExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}
              </button>

              {controlsExpanded && (
                <div className="px-4 md:px-6 pb-4 md:pb-6">
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
                            onClick={() => cc.startSession()}
                            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold"
                          >
                            <Play className="w-5 h-5" />
                            Start Session
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={() => cc.stopSession()}
                        className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold"
                      >
                        <Pause className="w-5 h-5" />
                        Stop Session
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Biometrics Panel */}
            {showBiometrics && cc.state.myBiometrics && (
              <div
                className={`${theme === 'dark' ? 'bg-gray-900 bg-opacity-90' : 'bg-white bg-opacity-90'} backdrop-blur-sm rounded-2xl shadow-2xl border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} w-full md:w-80`}
              >
                <button
                  onClick={() => setBiometricsExpanded(!biometricsExpanded)}
                  className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-white/5 transition-colors rounded-t-2xl"
                >
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-red-400" />
                    <h3 className={`text-base md:text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Your Biometrics
                    </h3>
                  </div>
                  {biometricsExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {biometricsExpanded && (
                  <div className="px-4 md:px-6 pb-4 md:pb-6">
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
            )}
          </div>

          {/* AI Insights Panel - Desktop Right, Mobile Bottom */}
          {showAIPanel && cc.state.aiInsights.length > 0 && (
            <div className="hidden md:block absolute top-6 right-6 z-10 w-96">
              <div
                className={`${theme === 'dark' ? 'bg-gray-900 bg-opacity-90' : 'bg-white bg-opacity-90'} backdrop-blur-sm rounded-2xl shadow-2xl border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}
              >
                <button
                  onClick={() => setAiExpanded(!aiExpanded)}
                  className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-white/5 transition-colors rounded-t-2xl"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    <h3 className={`text-base md:text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      AI Insights
                    </h3>
                  </div>
                  {aiExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {aiExpanded && (
                  <div className="px-4 md:px-6 pb-4 md:pb-6">
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
                )}
              </div>
            </div>
          )}

          {/* Intention Panel - Bottom */}
          <div className="fixed bottom-4 left-4 right-4 md:absolute md:bottom-6 md:left-6 md:right-6 md:max-w-2xl md:mx-auto z-10">
            <div
              className={`${theme === 'dark' ? 'bg-gray-900 bg-opacity-90' : 'bg-white bg-opacity-90'} backdrop-blur-sm rounded-2xl shadow-2xl border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}
            >
              <button
                onClick={() => setIntentionExpanded(!intentionExpanded)}
                className="w-full flex items-center justify-between p-3 md:p-4 hover:bg-white/5 transition-colors rounded-2xl"
              >
                <div className="flex items-center gap-2 md:gap-3">
                  <TrendingUp className="w-4 md:w-5 h-4 md:h-5 text-green-400" />
                  <h3 className={`text-sm md:text-base font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Collective Intention
                  </h3>
                </div>
                {intentionExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {intentionExpanded && (
                <div className="px-4 md:px-6 pb-4 md:pb-6">
                  <div className="flex flex-col md:flex-row gap-3">
                    <select
                      value={intentionCategory}
                      onChange={(e) => setIntentionCategory(e.target.value)}
                      className={`w-full md:w-auto px-3 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`}
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
                      disabled={!cc.state.isActive || !intentionText.trim() || !userId}
                      className="w-full md:w-auto bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Propose
                    </button>
                  </div>

                  <div className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {!cc.state.isActive ? (
                      <p className="text-yellow-500">
                        ⚠️ Start a session first to propose intentions.
                      </p>
                    ) : !userId ? (
                      <p className="text-yellow-500">
                        ⚠️ User ID required to propose intentions.
                      </p>
                    ) : (
                      <p>
                        Your intention will be shared with the collective for voting. Coherence level
                        determines vote power.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop: Event Calendar Panel */}
          {showEventCalendar && (
            <div className="hidden md:block fixed top-20 right-4 z-40 w-full max-w-md md:max-w-lg">
              <EventCalendar
                key={calendarKey}
                userId={userId}
                theme={theme}
                onCreateEvent={() => setShowCreateEvent(true)}
              />
            </div>
          )}

          {/* Mobile: Bottom Dock */}
          <div className="md:hidden">
            <MobileDock
              userId={userId}
              theme={theme}
              statusContent={{
                isActive: cc.state.isActive,
                participantCount: cc.state.participantCount,
                globalCoherence: cc.state.globalCoherence,
                fieldStrength: cc.state.fieldStrength,
                emergentFrequency: cc.state.emergentFrequency,
                quantumEntanglementMetric: cc.state.quantumEntanglementMetric,
                biometricDeviceConnected: cc.state.biometricDeviceConnected,
                onStartSession: () => cc.startSession(),
                onStopSession: () => cc.stopSession(),
                onInitializeBiometrics: handleInitializeBiometrics,
              }}
              controlsContent={
                <div className="space-y-4">
                  {/* Biometrics */}
                  {cc.state.myBiometrics && (
                    <div className="space-y-2 text-sm text-white">
                      <h4 className="font-semibold text-cyan-400 mb-3">Your Biometrics</h4>
                      {cc.state.myBiometrics.heartRate && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">Heart Rate:</span>
                          <span className="font-bold text-red-400">
                            {cc.state.myBiometrics.heartRate} BPM
                          </span>
                        </div>
                      )}
                      {cc.state.myBiometrics.hrvRMSSD && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">HRV:</span>
                          <span className="font-mono text-green-400">
                            {cc.state.myBiometrics.hrvRMSSD.toFixed(1)} ms
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-300">Coherence:</span>
                        <span className={`font-bold ${getCoherenceColor(cc.state.myBiometrics.coherenceScore)}`}>
                          {(cc.state.myBiometrics.coherenceScore * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Intentions */}
                  <div className="space-y-3 pt-4 border-t border-gray-700">
                    <h4 className="font-semibold text-green-400">Collective Intention</h4>
                    <select
                      value={intentionCategory}
                      onChange={(e) => setIntentionCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white"
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
                      className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-500"
                    />
                    <button
                      onClick={handleProposeIntention}
                      disabled={!cc.state.isActive || !intentionText.trim() || !userId}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold"
                    >
                      Propose Intention
                    </button>
                  </div>

                  {/* AI Insights */}
                  {cc.state.aiInsights.length > 0 && (
                    <div className="space-y-2 pt-4 border-t border-gray-700">
                      <h4 className="font-semibold text-yellow-400 mb-3">AI Insights</h4>
                      {cc.state.aiInsights.slice(0, 3).map((insight, idx) => (
                        <div key={idx} className="p-3 bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-yellow-400 uppercase">
                              {insight.type}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(insight.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300">{insight.message}</p>
                          {insight.recommendation && (
                            <p className="text-xs text-blue-400 mt-2">
                              💡 {insight.recommendation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              }
              onCreateEvent={() => setShowCreateEvent(true)}
              calendarKey={calendarKey}
            />
          </div>
        </>
      )}

      {/* Create Event Modal */}
      {userId && (
        <CreateEventModal
          isOpen={showCreateEvent}
          onClose={() => setShowCreateEvent(false)}
          userId={userId}
          theme={theme}
          onEventCreated={() => {
            setCalendarKey(prev => prev + 1);
          }}
        />
      )}
    </div>
  );
};