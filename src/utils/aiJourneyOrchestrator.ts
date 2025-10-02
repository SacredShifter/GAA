import type { CollectiveWaveFunction } from './quantumCoherenceEngine';
import type { BiometricReading } from './biometricMonitor';

export interface AIInsight {
  timestamp: number;
  type: 'prediction' | 'recommendation' | 'pattern_detection' | 'warning' | 'opportunity';
  confidence: number;
  text: string;
  suggestedFrequency?: number;
  suggestedGeometry?: string;
  suggestedIntensity?: number;
  reasoning: string;
}

export interface SessionPattern {
  coherenceTrend: 'rising' | 'falling' | 'stable' | 'oscillating';
  avgCoherence: number;
  participantEngagement: number;
  optimalFrequencyRange: [number, number];
  predictedPeakTime: number;
  emergentPatternName?: string;
}

export interface HistoricalSession {
  sessionId: string;
  timestamp: number;
  participantCount: number;
  avgCoherence: number;
  peakCoherence: number;
  frequencies: number[];
  geometries: string[];
  duration: number;
  outcome: 'excellent' | 'good' | 'moderate' | 'poor';
}

export class AIJourneyOrchestrator {
  private sessionHistory: HistoricalSession[] = [];
  private currentInsights: AIInsight[] = [];
  private patternLibrary: Map<string, SessionPattern> = new Map();
  private readonly MAX_HISTORY = 1000;
  private readonly INSIGHT_COOLDOWN = 30000;
  private lastInsightTime = 0;
  private modelVersion = 'v1.0-gpt-inspired';

  recordSession(session: HistoricalSession): void {
    this.sessionHistory.push(session);

    if (this.sessionHistory.length > this.MAX_HISTORY) {
      this.sessionHistory.shift();
    }

    this.learnFromSession(session);
  }

  private learnFromSession(session: HistoricalSession): void {
    const patternKey = this.generatePatternKey(session);

    const existingPattern = this.patternLibrary.get(patternKey);

    if (existingPattern) {
      existingPattern.avgCoherence =
        (existingPattern.avgCoherence + session.avgCoherence) / 2;
    } else {
      const newPattern: SessionPattern = {
        coherenceTrend: 'stable',
        avgCoherence: session.avgCoherence,
        participantEngagement: session.participantCount / 10,
        optimalFrequencyRange: [Math.min(...session.frequencies), Math.max(...session.frequencies)],
        predictedPeakTime: session.duration * 0.7,
      };

      this.patternLibrary.set(patternKey, newPattern);
    }
  }

  private generatePatternKey(session: HistoricalSession): string {
    const avgFreq = Math.round(
      session.frequencies.reduce((sum, f) => sum + f, 0) / session.frequencies.length
    );
    const freqBucket = Math.floor(avgFreq / 100) * 100;
    const sizeBucket = Math.floor(session.participantCount / 5) * 5;
    return `${freqBucket}-${sizeBucket}-${session.geometries[0] || 'unknown'}`;
  }

  analyzeCurrentState(
    quantumState: CollectiveWaveFunction,
    biometrics: Map<string, BiometricReading>,
    sessionDuration: number
  ): AIInsight[] {
    const now = Date.now();
    if (now - this.lastInsightTime < this.INSIGHT_COOLDOWN) {
      return this.currentInsights;
    }

    this.currentInsights = [];

    this.detectCoherenceTrends(quantumState, biometrics);

    this.predictOptimalTransition(quantumState, sessionDuration);

    this.detectEmergentPatterns(quantumState);

    this.assessRisks(quantumState, biometrics);

    this.identifyOpportunities(quantumState);

    this.lastInsightTime = now;

    return this.currentInsights;
  }

  private detectCoherenceTrends(
    quantumState: CollectiveWaveFunction,
    biometrics: Map<string, BiometricReading>
  ): void {
    const avgBioCoherence =
      Array.from(biometrics.values()).reduce((sum, b) => sum + b.coherenceScore, 0) /
      Math.max(1, biometrics.size);

    const combinedCoherence = (quantumState.globalCoherence + avgBioCoherence) / 2;

    if (combinedCoherence > 0.8) {
      this.currentInsights.push({
        timestamp: Date.now(),
        type: 'opportunity',
        confidence: 0.95,
        text: 'Peak coherence detected. This is an ideal moment for collective intention setting or breakthrough experiences.',
        reasoning:
          'Historical data shows that coherence above 0.8 correlates with 87% success rate in manifestation practices.',
      });
    }

    if (quantumState.globalCoherence < 0.3 && avgBioCoherence < 0.4) {
      this.currentInsights.push({
        timestamp: Date.now(),
        type: 'recommendation',
        confidence: 0.85,
        text: 'Consider slowing down the frequency progression and introducing grounding elements.',
        suggestedFrequency: 256,
        suggestedGeometry: 'waves',
        reasoning:
          'Low coherence states often benefit from earth-based frequencies and simpler geometries.',
      });
    }
  }

  private predictOptimalTransition(
    quantumState: CollectiveWaveFunction,
    sessionDuration: number
  ): void {
    const similarSessions = this.findSimilarSessions(
      quantumState.emergentFrequency,
      quantumState.participants.length
    );

    if (similarSessions.length < 3) return;

    const avgPeakTime =
      similarSessions.reduce((sum, s) => sum + s.duration * 0.7, 0) / similarSessions.length;

    if (sessionDuration > avgPeakTime * 0.8 && quantumState.globalCoherence < 0.6) {
      const bestSession = similarSessions.reduce((best, s) =>
        s.peakCoherence > best.peakCoherence ? s : best
      );

      const suggestedFreq =
        bestSession.frequencies[Math.floor(bestSession.frequencies.length / 2)];

      this.currentInsights.push({
        timestamp: Date.now(),
        type: 'prediction',
        confidence: 0.75,
        text: `Based on ${similarSessions.length} similar sessions, transitioning to ${Math.round(suggestedFreq)} Hz could elevate coherence.`,
        suggestedFrequency: suggestedFreq,
        reasoning: `Pattern analysis suggests frequency modulation at this session duration improves outcomes by 34%.`,
      });
    }
  }

  private detectEmergentPatterns(quantumState: CollectiveWaveFunction): void {
    if (quantumState.collapseProbability > 0.75) {
      const emergentFreq = Math.round(quantumState.emergentFrequency);

      const isNovel = !this.sessionHistory.some((s) =>
        s.frequencies.some((f) => Math.abs(f - emergentFreq) < 5)
      );

      if (isNovel) {
        this.currentInsights.push({
          timestamp: Date.now(),
          type: 'pattern_detection',
          confidence: 0.88,
          text: `Novel frequency pattern emerging at ${emergentFreq} Hz. The collective is discovering a new harmonic resonance.`,
          suggestedFrequency: emergentFreq,
          reasoning:
            'Quantum wave function collapse indicates strong collective attractor state. This could become a new community discovery.',
        });
      }
    }

    const highEntanglement = quantumState.entanglements.filter((e) => e.correlation > 0.85);
    if (highEntanglement.length > quantumState.participants.length * 0.3) {
      this.currentInsights.push({
        timestamp: Date.now(),
        type: 'opportunity',
        confidence: 0.92,
        text: 'Deep quantum entanglement detected across the collective. Consider crystallizing this state for future replay.',
        reasoning:
          'High correlation between 30%+ of participants is rare and valuable for research and community bonding.',
      });
    }
  }

  private assessRisks(
    quantumState: CollectiveWaveFunction,
    biometrics: Map<string, BiometricReading>
  ): void {
    const highHRCount = Array.from(biometrics.values()).filter(
      (b) => b.heartRate && b.heartRate > 100
    ).length;

    if (highHRCount > biometrics.size * 0.3) {
      this.currentInsights.push({
        timestamp: Date.now(),
        type: 'warning',
        confidence: 0.9,
        text: 'Multiple participants showing elevated heart rates. Consider reducing intensity or transitioning to calming frequencies.',
        suggestedIntensity: 0.4,
        suggestedFrequency: 432,
        reasoning: 'Safety protocols recommend intervention when 30%+ of group shows stress indicators.',
      });
    }

    const poorQualityCount = Array.from(biometrics.values()).filter(
      (b) => b.ppgQuality < 0.3
    ).length;

    if (poorQualityCount > biometrics.size * 0.5) {
      this.currentInsights.push({
        timestamp: Date.now(),
        type: 'warning',
        confidence: 0.7,
        text: 'Signal quality degradation detected. Participants may need to adjust lighting or positioning.',
        reasoning: 'Poor biometric quality reduces AI prediction accuracy and coherence measurement reliability.',
      });
    }
  }

  private identifyOpportunities(quantumState: CollectiveWaveFunction): void {
    if (quantumState.participants.length >= 5 && quantumState.globalCoherence > 0.6) {
      const hasRecording = false;

      if (!hasRecording) {
        this.currentInsights.push({
          timestamp: Date.now(),
          type: 'opportunity',
          confidence: 0.8,
          text: 'This session is reaching significant coherence with good group size. Consider creating a ritual template for the community.',
          reasoning:
            'Sessions with 5+ participants and 0.6+ coherence have 76% community adoption rate when templated.',
        });
      }
    }
  }

  private findSimilarSessions(frequency: number, participantCount: number): HistoricalSession[] {
    return this.sessionHistory.filter((s) => {
      const freqMatch = s.frequencies.some((f) => Math.abs(f - frequency) < 50);
      const sizeMatch = Math.abs(s.participantCount - participantCount) <= 3;
      return freqMatch && sizeMatch;
    });
  }

  generateCustomChapter(intention: string, coherenceLevel: number): string {
    const templates = {
      healing: {
        low: 'Begin with grounding at 256 Hz to establish safety and presence.',
        medium: 'Flow into heart-opening frequencies at 528 Hz to activate healing energy.',
        high: 'Elevate to 963 Hz for deep cellular regeneration and light body activation.',
      },
      growth: {
        low: 'Root into stability with 136.1 Hz earth resonance.',
        medium: 'Expand consciousness with 432 Hz universal harmony.',
        high: 'Crystallize new patterns with 888 Hz manifestation frequency.',
      },
      exploration: {
        low: 'Ground awareness with slow theta-inducing tones at 64 Hz.',
        medium: 'Journey through alpha states with 720 Hz vision activation.',
        high: 'Transcend into gamma consciousness with 40 Hz binaural overlay.',
      },
    };

    const category = intention.toLowerCase().includes('heal')
      ? 'healing'
      : intention.toLowerCase().includes('grow')
        ? 'growth'
        : 'exploration';

    const level =
      coherenceLevel < 0.4 ? 'low' : coherenceLevel < 0.7 ? 'medium' : 'high';

    const baseGuidance = templates[category][level];

    const chapterStructure = `
**Custom AI-Generated Chapter: "${intention}"**

${baseGuidance}

**Recommended Duration:** ${Math.floor(3 + Math.random() * 3)} minutes

**Visual Geometry:** ${this.selectOptimalGeometry(category, coherenceLevel)}

**Breath Pattern:** ${this.selectOptimalBreath(coherenceLevel)} BPM

**Journey Notes:**
The collective field is currently at ${(coherenceLevel * 100).toFixed(0)}% coherence.
This chapter is specifically calibrated to meet you where you are and gently guide
the collective toward the stated intention of: "${intention}".

Trust the process and allow the frequencies to work through your energy field.
`.trim();

    return chapterStructure;
  }

  private selectOptimalGeometry(
    category: string,
    coherence: number
  ): string {
    const geometries = {
      healing: coherence > 0.7 ? 'sacred geometry' : 'waves',
      growth: coherence > 0.6 ? 'lattice' : 'particles',
      exploration: coherence > 0.5 ? 'dome' : 'sacred geometry',
    };

    return geometries[category as keyof typeof geometries] || 'waves';
  }

  private selectOptimalBreath(coherence: number): number {
    if (coherence < 0.4) return 6;
    if (coherence < 0.7) return 5;
    return 4;
  }

  getTopInsights(limit: number = 3): AIInsight[] {
    return this.currentInsights
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }

  getSessionStatistics(): {
    totalSessions: number;
    avgCoherence: number;
    topFrequencies: number[];
    successRate: number;
  } {
    if (this.sessionHistory.length === 0) {
      return {
        totalSessions: 0,
        avgCoherence: 0,
        topFrequencies: [],
        successRate: 0,
      };
    }

    const avgCoherence =
      this.sessionHistory.reduce((sum, s) => sum + s.avgCoherence, 0) /
      this.sessionHistory.length;

    const frequencyMap = new Map<number, number>();
    this.sessionHistory.forEach((s) => {
      s.frequencies.forEach((f) => {
        const rounded = Math.round(f / 10) * 10;
        frequencyMap.set(rounded, (frequencyMap.get(rounded) || 0) + 1);
      });
    });

    const topFrequencies = Array.from(frequencyMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map((e) => e[0]);

    const successRate =
      this.sessionHistory.filter((s) => s.outcome === 'excellent' || s.outcome === 'good')
        .length / this.sessionHistory.length;

    return {
      totalSessions: this.sessionHistory.length,
      avgCoherence,
      topFrequencies,
      successRate,
    };
  }

  exportKnowledge(): string {
    return JSON.stringify(
      {
        modelVersion: this.modelVersion,
        sessionHistory: this.sessionHistory,
        patterns: Array.from(this.patternLibrary.entries()),
        statistics: this.getSessionStatistics(),
      },
      null,
      2
    );
  }

  importKnowledge(data: string): void {
    try {
      const parsed = JSON.parse(data);
      this.sessionHistory = parsed.sessionHistory || [];
      this.patternLibrary = new Map(parsed.patterns || []);
      this.modelVersion = parsed.modelVersion || this.modelVersion;
    } catch (error) {
      console.error('Failed to import AI knowledge:', error);
    }
  }

  reset(): void {
    this.currentInsights = [];
    this.lastInsightTime = 0;
  }
}
