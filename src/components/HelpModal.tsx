import React from 'react';
import { X, Keyboard, MousePointer } from 'lucide-react';

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
}

export const HelpModal: React.FC<HelpModalProps> = ({ open, onClose, theme }) => {
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
        <div className="sticky top-0 bg-gradient-to-br from-blue-600 to-purple-600 p-6 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <h2 className="text-3xl font-bold text-white mb-2">Help & Shortcuts</h2>
          <p className="text-blue-100">Learn how to use GAA effectively</p>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Keyboard className="w-5 h-5 text-purple-500" />
              <h3 className={`text-xl font-semibold ${textClass}`}>Keyboard Shortcuts</h3>
            </div>
            <div className="space-y-2">
              {[
                { key: 'Space', action: 'Start/Stop sync' },
                { key: '↑', action: 'Increase frequency (+10 Hz)' },
                { key: '↓', action: 'Decrease frequency (-10 Hz)' },
                { key: '→', action: 'Increase intensity (+5%)' },
                { key: '←', action: 'Decrease intensity (-5%)' },
                { key: 'G', action: 'Next geometry mode' },
                { key: 'Shift + G', action: 'Previous geometry mode' },
                { key: 'Ctrl/Cmd + S', action: 'Save preset' },
              ].map((item) => (
                <div
                  key={item.key}
                  className={`flex items-center justify-between p-3 rounded-lg border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}
                >
                  <span className={`font-mono text-sm px-3 py-1 rounded ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'} ${textClass}`}>
                    {item.key}
                  </span>
                  <span className={secondaryTextClass}>{item.action}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <MousePointer className="w-5 h-5 text-purple-500" />
              <h3 className={`text-xl font-semibold ${textClass}`}>Features</h3>
            </div>
            <div className={`space-y-4 ${secondaryTextClass}`}>
              <div>
                <h4 className={`font-semibold ${textClass} mb-1`}>Audio Modes</h4>
                <ul className="space-y-1 pl-4">
                  <li>• <strong>Single:</strong> Pure tone at selected frequency</li>
                  <li>• <strong>Harmonic:</strong> Stacked overtones for rich resonance</li>
                  <li>• <strong>Sweep:</strong> Automated frequency journey</li>
                  <li>• <strong>Binaural:</strong> Left/right ear offset for brainwave entrainment</li>
                </ul>
              </div>

              <div>
                <h4 className={`font-semibold ${textClass} mb-1`}>Geometry Modes</h4>
                <ul className="space-y-1 pl-4">
                  <li>• <strong>Waves:</strong> Concentric rings pulsing outward</li>
                  <li>• <strong>Lattice:</strong> Interactive grid responding to audio</li>
                  <li>• <strong>Sacred Geometry:</strong> Flower of life patterns</li>
                  <li>• <strong>Particles:</strong> Dynamic point cloud</li>
                  <li>• <strong>Dome:</strong> Protective energy shield</li>
                </ul>
              </div>

              <div>
                <h4 className={`font-semibold ${textClass} mb-1`}>Sacred Frequencies</h4>
                <ul className="space-y-1 pl-4">
                  <li>• <strong>396 Hz:</strong> Liberation from fear and guilt</li>
                  <li>• <strong>417 Hz:</strong> Facilitating change</li>
                  <li>• <strong>432 Hz:</strong> Universal harmony</li>
                  <li>• <strong>528 Hz:</strong> Transformation and DNA repair</li>
                  <li>• <strong>639 Hz:</strong> Connection and relationships</li>
                  <li>• <strong>741 Hz:</strong> Expression and solutions</li>
                  <li>• <strong>852 Hz:</strong> Intuition and spiritual order</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
