# GAA - Global Alignment Amplifier

A comprehensive audio-visual resonance system for collective consciousness synchronization, built with React, Three.js, Web Audio API, and Supabase.

## Features

### Audio Engine
- **4 Audio Modes:**
  - Single Tone: Pure frequency generation
  - Harmonic Stack: Multiple overtones in phase
  - Frequency Sweep: Automated journey through frequency ranges
  - Binaural Beats: Left/right ear offset for brainwave entrainment

- **Sacred Frequencies:** 396, 417, 432, 528, 639, 741, 852 Hz
- **Custom Frequency Input:** 20-2000 Hz range
- **4 Wave Types:** Sine, Triangle, Square, Sawtooth
- **Real-time FFT Analysis:** Live spectrum visualization
- **Intensity Control:** 0-100% amplitude control

### Visual Engine (Three.js)
- **5 Geometry Modes:**
  - **Waves:** Concentric rings pulsing outward (sonar/radar effect)
  - **Lattice:** Interactive 3D grid responding to audio energy
  - **Sacred Geometry:** Flower of life patterns with harmonic resonance
  - **Particles:** 5000+ dynamic particles reacting to audio spectrum
  - **Dome:** Protective energy shield visualization

- **Audio-Reactive:** All visuals respond to frequency and amplitude
- **Pulse Speed Control:** 0.1x - 3x animation speed
- **Orbit Controls:** Optional camera control for exploration
- **Shader Effects:** Glow, transparency, and color mapping

### Presets System
- **6 Built-in Presets:**
  - Deep Calm
  - Sacred Flow
  - Harmonic Resonance
  - Frequency Sweep
  - Binaural Deep Focus
  - Energy Burst

- **Save/Load:** Custom configurations (localStorage + Supabase)
- **Public Sharing:** Share presets with the community

### Collective Sync (Supabase Realtime)
- **Real-time Sessions:** See active users and their configurations
- **Circle Integration:** Connect to Sacred Shifter circles
- **Live Updates:** Realtime session tracking via Supabase channels
- **Session Persistence:** All sync data saved to database

### Keyboard Shortcuts
- `Space` - Start/Stop sync
- `↑/↓` - Adjust frequency (±10 Hz)
- `→/←` - Adjust intensity (±5%)
- `G` - Next geometry mode
- `Shift+G` - Previous geometry mode
- `Ctrl/Cmd+S` - Save preset

## Tech Stack

- **Frontend:** React 18+ / TypeScript
- **3D Graphics:** Three.js
- **Audio:** Web Audio API
- **Database:** Supabase (PostgreSQL + Realtime)
- **Styling:** TailwindCSS
- **Icons:** Lucide React
- **Build Tool:** Vite

## Database Schema

### Tables
- `profiles` - User profiles linked to auth.users
- `gaa_sync_sessions` - Active sync sessions with real-time subscriptions
- `gaa_presets` - User-created presets (public/private)
- `gaa_resonance_log` - Historical resonance data for analytics

All tables have Row Level Security (RLS) enabled.

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Development

```bash
npm run dev
```

Visit `http://localhost:5173`

## Build

```bash
npm run build
```

## Usage

### Basic Usage

```tsx
import { GAA } from './components/GAA';

function App() {
  return <GAA />;
}
```

### Full Configuration

```tsx
import { GAA } from './components/GAA';

function App() {
  const handleResonanceChange = (state) => {
    console.log('Frequency:', state.frequency);
    console.log('Intensity:', state.intensity);
    console.log('Geometry:', state.geometryMode);
  };

  return (
    <GAA
      userId="user-123"
      circleId="circle-456"
      enableSync={true}
      theme="dark"
      showControls={true}
      onResonanceChange={handleResonanceChange}
      onSync={() => console.log('Collective sync opened')}
      initialConfig={{
        frequency: 432,
        intensity: 0.5,
        audioMode: 'harmonic',
        pulseSpeed: 1,
        geometryMode: 'sacredGeometry',
      }}
    />
  );
}
```

### Programmatic Control with useGAA Hook

```tsx
import { useGAA } from './hooks/useGAA';

function CustomGAAController() {
  const gaa = useGAA({
    userId: 'user-123',
    enableSync: true,
    onResonanceChange: (state) => console.log(state),
  });

  return (
    <div>
      <button onClick={() => gaa.start({ frequency: 528 })}>
        Start 528 Hz
      </button>
      <button onClick={() => gaa.stop()}>Stop</button>
      <button onClick={() => gaa.setGeometryMode('particles')}>
        Particles
      </button>

      <p>Playing: {gaa.state.isPlaying ? 'Yes' : 'No'}</p>
      <p>Frequency: {gaa.state.frequency} Hz</p>
      {gaa.sync && <p>Synced Users: {gaa.sync.totalUsers}</p>}
    </div>
  );
}
```

## API Reference

### GAA Component Props

```typescript
interface GAAProps {
  userId?: string;                      // User ID for Supabase sync
  circleId?: string;                    // Sacred Shifter circle ID
  enableSync?: boolean;                 // Enable realtime sync (default: false)
  theme?: 'dark' | 'light';             // UI theme (default: 'dark')
  showControls?: boolean;               // Show control panel (default: true)
  onResonanceChange?: (state: GAAState) => void;  // State change callback
  onSync?: () => void;                  // Collective sync callback
  initialConfig?: GAAConfig;            // Initial configuration
}
```

### useGAA Hook Return

```typescript
{
  state: GAAState;                      // Current state
  audio: AudioEngine;                   // Audio engine controls
  sync?: SyncState;                     // Sync state (if enabled)
  presets: PresetsHook;                 // Presets management
  start: (config?: GAAConfig) => void;  // Start with optional config
  stop: () => void;                     // Stop audio/visuals
  updateConfig: (config: GAAConfig) => void;  // Update live config
  loadPreset: (preset: Preset) => void; // Load a preset
  setPulseSpeed: (speed: number) => void;
  setGeometryMode: (mode: GeometryMode) => void;
  setEnableOrbitControls: (enabled: boolean) => void;
  getSpectrumData: () => SpectrumData;  // Get FFT data
}
```

## Exports

```typescript
// Main component
export { GAA } from './components/GAA';

// Hooks
export { useGAA } from './hooks/useGAA';
export { useEnhancedAudio } from './hooks/useEnhancedAudio';
export { useSync } from './hooks/useSync';
export { usePresets } from './hooks/usePresets';
export { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

// Components
export { EnhancedVisuals } from './components/EnhancedVisuals';

// Types
export type { GAAProps, GAAState, GAAConfig };
export type { AudioEngineState, WaveType, AudioMode, SpectrumData };
export type { SyncSession, SyncState };
export type { Preset, GeometryMode };
```

## Sacred Shifter Integration

GAA is designed for seamless integration with Sacred Shifter:

1. **Circle Sync:** Pass `circleId` to sync within specific circles
2. **User Identity:** Pass `userId` for personalized presets and sync tracking
3. **State Callbacks:** `onResonanceChange` broadcasts state to Sacred Shifter
4. **Collective Sync:** `onSync` callback for custom collective logic

```tsx
<GAA
  userId={sacredShifter.currentUser.id}
  circleId={sacredShifter.activeCircle.id}
  enableSync={true}
  onResonanceChange={(state) => {
    sacredShifter.updateUserResonance(state);
  }}
  onSync={() => {
    sacredShifter.triggerCollectiveSync();
  }}
/>
```

## Performance

- **Audio:** Low-latency Web Audio API with sub-10ms response
- **Visuals:** 60 FPS with requestAnimationFrame
- **Bundle:** ~818KB (Three.js is largest dependency)
- **Optimization:** Consider code-splitting Three.js for production

## Future Enhancements

- VR/AR mode with WebXR
- Live microphone input for environment resonance
- Advanced shader effects (bloom, chromatic aberration)
- Global lattice map showing synchronized users worldwide
- Isochronic pulse patterns
- Audio recording and session playback
- Advanced analytics dashboard

## License

MIT

## Credits

Built with love for the Sacred Shifter community.
