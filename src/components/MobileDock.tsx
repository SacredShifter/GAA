import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { EventCalendar } from './EventCalendar';

interface StatusPanelContent {
  isActive: boolean;
  participantCount: number;
  globalCoherence: number;
  fieldStrength: number;
  emergentFrequency: number;
  quantumEntanglementMetric: number;
  biometricDeviceConnected: boolean;
  onStartSession: () => void;
  onStopSession: () => void;
  onInitializeBiometrics: (type: 'webcam' | 'bluetooth') => void;
}

interface MobileDockProps {
  userId?: string;
  theme?: 'dark' | 'light';
  statusContent: StatusPanelContent;
  controlsContent: React.ReactNode;
  onCreateEvent?: () => void;
  calendarKey?: number;
}

export const MobileDock = ({
  userId,
  theme = 'dark',
  statusContent,
  controlsContent,
  onCreateEvent,
  calendarKey = 0,
}: MobileDockProps) => {
  const [dockOpen, setDockOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'events' | 'controls'>('status');

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
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Dock Handle */}
      <button
        onClick={() => setDockOpen(!dockOpen)}
        className="w-full py-3 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 flex items-center justify-center gap-2 shadow-2xl"
      >
        {dockOpen ? (
          <ChevronDown className="w-5 h-5 text-white" />
        ) : (
          <ChevronUp className="w-5 h-5 text-white" />
        )}
        <span className="text-sm font-semibold text-white">
          {dockOpen ? 'Close' : 'Open Controls'}
        </span>
      </button>

      {/* Dock Content */}
      <div
        className={`bg-gray-900/98 backdrop-blur-xl border-t border-gray-800 transition-all duration-300 overflow-hidden ${
          dockOpen ? 'max-h-[70vh]' : 'max-h-0'
        }`}
      >
        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setActiveTab('status')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'status'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Status
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'events'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Events
          </button>
          <button
            onClick={() => setActiveTab('controls')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'controls'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Controls
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 100px)' }}>
          {activeTab === 'status' && (
            <div className="p-4 space-y-4">
              <div className="space-y-3 text-sm text-white">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Status:</span>
                  <span
                    className={`font-semibold ${
                      statusContent.isActive ? 'text-green-400' : 'text-gray-400'
                    }`}
                  >
                    {statusContent.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Participants:</span>
                  <span className="font-bold text-white">
                    {statusContent.participantCount}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Global Coherence:</span>
                  <span
                    className={`font-bold ${getCoherenceColor(
                      statusContent.globalCoherence
                    )}`}
                  >
                    {(statusContent.globalCoherence * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Field Strength:</span>
                    <span className="text-gray-300">
                      {statusContent.fieldStrength.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`${getFieldStrengthColor(
                        statusContent.fieldStrength
                      )} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${statusContent.fieldStrength}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Emergent Frequency:</span>
                  <span className="font-mono text-cyan-400">
                    {statusContent.emergentFrequency.toFixed(1)} Hz
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Quantum Entanglement:</span>
                  <span className="font-bold text-purple-400">
                    {(statusContent.quantumEntanglementMetric * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700">
                {!statusContent.isActive ? (
                  !statusContent.biometricDeviceConnected ? (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-400">
                        Initialize biometric monitoring:
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            statusContent.onInitializeBiometrics('webcam')
                          }
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm"
                        >
                          Webcam
                        </button>
                        <button
                          onClick={() =>
                            statusContent.onInitializeBiometrics('bluetooth')
                          }
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm"
                        >
                          Bluetooth
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={statusContent.onStartSession}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold"
                    >
                      Start Session
                    </button>
                  )
                ) : (
                  <button
                    onClick={statusContent.onStopSession}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold"
                  >
                    Stop Session
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="p-4">
              <EventCalendar
                key={calendarKey}
                userId={userId}
                theme={theme}
                onCreateEvent={onCreateEvent}
              />
            </div>
          )}

          {activeTab === 'controls' && (
            <div className="p-4">{controlsContent}</div>
          )}
        </div>
      </div>
    </div>
  );
};
