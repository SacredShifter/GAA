import { GAA } from './components/GAA';

function App() {
  const handleResonanceChange = (state: any) => {
    console.log('Resonance state changed:', state);
  };

  const handleSync = () => {
    console.log('User opened Collective Sync modal');
  };

  return (
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
  );
}

export default App;
