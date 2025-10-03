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

          {/* Desktop: Compact Status Bar - Bottom */}
          <div className="hidden md:flex absolute bottom-6 left-6 right-6 z-40 gap-4 items-end">
            {/* Field Status Card */}
            <div className={`${theme === 'dark' ? 'bg-gray-900 bg-opacity-95' : 'bg-white bg-opacity-95'} backdrop-blur-sm rounded-xl shadow-2xl border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} p-4 flex-1`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Network className="w-5 h-5 text-blue-400" />
                  <h3 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Field Status
                  </h3>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded ${cc.state.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                  {cc.state.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <div className="text-gray-400 mb-1">Users</div>
                  <div className="text-white font-bold">{cc.state.participantCount}</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Coherence</div>
                  <div className={`font-bold ${getCoherenceColor(cc.state.globalCoherence)}`}>
                    {(cc.state.globalCoherence * 100).toFixed(0)}%
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Frequency</div>
                  <div className="text-cyan-400 font-mono">{cc.state.emergentFrequency.toFixed(1)} Hz</div>
                </div>
              </div>
            </div>

            {/* Biometrics Card */}
            {cc.state.myBiometrics && (
              <div className={`${theme === 'dark' ? 'bg-gray-900 bg-opacity-95' : 'bg-white bg-opacity-95'} backdrop-blur-sm rounded-xl shadow-2xl border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} p-4 flex-1`}>
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-5 h-5 text-red-400" />
                  <h3 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Your Biometrics
                  </h3>
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  {cc.state.myBiometrics.heartRate && (
                    <div>
                      <div className="text-gray-400 mb-1">Heart Rate</div>
                      <div className="text-red-400 font-bold">{cc.state.myBiometrics.heartRate} BPM</div>
                    </div>
                  )}
                  <div>
                    <div className="text-gray-400 mb-1">Coherence</div>
                    <div className={`font-bold ${getCoherenceColor(cc.state.myBiometrics.coherenceScore)}`}>
                      {(cc.state.myBiometrics.coherenceScore * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">State</div>
                    <div className="text-purple-400 font-semibold uppercase">
                      {cc.state.myBiometrics.estimatedBrainwaveState}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Controls Card */}
            <div className={`${theme === 'dark' ? 'bg-gray-900 bg-opacity-95' : 'bg-white bg-opacity-95'} backdrop-blur-sm rounded-xl shadow-2xl border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} p-4`}>
              {!cc.state.isActive ? (
                !cc.state.biometricDeviceConnected ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleInitializeBiometrics('webcam')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                      title="Initialize Webcam"
                    >
                      <Heart className="w-4 h-4" />
                      Webcam
                    </button>
                    <button
                      onClick={() => handleInitializeBiometrics('bluetooth')}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                      title="Initialize Bluetooth"
                    >
                      <Brain className="w-4 h-4" />
                      Bluetooth
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => cc.startSession()}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Start
                  </button>
                )
              ) : (
                <button
                  onClick={() => cc.stopSession()}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2"
                >
                  <Pause className="w-5 h-5" />
                  Stop
                </button>
              )}
            </div>
          </div>

          {/* AI Insights - Compact Top Right */}
          {showAIPanel && cc.state.aiInsights.length > 0 && (
            <div className="hidden md:block absolute top-20 right-6 z-10 w-72">
              <div className={`${theme === 'dark' ? 'bg-gray-900 bg-opacity-95' : 'bg-white bg-opacity-95'} backdrop-blur-sm rounded-xl shadow-2xl border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} p-3`}>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <h3 className="text-sm font-bold text-white">AI Insights</h3>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {cc.state.aiInsights.slice(0, 2).map((insight, idx) => (
                    <div key={idx} className="p-2 rounded bg-gray-800 text-xs">
                      <div className="flex justify-between mb-1">
                        <span className="text-yellow-400 font-semibold uppercase">{insight.type}</span>
                        <span className="text-gray-400">{(insight.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <p className="text-gray-300">{insight.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}


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