# Sonic Shifter ↔ GAA Integration Guide

This guide explains how the GAA (Global Awareness Attunement) module integrates with Sonic Shifter v2.0 for bidirectional audio-resonance coherence feedback.

## Architecture Overview

The integration uses the **GlobalEventHorizon** event bus pattern for loose coupling and semantic routing. Both modules communicate through typed events without direct dependencies.

```
┌─────────────────┐          GlobalEventHorizon           ┌─────────────────┐
│                 │   ──────────────────────────────────▶  │                 │
│  Sonic Shifter  │   sonic:harmonic:data (60 fps)        │   GAA Core      │
│                 │   ◀──────────────────────────────────  │                 │
└─────────────────┘   gaa:coherence:update (0.3-1 fps)    └─────────────────┘
```

## Quick Start

### 1. Installation

```bash
npm install @gaa/core
```

### 2. Initialize the Integration

```typescript
import { SonicGAAIntegration } from '@gaa/core';

const integration = new SonicGAAIntegration();
integration.startListening();
```

### 3. Using the React Hook

```typescript
import { useSonicIntegration } from '@gaa/core';

function MyComponent() {
  const { state, startListening, stopListening } = useSonicIntegration({
    userId: 'user-123',
    sessionId: 'session-456',
    autoStart: true,
    mode: 'collective', // or 'individual'
  });

  return (
    <div>
      <p>Coherence: {(state.currentCoherence * 100).toFixed(1)}%</p>
      <p>Connected: {state.isConnected ? 'Yes' : 'No'}</p>
      {state.lastFeedback && (
        <p>Recommendation: {state.lastFeedback.recommendation}</p>
      )}
    </div>
  );
}
```

### 4. Using the Monitor Component

```typescript
import { SonicIntegrationMonitor } from '@gaa/core';

function App() {
  return (
    <SonicIntegrationMonitor
      userId="user-123"
      sessionId="session-456"
      mode="collective"
      theme="dark"
      compact={false}
    />
  );
}
```

## Event Protocol

### Incoming Events (Sonic Shifter → GAA)

#### `sonic:harmonic:data`
**Frequency:** ~60 times/second
**Purpose:** Real-time harmonic data stream

```typescript
{
  type: 'sonic:harmonic:data',
  sourceId: 'sonic-shifter',
  timestamp: '2025-10-05T12:34:56.789Z',
  payload: {
    sonicData: {
      currentFrequency: 432.0,     // Hz
      amplitude: 0.75,              // 0-1
      harmonicStack: [432, 648, 864, 1080],  // Array of harmonics
      phase: 1.57,                  // Radians
      coherenceIndex: 0.85,         // 0-1
      timestamp: 1696512896789,
      waveform: 'sine'
    },
    userId: 'user-123',
    sessionId: 'session-456',
    mode: 'collective'
  },
  essenceLabels: ['harmonic', 'sonic', 'realtime']
}
```

#### `sonic:bridge:connected`
Connection established notification

#### `sonic:bridge:disconnected`
Connection terminated notification

#### `sonic:user:state`
User intention and emotional state updates

#### `sonic:request:coherence`
Request for coherence analysis

### Outgoing Events (GAA → Sonic Shifter)

#### `gaa:coherence:update`
**Frequency:** Every 2-5 seconds (throttled)
**Purpose:** Feedback for audio modulation

```typescript
{
  type: 'gaa:coherence:update',
  payload: {
    coherenceIndex: 0.85,        // 0-1 (GAA calculated)
    gainModulation: 1.35,        // 0.5-2.0 (amplitude multiplier)
    phaseShift: 0.12,           // Radians (phase adjustment)
    recommendation: 'Excellent coherence - maintain this state'
  }
}
```

**Feedback Logic:**
- `coherenceIndex > 0.8`: `gainModulation` = 1.0-1.5 (amplify)
- `coherenceIndex < 0.4`: `gainModulation` = 0.5-0.8 (reduce)
- `phaseShift`: Applied to encourage harmonic alignment

#### `gaa:bridge:ready`
GAA initialization complete

#### `gaa:coherence:response`
Response to coherence requests with historical data

## Coherence Analysis

The integration calculates coherence based on four factors:

### 1. Frequency Stability (30%)
Measures consistency of frequency over time using coefficient of variation.

### 2. Harmonic Alignment (35%)
Evaluates alignment with sacred ratios:
- Phi (φ = 1.618)
- Golden ratio multiples
- Fibonacci sequence ratios

### 3. Amplitude Consistency (20%)
Tracks consistency of signal amplitude.

### 4. Phase Coherence (15%)
Analyzes phase relationships for stability.

**Formula:**
```
coherence = stability × 0.30 + alignment × 0.35 + amplitude × 0.20 + phase × 0.15
```

Result is smoothed using exponential smoothing (α = 0.3).

## Session Management

### Starting a Session

```typescript
integration.startListening();

// Emit session start
const event = new CustomEvent('gaa:session:start', {
  detail: {
    payload: {
      userId: 'user-123',
      sessionId: 'session-456',
      mode: 'collective'
    }
  }
});
window.GlobalEventHorizon.dispatchEvent(event);
```

### Ending a Session

```typescript
const event = new CustomEvent('gaa:session:end', {
  detail: {
    payload: {
      sessionId: 'session-456'
    }
  }
});
window.GlobalEventHorizon.dispatchEvent(event);

integration.stopListening();
```

## Collective Mode

When `mode: 'collective'`, the integration:

1. **Aggregates coherence** across multiple users
2. **Calculates group harmonic resonance**
3. **Provides collective feedback** based on group synchronization
4. **Tracks participant alignment**

```typescript
const collectiveCoherence = calculateCollectiveCoherence();
// Combines average coherence (70%) + synchronization (30%)
```

## Data Storage

All coherence data is automatically stored in Supabase:

### Database Schema

```sql
CREATE TABLE sonic_coherence_history (
  id uuid PRIMARY KEY,
  user_id text NOT NULL,
  session_id text NOT NULL,
  frequency_hz numeric NOT NULL,
  coherence_index numeric NOT NULL CHECK (0 <= coherence_index <= 1),
  amplitude numeric NOT NULL CHECK (0 <= amplitude <= 1),
  timestamp timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

### Querying History

```typescript
const history = await integration.getCoherenceHistory('user-123');

// Returns CoherenceData[]
interface CoherenceData {
  id: string;
  userId: string;
  sessionId: string;
  frequencyHz: number;
  coherenceIndex: number;
  amplitude: number;
  timestamp: Date;
}
```

## API Reference

### `SonicGAAIntegration` Class

```typescript
class SonicGAAIntegration {
  startListening(): void;
  stopListening(): void;

  calculateCoherence(data: SonicHarmonicData, userId?: string): number;
  sendFeedback(coherenceIndex: number): void;

  getCoherenceHistory(userId: string): Promise<CoherenceData[]>;
  getRealtimeCoherence(userId: string): number | null;
  getCurrentSessionId(): string | null;
}
```

### `useSonicIntegration` Hook

```typescript
const {
  state: SonicIntegrationState,
  startListening: () => void,
  stopListening: () => void,
  fetchHistory: () => Promise<void>,
  requestCoherence: () => void,
  sendManualFeedback: (coherence: number) => void,
  integration: SonicGAAIntegration | null
} = useSonicIntegration(options);
```

## Performance Considerations

- **Data Rate**: Sonic Shifter sends data at ~60 fps
- **Feedback Rate**: GAA responds every 2-5 seconds (throttled)
- **History Buffer**: Maintains last 100 readings in memory
- **Smoothing**: Exponential smoothing prevents erratic feedback
- **Database**: Writes throttled to every 3 seconds

## Security

- **Row Level Security (RLS)** enabled on all tables
- Users can only read/write their own coherence data
- Service role can access all data for analytics
- No sensitive data transmitted in events

## Integration Example

Here's a complete example integrating both modules:

```typescript
import { SonicIntegrationMonitor, useSonicIntegration } from '@gaa/core';

function HarmonicSyncApp() {
  const userId = 'user-123';
  const sessionId = 'session-' + Date.now();

  const {
    state,
    startListening,
    stopListening,
    fetchHistory
  } = useSonicIntegration({
    userId,
    sessionId,
    autoStart: true,
    mode: 'collective'
  });

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="app">
      <SonicIntegrationMonitor
        userId={userId}
        sessionId={sessionId}
        mode="collective"
        theme="dark"
      />

      {state.isConnected && (
        <div className="status">
          <h3>Current Coherence: {(state.currentCoherence * 100).toFixed(1)}%</h3>
          {state.lastFeedback?.recommendation && (
            <p>{state.lastFeedback.recommendation}</p>
          )}
        </div>
      )}
    </div>
  );
}
```

## Troubleshooting

### Events Not Received
- Verify `GlobalEventHorizon` is initialized
- Check browser console for event dispatching
- Ensure `startListening()` was called

### No Feedback Sent
- Check that data is being received (60 fps)
- Verify 2-5 second throttle interval
- Confirm userId is provided

### Database Errors
- Verify Supabase connection
- Check RLS policies
- Ensure user is authenticated

## Future Enhancements

- [ ] Add WebRTC for peer-to-peer collective sync
- [ ] Implement ML-based coherence prediction
- [ ] Add visualization of harmonic field topology
- [ ] Support multi-device biometric fusion
- [ ] Real-time akashic record replay

## Support

For questions or issues, contact the Sacred Shifter development team.
