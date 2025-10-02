import { useState, useEffect } from 'react';
import { Info, Sparkles, Network } from 'lucide-react';
import { PrecisionGAA } from './components/PrecisionGAA';
import { EgyptianCodeGAA } from './components/EgyptianCodeGAA';
import { CollectiveConsciousnessField } from './components/CollectiveConsciousnessField';
import { AboutModal } from './components/AboutModal';

type ExperienceMode = 'precision' | 'egyptian' | 'collective';

function App() {
  const [showAbout, setShowAbout] = useState(false);
  const [mode, setMode] = useState<ExperienceMode>('collective');

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('gaa-welcome-seen');
    if (!hasSeenWelcome) {
      setShowAbout(true);
      localStorage.setItem('gaa-welcome-seen', 'true');
    }
  }, []);

  const cycleModes = () => {
    if (mode === 'collective') setMode('precision');
    else if (mode === 'precision') setMode('egyptian');
    else setMode('collective');
  };

  const getModeLabel = () => {
    if (mode === 'collective') return 'Precision GAA';
    if (mode === 'precision') return 'Egyptian Code';
    return 'Collective Field';
  };

  const getModeIcon = () => {
    if (mode === 'collective') return <Sparkles className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />;
    if (mode === 'precision') return <Network className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />;
    return <Sparkles className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />;
  };

  return (
    <>
      {mode === 'collective' ? (
        <CollectiveConsciousnessField
          userId="demo-user"
          theme="dark"
          showControls={true}
        />
      ) : mode === 'precision' ? (
        <PrecisionGAA
          userId="demo-user"
          theme="dark"
          showControls={true}
        />
      ) : (
        <EgyptianCodeGAA
          theme="dark"
          showControls={true}
        />
      )}

      <div className="fixed top-6 left-6 z-50 flex gap-3">
        <button
          onClick={() => setShowAbout(true)}
          className="p-3 bg-slate-900/95 backdrop-blur-lg border border-cyan-500/30 rounded-xl shadow-2xl hover:bg-slate-800 transition-all group"
          title="About GAA"
          aria-label="About GAA"
        >
          <Info className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
        </button>

        <button
          onClick={cycleModes}
          className="px-4 py-3 bg-slate-900/95 backdrop-blur-lg border border-purple-500/30 rounded-xl shadow-2xl hover:bg-slate-800 transition-all group flex items-center gap-2"
          title={`Switch to ${getModeLabel()}`}
          aria-label="Switch mode"
        >
          {getModeIcon()}
          <span className="text-sm font-medium text-purple-300">
            {getModeLabel()}
          </span>
        </button>
      </div>

      <AboutModal
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
        theme="dark"
      />
    </>
  );
}

export default App;
