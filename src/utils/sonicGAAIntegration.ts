import { supabase } from '../lib/supabase';

export interface SonicHarmonicData {
  currentFrequency: number;
  amplitude: number;
  harmonicStack: number[];
  phase: number;
  coherenceIndex: number;
  timestamp: number;
  waveform: 'sine' | 'square' | 'sawtooth' | 'triangle';
}

export interface SonicEvent {
  type: string;
  sourceId: string;
  timestamp: string;
  payload: {
    sonicData: SonicHarmonicData;
    userId?: string;
    sessionId?: string;
    mode: 'individual' | 'collective';
  };
  essenceLabels: string[];
}

export interface CoherenceFeedback {
  coherenceIndex: number;
  gainModulation: number;
  phaseShift: number;
  recommendation?: string;
}

export interface CoherenceData {
  id: string;
  userId: string;
  sessionId: string;
  frequencyHz: number;
  coherenceIndex: number;
  amplitude: number;
  timestamp: Date;
}

interface CoherenceHistory {
  frequencies: number[];
  coherenceScores: number[];
  timestamps: number[];
  harmonicAlignments: number[];
}

const PHI = 1.618033988749895;
const GOLDEN_RATIO = PHI;
const SACRED_RATIOS = [1, PHI, PHI * PHI, 2, 3, 5, 8, 13];
const FEEDBACK_INTERVAL_MS = 3000;
const HISTORY_WINDOW_SIZE = 100;
const SMOOTHING_FACTOR = 0.3;

export class SonicGAAIntegration {
  private eventListeners: Map<string, (event: CustomEvent) => void> = new Map();
  private isListening = false;
  private coherenceHistory: Map<string, CoherenceHistory> = new Map();
  private lastFeedbackTime = 0;
  private smoothedCoherence = 0.5;
  private collectiveCoherence: Map<string, number> = new Map();
  private currentSessionId: string | null = null;

  constructor() {
    this.initializeEventBus();
  }

  private initializeEventBus(): void {
    if (typeof window === 'undefined') return;

    if (!(window as any).GlobalEventHorizon) {
      (window as any).GlobalEventHorizon = document.createElement('div');
    }
  }

  private getEventBus(): EventTarget {
    return (window as any).GlobalEventHorizon || document.createElement('div');
  }

  startListening(): void {
    if (this.isListening) return;
    this.isListening = true;

    this.subscribeTo('sonic:harmonic:data', this.handleHarmonicData.bind(this));
    this.subscribeTo('sonic:bridge:connected', this.handleBridgeConnected.bind(this));
    this.subscribeTo('sonic:bridge:disconnected', this.handleBridgeDisconnected.bind(this));
    this.subscribeTo('sonic:user:state', this.handleUserState.bind(this));
    this.subscribeTo('sonic:request:coherence', this.handleCoherenceRequest.bind(this));
    this.subscribeTo('gaa:session:start', this.handleSessionStart.bind(this));
    this.subscribeTo('gaa:session:end', this.handleSessionEnd.bind(this));

    console.log('SonicGAAIntegration: Started listening to Sonic Shifter events');
  }

  stopListening(): void {
    if (!this.isListening) return;
    this.isListening = false;

    const eventBus = this.getEventBus();
    this.eventListeners.forEach((listener, eventType) => {
      eventBus.removeEventListener(eventType, listener as EventListener);
    });
    this.eventListeners.clear();

    console.log('SonicGAAIntegration: Stopped listening to Sonic Shifter events');
  }

  private subscribeTo(eventType: string, handler: (event: CustomEvent) => void): void {
    const eventBus = this.getEventBus();
    const listener = (event: Event) => handler(event as CustomEvent);
    eventBus.addEventListener(eventType, listener as EventListener);
    this.eventListeners.set(eventType, listener);
  }

  private emit(eventType: string, payload: any): void {
    const eventBus = this.getEventBus();
    const event = new CustomEvent(eventType, {
      detail: {
        type: eventType,
        sourceId: 'gaa-core',
        timestamp: new Date().toISOString(),
        payload,
        essenceLabels: ['coherence', 'feedback', 'gaa'],
      },
    });
    eventBus.dispatchEvent(event);
  }

  private handleHarmonicData(event: CustomEvent): void {
    const sonicEvent = event.detail as SonicEvent;
    const { sonicData, userId, sessionId, mode } = sonicEvent.payload;

    if (!userId) {
      console.warn('SonicGAAIntegration: Received harmonic data without userId');
      return;
    }

    this.updateCoherenceHistory(userId, sonicData);

    const coherence = this.calculateCoherence(sonicData, userId);

    if (mode === 'collective') {
      this.collectiveCoherence.set(userId, coherence);
    }

    const now = Date.now();
    if (now - this.lastFeedbackTime >= FEEDBACK_INTERVAL_MS) {
      const finalCoherence = mode === 'collective'
        ? this.calculateCollectiveCoherence()
        : coherence;

      this.sendFeedback(finalCoherence);
      this.storeCoherenceData(userId, sessionId || this.currentSessionId || 'unknown', sonicData, finalCoherence);
      this.lastFeedbackTime = now;
    }
  }

  private handleBridgeConnected(event: CustomEvent): void {
    console.log('SonicGAAIntegration: Sonic Shifter bridge connected', event.detail);

    this.emit('gaa:bridge:ready', {
      status: 'ready',
      capabilities: ['coherence-analysis', 'feedback-modulation', 'collective-sync'],
    });
  }

  private handleBridgeDisconnected(event: CustomEvent): void {
    console.log('SonicGAAIntegration: Sonic Shifter bridge disconnected', event.detail);
    this.coherenceHistory.clear();
    this.collectiveCoherence.clear();
  }

  private handleUserState(event: CustomEvent): void {
    const { userId, intention, emotionalState } = event.detail.payload;
    console.log('SonicGAAIntegration: User state received', { userId, intention, emotionalState });
  }

  private handleCoherenceRequest(event: CustomEvent): void {
    const { userId } = event.detail.payload;
    const history = this.coherenceHistory.get(userId);

    if (history && history.coherenceScores.length > 0) {
      const avgCoherence = history.coherenceScores.reduce((a, b) => a + b, 0) / history.coherenceScores.length;

      this.emit('gaa:coherence:response', {
        userId,
        coherenceIndex: avgCoherence,
        historicalData: {
          count: history.coherenceScores.length,
          min: Math.min(...history.coherenceScores),
          max: Math.max(...history.coherenceScores),
          avg: avgCoherence,
        },
      });
    }
  }

  private handleSessionStart(event: CustomEvent): void {
    const { sessionId, userId } = event.detail.payload;
    this.currentSessionId = sessionId;
    console.log('SonicGAAIntegration: Session started', { sessionId, userId });

    if (userId) {
      this.coherenceHistory.set(userId, {
        frequencies: [],
        coherenceScores: [],
        timestamps: [],
        harmonicAlignments: [],
      });
    }
  }

  private handleSessionEnd(event: CustomEvent): void {
    const { sessionId } = event.detail.payload;
    console.log('SonicGAAIntegration: Session ended', { sessionId });
    this.currentSessionId = null;
  }

  calculateCoherence(harmonicData: SonicHarmonicData, userId?: string): number {
    const frequencyStability = this.calculateFrequencyStability(userId);
    const harmonicAlignment = this.calculateHarmonicAlignment(harmonicData.harmonicStack);
    const amplitudeConsistency = this.calculateAmplitudeConsistency(userId);
    const phaseCoherence = this.calculatePhaseCoherence(harmonicData.phase, userId);

    const weights = {
      stability: 0.3,
      alignment: 0.35,
      amplitude: 0.2,
      phase: 0.15,
    };

    const rawCoherence =
      frequencyStability * weights.stability +
      harmonicAlignment * weights.alignment +
      amplitudeConsistency * weights.amplitude +
      phaseCoherence * weights.phase;

    this.smoothedCoherence =
      SMOOTHING_FACTOR * rawCoherence +
      (1 - SMOOTHING_FACTOR) * this.smoothedCoherence;

    return Math.max(0, Math.min(1, this.smoothedCoherence));
  }

  private calculateFrequencyStability(userId?: string): number {
    if (!userId) return 0.5;

    const history = this.coherenceHistory.get(userId);
    if (!history || history.frequencies.length < 5) return 0.5;

    const recentFreqs = history.frequencies.slice(-20);
    const mean = recentFreqs.reduce((a, b) => a + b, 0) / recentFreqs.length;
    const variance = recentFreqs.reduce((sum, f) => sum + Math.pow(f - mean, 2), 0) / recentFreqs.length;
    const stdDev = Math.sqrt(variance);

    const coefficientOfVariation = mean > 0 ? stdDev / mean : 1;
    const stability = Math.max(0, 1 - coefficientOfVariation * 5);

    return stability;
  }

  private calculateHarmonicAlignment(harmonicStack: number[]): number {
    if (harmonicStack.length === 0) return 0;

    const fundamental = harmonicStack[0];
    if (fundamental === 0) return 0;

    let alignmentScore = 0;
    let totalWeight = 0;

    for (let i = 0; i < harmonicStack.length; i++) {
      const harmonic = harmonicStack[i];
      const ratio = harmonic / fundamental;

      const closestSacredRatio = SACRED_RATIOS.reduce((prev, curr) =>
        Math.abs(curr - ratio) < Math.abs(prev - ratio) ? curr : prev
      );

      const distance = Math.abs(ratio - closestSacredRatio);
      const alignment = Math.exp(-distance * 2);

      const weight = 1 / (i + 1);
      alignmentScore += alignment * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? alignmentScore / totalWeight : 0;
  }

  private calculateAmplitudeConsistency(userId?: string): number {
    if (!userId) return 0.5;

    const history = this.coherenceHistory.get(userId);
    if (!history || history.coherenceScores.length < 5) return 0.5;

    const recentScores = history.coherenceScores.slice(-20);
    const mean = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    const variance = recentScores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / recentScores.length;
    const stdDev = Math.sqrt(variance);

    const consistency = Math.max(0, 1 - stdDev * 2);
    return consistency;
  }

  private calculatePhaseCoherence(currentPhase: number, userId?: string): number {
    if (!userId) return 0.5;

    const history = this.coherenceHistory.get(userId);
    if (!history || history.timestamps.length < 2) return 0.5;

    const expectedPhase = (currentPhase % (2 * Math.PI)) / (2 * Math.PI);
    const phaseCoherence = Math.cos(expectedPhase * Math.PI * 2) * 0.5 + 0.5;

    return phaseCoherence;
  }

  private calculateCollectiveCoherence(): number {
    if (this.collectiveCoherence.size === 0) return 0.5;

    const coherences = Array.from(this.collectiveCoherence.values());
    const avgCoherence = coherences.reduce((a, b) => a + b, 0) / coherences.length;

    const variance = coherences.reduce(
      (sum, c) => sum + Math.pow(c - avgCoherence, 2),
      0
    ) / coherences.length;
    const synchronization = Math.max(0, 1 - variance * 2);

    const groupResonance = avgCoherence * 0.7 + synchronization * 0.3;

    return Math.max(0, Math.min(1, groupResonance));
  }

  sendFeedback(coherenceIndex: number): void {
    const gainModulation = this.calculateGainModulation(coherenceIndex);
    const phaseShift = this.calculatePhaseShift(coherenceIndex);
    const recommendation = this.generateRecommendation(coherenceIndex);

    const feedback: CoherenceFeedback = {
      coherenceIndex,
      gainModulation,
      phaseShift,
      recommendation,
    };

    this.emit('gaa:coherence:update', feedback);
  }

  private calculateGainModulation(coherence: number): number {
    if (coherence > 0.8) {
      return 1.0 + (coherence - 0.8) * 2.5;
    } else if (coherence < 0.4) {
      return 0.5 + coherence * 0.75;
    } else {
      return 0.8 + coherence * 0.4;
    }
  }

  private calculatePhaseShift(coherence: number): number {
    if (coherence > 0.7) {
      return 0;
    }

    const phaseCorrection = (0.7 - coherence) * Math.PI / 4;
    return phaseCorrection;
  }

  private generateRecommendation(coherence: number): string | undefined {
    if (coherence > 0.85) {
      return 'Excellent coherence - maintain this state';
    } else if (coherence > 0.7) {
      return 'Good coherence - deepen your focus';
    } else if (coherence > 0.5) {
      return 'Moderate coherence - relax and breathe';
    } else if (coherence > 0.3) {
      return 'Low coherence - try slowing your breath';
    } else {
      return 'Very low coherence - take a moment to center';
    }
  }

  private updateCoherenceHistory(userId: string, data: SonicHarmonicData): void {
    let history = this.coherenceHistory.get(userId);

    if (!history) {
      history = {
        frequencies: [],
        coherenceScores: [],
        timestamps: [],
        harmonicAlignments: [],
      };
      this.coherenceHistory.set(userId, history);
    }

    history.frequencies.push(data.currentFrequency);
    history.coherenceScores.push(data.coherenceIndex);
    history.timestamps.push(data.timestamp);
    history.harmonicAlignments.push(
      this.calculateHarmonicAlignment(data.harmonicStack)
    );

    if (history.frequencies.length > HISTORY_WINDOW_SIZE) {
      history.frequencies.shift();
      history.coherenceScores.shift();
      history.timestamps.shift();
      history.harmonicAlignments.shift();
    }
  }

  private async storeCoherenceData(
    userId: string,
    sessionId: string,
    data: SonicHarmonicData,
    coherenceIndex: number
  ): Promise<void> {
    try {
      const { error } = await supabase.from('sonic_coherence_history').insert({
        user_id: userId,
        session_id: sessionId,
        frequency_hz: data.currentFrequency,
        coherence_index: coherenceIndex,
        amplitude: data.amplitude,
        timestamp: new Date(data.timestamp).toISOString(),
      });

      if (error) {
        console.error('Failed to store coherence data:', error);
      }
    } catch (error) {
      console.error('Error storing coherence data:', error);
    }
  }

  async getCoherenceHistory(userId: string): Promise<CoherenceData[]> {
    try {
      const { data, error } = await supabase
        .from('sonic_coherence_history')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Failed to fetch coherence history:', error);
        return [];
      }

      return (data || []).map((row) => ({
        id: row.id,
        userId: row.user_id,
        sessionId: row.session_id,
        frequencyHz: parseFloat(row.frequency_hz),
        coherenceIndex: parseFloat(row.coherence_index),
        amplitude: parseFloat(row.amplitude),
        timestamp: new Date(row.timestamp),
      }));
    } catch (error) {
      console.error('Error fetching coherence history:', error);
      return [];
    }
  }

  getRealtimeCoherence(userId: string): number | null {
    return this.collectiveCoherence.get(userId) || null;
  }

  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }
}
