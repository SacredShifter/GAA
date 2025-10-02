import { useState, useEffect } from 'react';
import { Info, Sparkles } from 'lucide-react';
import { PrecisionGAA } from './components/PrecisionGAA';
import { EgyptianCodeGAA } from './components/EgyptianCodeGAA';
import { AboutModal } from './components/AboutModal';

type ExperienceMode = 'precision' | 'egyptian';

function App() {
  const [showAbout, setShowAbout] = useState(false);
  const [mode, setMode] = useState<ExperienceMode>('precision');

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('gaa-welcome-seen');
    if (!hasSeenWelcome) {
      setShowAbout(true);
      localStorage.setItem('gaa-welcome-seen', 'true');
    }
  }, []);

  return (
    <>
      {mode === 'precision' ? (
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
          onClick={() => setMode(mode === 'precision' ? 'egyptian' : 'precision')}
          className="px-4 py-3 bg-slate-900/95 backdrop-blur-lg border border-purple-500/30 rounded-xl shadow-2xl hover:bg-slate-800 transition-all group flex items-center gap-2"
          title={mode === 'precision' ? 'Switch to Egyptian Code' : 'Switch to Precision GAA'}
          aria-label="Switch mode"
        >
          <Sparkles className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium text-purple-300">
            {mode === 'precision' ? 'Egyptian Code' : 'Precision GAA'}
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
