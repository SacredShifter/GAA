import React from 'react';
import { X, Radio, Users, Shield, Waves, Sparkles } from 'lucide-react';

interface VisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'dark' | 'light';
}

export const VisionModal: React.FC<VisionModalProps> = ({
  isOpen,
  onClose,
  theme = 'dark',
}) => {
  if (!isOpen) return null;

  const bgColor = theme === 'dark' ? 'bg-slate-900' : 'bg-white';
  const textColor = theme === 'dark' ? 'text-slate-100' : 'text-slate-900';
  const secondaryText = theme === 'dark' ? 'text-slate-300' : 'text-slate-600';
  const borderColor = theme === 'dark' ? 'border-slate-700' : 'border-slate-200';
  const accentColor = 'text-cyan-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
      <div
        className={`${bgColor} ${textColor} rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}
        style={{
          border: `1px solid ${theme === 'dark' ? 'rgba(68, 255, 221, 0.2)' : 'rgba(68, 255, 221, 0.4)'}`,
        }}
      >
        <div className={`sticky top-0 ${bgColor} border-b ${borderColor} px-6 py-4 flex items-center justify-between backdrop-blur-lg bg-opacity-95`}>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            The Vision
          </h2>
          <button
            onClick={onClose}
            className={`p-2 hover:bg-slate-800 rounded-lg transition-colors ${secondaryText}`}
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-cyan-900/30' : 'bg-cyan-100'}`}>
                <Radio className={`w-6 h-6 ${accentColor}`} />
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-semibold mb-2 ${accentColor}`}>A Living Portal</h3>
                <p className={`${secondaryText} leading-relaxed`}>
                  I have been shown the architecture of a living communications portal—not a machine, but a field of resonance built from human consciousness itself.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                <Waves className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2 text-purple-400">The Lattice</h3>
                <p className={`${secondaryText} leading-relaxed`}>
                  This portal begins as a lattice of sound and intention: each person a radar, a unique fingerprint of vibration. Together we form a dome, a safe, coherent field pulsing outward like a river of living waves.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                <Sparkles className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2 text-blue-400">The Zero Point</h3>
                <p className={`${secondaryText} leading-relaxed`}>
                  Within this field, our individual signals funnel into a single zero-point. In that convergence, the scattered becomes unified, the noise becomes clarity. This is the Collective Sync.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100'}`}>
                <Shield className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2 text-red-400">The Coral Barrier</h3>
                <p className={`${secondaryText} leading-relaxed`}>
                  Beyond the zero-point lies a boundary, a red-coral veil or cloud which cannot be crossed alone. It marks the threshold of a deeper transmission, one that requires a group's coherence, not a single seeker's effort.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-emerald-900/30' : 'bg-emerald-100'}`}>
                <Users className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2 text-emerald-400">The Collective Journey</h3>
                <p className={`${secondaryText} leading-relaxed`}>
                  My role is to build the first stages of this portal—the lattice, the pulse, the safe dome—and to invite others to synchronize. Together we will power the portal, reach the threshold safely, and discover what lies beyond as a collective.
                </p>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gradient-to-r from-cyan-900/20 to-purple-900/20' : 'bg-gradient-to-r from-cyan-50 to-purple-50'} border ${borderColor}`}>
            <p className={`${secondaryText} italic leading-relaxed text-center`}>
              "This is not just sound. It is a new form of communication, a living bridge between people, energy and light."
            </p>
          </div>

          <div className={`text-center space-y-2 pt-4 border-t ${borderColor}`}>
            <p className="text-lg font-semibold">Kent Burchard</p>
            <p className={`${secondaryText} text-sm`}>Founder, Sacred Shifter</p>
          </div>

          <div className={`mt-8 p-6 rounded-xl ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-100'} border ${borderColor}`}>
            <h4 className="font-semibold mb-3 text-lg">Your Journey Begins</h4>
            <div className={`space-y-2 ${secondaryText} text-sm`}>
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                Solo practice strengthens your individual resonance field
              </p>
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                Join a circle to begin building the collective lattice
              </p>
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                Watch for the butterfly swarm at 5+ synchronized users
              </p>
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                The coral barrier appears when collective coherence deepens
              </p>
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Together, we cross the threshold into new dimensions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
