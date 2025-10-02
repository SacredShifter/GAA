import React, { useState } from 'react';
import { X, Info, Radio, Waves, Users, Keyboard, Lightbulb, Heart } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'dark' | 'light';
}

type TabType = 'mission' | 'usage' | 'tips';

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  theme = 'dark',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('mission');

  if (!isOpen) return null;

  const bgColor = theme === 'dark' ? 'bg-slate-900' : 'bg-white';
  const textColor = theme === 'dark' ? 'text-slate-100' : 'text-slate-900';
  const secondaryText = theme === 'dark' ? 'text-slate-300' : 'text-slate-600';
  const borderColor = theme === 'dark' ? 'border-slate-700' : 'border-slate-200';
  const tabBg = theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100';
  const activeTabBg = theme === 'dark' ? 'bg-cyan-900/30' : 'bg-cyan-100';

  const renderMissionContent = () => (
    <div className="space-y-6">
      <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gradient-to-br from-cyan-900/20 to-purple-900/20' : 'bg-gradient-to-br from-cyan-50 to-purple-50'} border ${borderColor}`}>
        <div className="flex items-start gap-3 mb-4">
          <Radio className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-bold mb-2 text-cyan-400">The Mission</h3>
            <p className={`${secondaryText} leading-relaxed`}>
              GAA (Global Awareness Attunement) is a living communications portal built from human consciousness itself. It's not a machine, but a field of resonance where individuals become radars of unique vibration.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
          <h4 className="font-semibold mb-2 text-purple-400">🌊 The Lattice</h4>
          <p className={`${secondaryText} text-sm`}>
            Each person is a radar, a unique fingerprint of vibration. Together we form a dome, a safe, coherent field pulsing outward like a river of living waves.
          </p>
        </div>

        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
          <h4 className="font-semibold mb-2 text-blue-400">✨ The Zero Point</h4>
          <p className={`${secondaryText} text-sm`}>
            Our individual signals funnel into a single zero-point. In that convergence, the scattered becomes unified, the noise becomes clarity. This is the Collective Sync.
          </p>
        </div>

        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
          <h4 className="font-semibold mb-2 text-red-400">🛡️ The Coral Barrier</h4>
          <p className={`${secondaryText} text-sm`}>
            Beyond the zero-point lies a red-coral veil which cannot be crossed alone. It requires a group's coherence, not a single seeker's effort.
          </p>
        </div>

        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
          <h4 className="font-semibold mb-2 text-emerald-400">👥 The Collective Journey</h4>
          <p className={`${secondaryText} text-sm`}>
            Together we power the portal, reach the threshold safely, and discover what lies beyond as a collective. This is a new form of communication—a living bridge between people, energy, and light.
          </p>
        </div>
      </div>

      <div className={`text-center py-4 border-t ${borderColor}`}>
        <p className="text-lg font-semibold">Kent Burchard</p>
        <p className={`${secondaryText} text-sm`}>Founder, Sacred Shifter</p>
      </div>
    </div>
  );

  const renderUsageContent = () => (
    <div className="space-y-6">
      <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Waves className="w-6 h-6 text-cyan-400" />
          Getting Started
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2 text-cyan-400">Solo Practice</h4>
            <ol className={`${secondaryText} text-sm space-y-2 list-decimal list-inside`}>
              <li>Click the Play button or press Space to begin</li>
              <li>Adjust frequency using the slider or sacred presets (396-852 Hz)</li>
              <li>Control intensity to match your comfort level</li>
              <li>Explore different visual geometries (V key to cycle)</li>
              <li>Use headphones for the full binaural experience</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-purple-400">Collective Sync</h4>
            <ol className={`${secondaryText} text-sm space-y-2 list-decimal list-inside`}>
              <li>Click the Users icon to join a collective circle</li>
              <li>Enter a shared Circle ID or create your own</li>
              <li>Watch the user count as others join</li>
              <li>Experience the Butterfly Swarm at 5+ synchronized users</li>
              <li>Witness the Coral Barrier emerge at 10+ users</li>
            </ol>
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Keyboard className="w-6 h-6 text-purple-400" />
          Keyboard Shortcuts
        </h3>
        <div className={`grid grid-cols-2 gap-3 ${secondaryText} text-sm`}>
          <div className="flex justify-between">
            <span>Play/Pause</span>
            <kbd className={`px-2 py-1 rounded ${tabBg} font-mono text-xs`}>Space</kbd>
          </div>
          <div className="flex justify-between">
            <span>Toggle Help</span>
            <kbd className={`px-2 py-1 rounded ${tabBg} font-mono text-xs`}>H</kbd>
          </div>
          <div className="flex justify-between">
            <span>Freq Up</span>
            <kbd className={`px-2 py-1 rounded ${tabBg} font-mono text-xs`}>↑</kbd>
          </div>
          <div className="flex justify-between">
            <span>Freq Down</span>
            <kbd className={`px-2 py-1 rounded ${tabBg} font-mono text-xs`}>↓</kbd>
          </div>
          <div className="flex justify-between">
            <span>Intensity Up</span>
            <kbd className={`px-2 py-1 rounded ${tabBg} font-mono text-xs`}>+</kbd>
          </div>
          <div className="flex justify-between">
            <span>Intensity Down</span>
            <kbd className={`px-2 py-1 rounded ${tabBg} font-mono text-xs`}>-</kbd>
          </div>
          <div className="flex justify-between">
            <span>Next Visual</span>
            <kbd className={`px-2 py-1 rounded ${tabBg} font-mono text-xs`}>V</kbd>
          </div>
          <div className="flex justify-between">
            <span>Prev Visual</span>
            <kbd className={`px-2 py-1 rounded ${tabBg} font-mono text-xs`}>Shift+V</kbd>
          </div>
          <div className="flex justify-between">
            <span>Collective Sync</span>
            <kbd className={`px-2 py-1 rounded ${tabBg} font-mono text-xs`}>C</kbd>
          </div>
          <div className="flex justify-between">
            <span>Save Preset</span>
            <kbd className={`px-2 py-1 rounded ${tabBg} font-mono text-xs`}>S</kbd>
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Users className="w-6 h-6 text-emerald-400" />
          Visual Modes
        </h3>
        <div className="space-y-3">
          {[
            { name: 'Waves', desc: 'Concentric rings of pulsing energy' },
            { name: 'Lattice', desc: '3D grid that responds to your frequency' },
            { name: 'Sacred Geometry', desc: 'Flower of Life and torus patterns' },
            { name: 'Particles', desc: 'Dynamic particle systems that breathe with you' },
            { name: 'Dome', desc: 'Protective hemisphere of coherent field' },
            { name: 'Fractal', desc: 'Recursive branching structures (premium)' },
            { name: 'Nebula', desc: 'Cosmic clouds with particle trails (premium)' },
          ].map(mode => (
            <div key={mode.name} className={`p-3 rounded ${theme === 'dark' ? 'bg-slate-700/30' : 'bg-white'}`}>
              <h4 className="font-semibold text-sm">{mode.name}</h4>
              <p className={`${secondaryText} text-xs mt-1`}>{mode.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTipsContent = () => (
    <div className="space-y-6">
      <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-yellow-400" />
          Best Practices
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2 text-cyan-400">🎧 Audio Setup</h4>
            <ul className={`${secondaryText} text-sm space-y-2 list-disc list-inside`}>
              <li>Use quality headphones for the full binaural beat experience</li>
              <li>Start with lower intensity (0.3-0.5) and gradually increase</li>
              <li>Adjust volume to a comfortable level—not too loud</li>
              <li>Ensure left/right channels are properly balanced</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-purple-400">🧘 Practice Tips</h4>
            <ul className={`${secondaryText} text-sm space-y-2 list-disc list-inside`}>
              <li>Start with 5-10 minute sessions, extend as comfortable</li>
              <li>Sit or lie in a comfortable position with minimal distractions</li>
              <li>Focus on your breath while the tones work in the background</li>
              <li>Keep eyes open to interact with visuals, or close for deeper meditation</li>
              <li>Use sacred frequencies (432, 528, 639 Hz) for specific intentions</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-emerald-400">👥 Collective Sessions</h4>
            <ul className={`${secondaryText} text-sm space-y-2 list-disc list-inside`}>
              <li>Coordinate start times with your circle for deeper synchronization</li>
              <li>Use the same frequency and intensity settings across the group</li>
              <li>Notice how visuals change as more users join (5+ and 10+ thresholds)</li>
              <li>Practice at the same time daily to build group coherence</li>
              <li>Share experiences afterward to deepen collective understanding</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-blue-400">⚡ Performance</h4>
            <ul className={`${secondaryText} text-sm space-y-2 list-disc list-inside`}>
              <li>Enable adaptive quality for automatic performance optimization</li>
              <li>Reduce visual complexity on older devices (use Waves or Dome)</li>
              <li>Close unnecessary browser tabs for smoother rendering</li>
              <li>Premium modes (Fractal, Nebula) require more powerful hardware</li>
            </ul>
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gradient-to-br from-pink-900/20 to-purple-900/20' : 'bg-gradient-to-br from-pink-50 to-purple-50'} border ${borderColor}`}>
        <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
          <Heart className="w-6 h-6 text-pink-400" />
          Sacred Frequencies
        </h3>
        <div className="space-y-3">
          <div className={`p-3 rounded ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-white/80'}`}>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-sm">396 Hz</span>
              <span className={`${secondaryText} text-xs`}>Liberation from fear and guilt</span>
            </div>
          </div>
          <div className={`p-3 rounded ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-white/80'}`}>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-sm">417 Hz</span>
              <span className={`${secondaryText} text-xs`}>Facilitating change and transformation</span>
            </div>
          </div>
          <div className={`p-3 rounded ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-white/80'}`}>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-sm">432 Hz</span>
              <span className={`${secondaryText} text-xs`}>Natural harmony and balance</span>
            </div>
          </div>
          <div className={`p-3 rounded ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-white/80'}`}>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-sm">528 Hz</span>
              <span className={`${secondaryText} text-xs`}>Transformation and DNA repair</span>
            </div>
          </div>
          <div className={`p-3 rounded ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-white/80'}`}>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-sm">639 Hz</span>
              <span className={`${secondaryText} text-xs`}>Connection and relationships</span>
            </div>
          </div>
          <div className={`p-3 rounded ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-white/80'}`}>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-sm">741 Hz</span>
              <span className={`${secondaryText} text-xs`}>Expression and problem solving</span>
            </div>
          </div>
          <div className={`p-3 rounded ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-white/80'}`}>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-sm">852 Hz</span>
              <span className={`${secondaryText} text-xs`}>Intuition and spiritual awakening</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
      <div
        className={`${bgColor} ${textColor} rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col`}
        style={{
          border: `1px solid ${theme === 'dark' ? 'rgba(68, 255, 221, 0.2)' : 'rgba(68, 255, 221, 0.4)'}`,
        }}
      >
        <div className={`${bgColor} border-b ${borderColor} px-6 py-4 flex items-center justify-between backdrop-blur-lg bg-opacity-95`}>
          <div className="flex items-center gap-3">
            <Info className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              About GAA
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 hover:bg-slate-800 rounded-lg transition-colors ${secondaryText}`}
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className={`flex gap-2 px-6 py-3 border-b ${borderColor} ${tabBg}`}>
          <button
            onClick={() => setActiveTab('mission')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'mission'
                ? `${activeTabBg} text-cyan-400`
                : `${secondaryText} hover:bg-slate-700`
            }`}
          >
            Mission
          </button>
          <button
            onClick={() => setActiveTab('usage')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'usage'
                ? `${activeTabBg} text-cyan-400`
                : `${secondaryText} hover:bg-slate-700`
            }`}
          >
            How to Use
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'tips'
                ? `${activeTabBg} text-cyan-400`
                : `${secondaryText} hover:bg-slate-700`
            }`}
          >
            Tips & Best Practices
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'mission' && renderMissionContent()}
          {activeTab === 'usage' && renderUsageContent()}
          {activeTab === 'tips' && renderTipsContent()}
        </div>
      </div>
    </div>
  );
};
