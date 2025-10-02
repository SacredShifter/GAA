import React from 'react';
import { X, Users, Activity, Zap } from 'lucide-react';
import type { SyncState } from '../hooks/useSync';

interface CollectiveSyncModalProps {
  open: boolean;
  onClose: () => void;
  syncState?: SyncState;
  theme: 'dark' | 'light';
}

export const CollectiveSyncModal: React.FC<CollectiveSyncModalProps> = ({
  open,
  onClose,
  syncState,
  theme,
}) => {
  if (!open) return null;

  const bgClass = theme === 'dark' ? 'bg-slate-900' : 'bg-white';
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const secondaryTextClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`relative ${bgClass} rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto`}>
        <div className="sticky top-0 bg-gradient-to-br from-purple-600 to-pink-600 p-6 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <h2 className="text-3xl font-bold text-white mb-2">Collective Sync</h2>
          <p className="text-purple-100">Join the global consciousness network</p>
        </div>

        <div className="p-6 space-y-6">
          {syncState && syncState.isConnected && (
            <div className="grid grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  <span className={`text-sm font-medium ${secondaryTextClass}`}>Active Users</span>
                </div>
                <p className={`text-2xl font-bold ${textClass}`}>{syncState.totalUsers}</p>
              </div>

              <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-green-500" />
                  <span className={`text-sm font-medium ${secondaryTextClass}`}>Status</span>
                </div>
                <p className="text-lg font-semibold text-green-500">Connected</p>
              </div>

              <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span className={`text-sm font-medium ${secondaryTextClass}`}>Energy</span>
                </div>
                <p className={`text-2xl font-bold ${textClass}`}>
                  {syncState.mySession ? 'Syncing' : 'Observing'}
                </p>
              </div>
            </div>
          )}

          <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-purple-500/10 border-purple-500/30' : 'bg-purple-50 border-purple-200'}`}>
            <h3 className={`text-xl font-semibold ${textClass} mb-3`}>
              What is Collective Sync?
            </h3>
            <p className={`${secondaryTextClass} leading-relaxed mb-4`}>
              When you join Collective Sync, your resonance pattern becomes part of a shared field
              of harmonized frequencies. Together with others around the world, you contribute to
              and benefit from a collective alignment that amplifies individual and group consciousness.
            </p>
            <ul className={`space-y-2 ${secondaryTextClass}`}>
              <li className="flex items-start gap-2">
                <span className="text-purple-500">•</span>
                <span>See others syncing in real-time</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500">•</span>
                <span>Share your frequency patterns</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500">•</span>
                <span>Experience collective resonance amplification</span>
              </li>
            </ul>
          </div>

          {syncState && syncState.activeSessions.length > 0 && (
            <div>
              <h3 className={`text-lg font-semibold ${textClass} mb-3`}>
                Active Sessions
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {syncState.activeSessions.slice(0, 10).map((session) => (
                  <div
                    key={session.id}
                    className={`p-3 rounded-lg border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${textClass}`}>
                          {session.frequency} Hz - {session.geometry_mode}
                        </p>
                        <p className={`text-sm ${secondaryTextClass}`}>
                          {session.wave_type} wave • {Math.round(session.intensity * 100)}% intensity
                        </p>
                      </div>
                      {session.id === syncState.mySession?.id && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs font-medium rounded">
                          You
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!syncState || !syncState.isConnected) && (
            <div className={`p-6 text-center rounded-xl border ${theme === 'dark' ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'}`}>
              <p className={`${secondaryTextClass}`}>
                Start your sync to join the collective consciousness network
              </p>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
