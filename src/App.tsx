import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { GAA } from './components/GAA';
import { AboutModal } from './components/AboutModal';

function App() {
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('gaa-welcome-seen');
    if (!hasSeenWelcome) {
      setShowAbout(true);
      localStorage.setItem('gaa-welcome-seen', 'true');
    }
  }, []);

  const handleResonanceChange = (state: any) => {
    console.log('Resonance state changed:', state);
  };

  const handleSync = () => {
    console.log('User opened Collective Sync modal');
  };

  return (
    <>
      <GAA
        enableSync={true}
        theme="dark"
        showControls={true}
        onResonanceChange={handleResonanceChange}
        onSync={handleSync}
        initialConfig={{
          frequency: 432,
          intensity: 0.5,
          pulseSpeed: 1,
          geometryMode: 'waves',
        }}
      />

      <button
        onClick={() => setShowAbout(true)}
        className="fixed top-6 left-6 z-50 p-3 bg-slate-900/95 backdrop-blur-lg border border-cyan-500/30 rounded-xl shadow-2xl hover:bg-slate-800 transition-all group"
        title="About GAA"
        aria-label="About GAA"
      >
        <Info className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
      </button>

      <AboutModal
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
        theme="dark"
      />
    </>
  );
}

export default App;
