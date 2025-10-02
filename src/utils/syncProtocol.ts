export interface SyncConfig {
  sessionId: string;
  bar0EpochMs: number;
  bpm: number;
  beatsPerBar: number;
  f0: number;
  ratios: number[];
  binauralHz?: number;
  sweep?: {
    type: 'linear' | 'exp';
    from: number;
    to: number;
    durationMs: number;
  };
  waveform: 'sine' | 'triangle' | 'square' | 'sawtooth';
  geometricPack?: string;
}

export interface BarMark {
  barIndex: number;
  barEpochMs: number;
}

export interface SyncMessage {
  type: 'SYNC_CONFIG' | 'BAR_MARK' | 'HEARTBEAT';
  payload: SyncConfig | BarMark | { userId: string };
  timestamp: number;
}

export class TempoGrid {
  private bpm: number;
  private beatsPerBar: number;
  private bar0EpochMs: number;

  constructor(bpm: number, beatsPerBar: number, bar0EpochMs: number) {
    this.bpm = bpm;
    this.beatsPerBar = beatsPerBar;
    this.bar0EpochMs = bar0EpochMs;
  }

  getBarLengthMs(): number {
    const beatLengthMs = 60000 / this.bpm;
    return beatLengthMs * this.beatsPerBar;
  }

  getBarLengthSec(): number {
    return this.getBarLengthMs() / 1000;
  }

  getBarIndexAtTime(serverEpochMs: number): number {
    const elapsedMs = serverEpochMs - this.bar0EpochMs;
    return Math.floor(elapsedMs / this.getBarLengthMs());
  }

  getBarStartTime(barIndex: number): number {
    return this.bar0EpochMs + (barIndex * this.getBarLengthMs());
  }

  getNextBarStartTime(serverEpochMs: number): number {
    const currentBar = this.getBarIndexAtTime(serverEpochMs);
    return this.getBarStartTime(currentBar + 1);
  }

  getCurrentBarProgress(serverEpochMs: number): number {
    const currentBar = this.getBarIndexAtTime(serverEpochMs);
    const barStartMs = this.getBarStartTime(currentBar);
    const elapsedInBar = serverEpochMs - barStartMs;
    return elapsedInBar / this.getBarLengthMs();
  }

  getTimeUntilNextBar(serverEpochMs: number): number {
    return this.getNextBarStartTime(serverEpochMs) - serverEpochMs;
  }
}

export function calculateSweepFactor(
  sweep: NonNullable<SyncConfig['sweep']>,
  elapsedMs: number
): number {
  const progress = Math.min(1, elapsedMs / sweep.durationMs);

  if (sweep.type === 'linear') {
    return sweep.from + (sweep.to - sweep.from) * progress;
  } else {
    const logFrom = Math.log(sweep.from);
    const logTo = Math.log(sweep.to);
    return Math.exp(logFrom + (logTo - logFrom) * progress);
  }
}

export function createSyncConfigMessage(config: SyncConfig): SyncMessage {
  return {
    type: 'SYNC_CONFIG',
    payload: config,
    timestamp: Date.now(),
  };
}

export function createBarMarkMessage(barIndex: number, barEpochMs: number): SyncMessage {
  return {
    type: 'BAR_MARK',
    payload: { barIndex, barEpochMs },
    timestamp: Date.now(),
  };
}

export function createHeartbeatMessage(userId: string): SyncMessage {
  return {
    type: 'HEARTBEAT',
    payload: { userId },
    timestamp: Date.now(),
  };
}
