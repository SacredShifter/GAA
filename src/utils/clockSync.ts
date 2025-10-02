import { supabase } from '../lib/supabase';

export interface ClockSyncResult {
  offsetMs: number;
  rttMs: number;
  samples: number;
  quality: 'good' | 'fair' | 'poor';
}

export interface TimingMeasurement {
  serverEpoch: number;
  clientSendTime: number;
  clientReceiveTime: number;
  rtt: number;
  offset: number;
}

async function pingServerTime(): Promise<TimingMeasurement> {
  const clientSendTime = performance.now();

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/epoch-time`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
    }
  );

  const clientReceiveTime = performance.now();
  const data = await response.json();

  const rtt = clientReceiveTime - clientSendTime;
  const estimatedServerTime = data.epoch + (rtt / 2);
  const clientEpochAtReceive = Date.now() - (performance.now() - clientReceiveTime);
  const offset = estimatedServerTime - clientEpochAtReceive;

  return {
    serverEpoch: data.epoch,
    clientSendTime,
    clientReceiveTime,
    rtt,
    offset,
  };
}

function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

export async function calibrateClock(samples: number = 9): Promise<ClockSyncResult> {
  const measurements: TimingMeasurement[] = [];

  for (let i = 0; i < samples; i++) {
    try {
      const measurement = await pingServerTime();
      measurements.push(measurement);
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (error) {
      console.warn('Clock sync ping failed:', error);
    }
  }

  if (measurements.length === 0) {
    throw new Error('Failed to calibrate clock: no successful measurements');
  }

  const rtts = measurements.map(m => m.rtt);
  const offsets = measurements.map(m => m.offset);

  const medianRtt = median(rtts);
  const medianOffset = median(offsets);

  const rttStdDev = Math.sqrt(
    rtts.reduce((sum, rtt) => sum + Math.pow(rtt - medianRtt, 2), 0) / rtts.length
  );

  let quality: 'good' | 'fair' | 'poor' = 'good';
  if (medianRtt > 100 || rttStdDev > 30) {
    quality = 'fair';
  }
  if (medianRtt > 200 || rttStdDev > 60) {
    quality = 'poor';
  }

  return {
    offsetMs: Math.round(medianOffset),
    rttMs: Math.round(medianRtt),
    samples: measurements.length,
    quality,
  };
}

export function serverEpochToContextTime(
  serverEpochMs: number,
  offsetMs: number,
  audioContext: AudioContext
): number {
  const localEpochMs = serverEpochMs - offsetMs;
  const deltaSec = (localEpochMs - Date.now()) / 1000;
  return audioContext.currentTime + deltaSec + (audioContext.baseLatency || 0);
}

export function contextTimeToServerEpoch(
  contextTime: number,
  offsetMs: number,
  audioContext: AudioContext
): number {
  const deltaSec = contextTime - audioContext.currentTime - (audioContext.baseLatency || 0);
  const localEpochMs = Date.now() + (deltaSec * 1000);
  return localEpochMs + offsetMs;
}

export class ClockSyncManager {
  private offsetMs: number = 0;
  private rttMs: number = 0;
  private quality: 'good' | 'fair' | 'poor' = 'good';
  private lastCalibration: number = 0;
  private recalibrationIntervalMs: number = 60000;
  private autoRecalibrationTimer: number | null = null;

  async initialize(): Promise<void> {
    const result = await calibrateClock(9);
    this.offsetMs = result.offsetMs;
    this.rttMs = result.rttMs;
    this.quality = result.quality;
    this.lastCalibration = Date.now();
  }

  async recalibrate(): Promise<void> {
    const result = await calibrateClock(5);
    this.offsetMs = result.offsetMs;
    this.rttMs = result.rttMs;
    this.quality = result.quality;
    this.lastCalibration = Date.now();
  }

  startAutoRecalibration(): void {
    this.stopAutoRecalibration();
    this.autoRecalibrationTimer = window.setInterval(() => {
      this.recalibrate().catch(console.error);
    }, this.recalibrationIntervalMs);
  }

  stopAutoRecalibration(): void {
    if (this.autoRecalibrationTimer !== null) {
      clearInterval(this.autoRecalibrationTimer);
      this.autoRecalibrationTimer = null;
    }
  }

  getServerTime(): number {
    return Date.now() + this.offsetMs;
  }

  toContextTime(serverEpochMs: number, audioContext: AudioContext): number {
    return serverEpochToContextTime(serverEpochMs, this.offsetMs, audioContext);
  }

  fromContextTime(contextTime: number, audioContext: AudioContext): number {
    return contextTimeToServerEpoch(contextTime, this.offsetMs, audioContext);
  }

  getOffset(): number {
    return this.offsetMs;
  }

  getRTT(): number {
    return this.rttMs;
  }

  getQuality(): 'good' | 'fair' | 'poor' {
    return this.quality;
  }

  getLastCalibrationAge(): number {
    return Date.now() - this.lastCalibration;
  }
}
