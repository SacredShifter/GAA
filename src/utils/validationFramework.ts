import type { BiometricReading } from './biometricMonitor';
import type { CollectiveWaveFunction } from './quantumCoherenceEngine';
import type { AIInsight } from './aiJourneyOrchestrator';

export interface ValidationMetrics {
  timestamp: number;
  testType: string;
  participants: number;
  results: ValidationResult[];
  overallScore: number;
  confidence: number;
}

export interface ValidationResult {
  metric: string;
  expected: number | string | boolean;
  actual: number | string | boolean;
  error?: number;
  passed: boolean;
  notes?: string;
}

export interface BiometricAccuracyTest {
  testName: string;
  participantId: string;
  ourHR: number;
  referenceHR: number;
  ourHRV: number;
  referenceHRV: number;
  ourCoherence: number;
  referenceCoherence: number;
  timestampMs: number;
}

export interface SynchronizationTest {
  testName: string;
  sessionType: 'synchronized' | 'control';
  participants: number;
  avgCollectiveCoherence: number;
  coherenceStability: number;
  phaseSynchrony: number;
  entanglementCount: number;
  duration: number;
  timestampMs: number;
}

export interface AIPredictionTest {
  testName: string;
  timestampMs: number;
  predictedCoherence: number;
  actualCoherence: number;
  predictionError: number;
  predictedFrequency: number;
  actualFrequency: number;
  frequencyError: number;
  confidence: number;
}

export interface VotingValidationTest {
  testName: string;
  intentions: Array<{
    id: string;
    text: string;
    votes: Array<{ userId: string; coherence: number }>;
    expectedWinner: boolean;
  }>;
  actualWinner: string;
  expectedWinner: string;
  passed: boolean;
}

export class ValidationFramework {
  private biometricTests: BiometricAccuracyTest[] = [];
  private syncTests: SynchronizationTest[] = [];
  private aiTests: AIPredictionTest[] = [];
  private votingTests: VotingValidationTest[] = [];

  logBiometricAccuracy(test: BiometricAccuracyTest): void {
    this.biometricTests.push(test);
  }

  logSynchronizationTest(test: SynchronizationTest): void {
    this.syncTests.push(test);
  }

  logAIPrediction(test: AIPredictionTest): void {
    this.aiTests.push(test);
  }

  logVotingTest(test: VotingValidationTest): void {
    this.votingTests.push(test);
  }

  calculateBiometricAccuracy(): ValidationMetrics {
    const results: ValidationResult[] = [];

    const hrErrors = this.biometricTests.map((t) => Math.abs(t.ourHR - t.referenceHR));
    const avgHRError = hrErrors.reduce((sum, e) => sum + e, 0) / hrErrors.length;
    const maxAcceptableHRError = 5;

    results.push({
      metric: 'Heart Rate Accuracy',
      expected: `±${maxAcceptableHRError} BPM`,
      actual: avgHRError.toFixed(2),
      error: avgHRError,
      passed: avgHRError <= maxAcceptableHRError,
      notes: `Average error across ${hrErrors.length} measurements`,
    });

    const hrvErrors = this.biometricTests
      .filter((t) => t.ourHRV > 0 && t.referenceHRV > 0)
      .map((t) => Math.abs(t.ourHRV - t.referenceHRV) / t.referenceHRV);

    const avgHRVErrorPct = (hrvErrors.reduce((sum, e) => sum + e, 0) / hrvErrors.length) * 100;
    const maxAcceptableHRVError = 15;

    results.push({
      metric: 'HRV Accuracy',
      expected: `±${maxAcceptableHRVError}%`,
      actual: `${avgHRVErrorPct.toFixed(1)}%`,
      error: avgHRVErrorPct,
      passed: avgHRVErrorPct <= maxAcceptableHRVError,
      notes: `Relative error across ${hrvErrors.length} measurements`,
    });

    const coherenceTests = this.biometricTests.filter(
      (t) => t.ourCoherence > 0 && t.referenceCoherence > 0
    );
    const coherenceErrors = coherenceTests.map((t) =>
      Math.abs(t.ourCoherence - t.referenceCoherence)
    );
    const avgCoherenceError =
      coherenceErrors.reduce((sum, e) => sum + e, 0) / coherenceErrors.length;
    const maxAcceptableCoherenceError = 0.15;

    results.push({
      metric: 'Coherence Score Accuracy',
      expected: `±${maxAcceptableCoherenceError}`,
      actual: avgCoherenceError.toFixed(3),
      error: avgCoherenceError,
      passed: avgCoherenceError <= maxAcceptableCoherenceError,
      notes: `Absolute error across ${coherenceErrors.length} measurements`,
    });

    const passedCount = results.filter((r) => r.passed).length;
    const overallScore = (passedCount / results.length) * 100;
    const confidence = this.calculateConfidence(this.biometricTests.length, 10);

    return {
      timestamp: Date.now(),
      testType: 'Biometric Accuracy',
      participants: new Set(this.biometricTests.map((t) => t.participantId)).size,
      results,
      overallScore,
      confidence,
    };
  }

  calculateSynchronizationEffectiveness(): ValidationMetrics {
    const results: ValidationResult[] = [];

    const syncSessions = this.syncTests.filter((t) => t.sessionType === 'synchronized');
    const controlSessions = this.syncTests.filter((t) => t.sessionType === 'control');

    if (syncSessions.length === 0 || controlSessions.length === 0) {
      return {
        timestamp: Date.now(),
        testType: 'Synchronization Effectiveness',
        participants: 0,
        results: [
          {
            metric: 'Data Availability',
            expected: 'Both synchronized and control sessions',
            actual: 'Insufficient data',
            passed: false,
            notes: `Sync: ${syncSessions.length}, Control: ${controlSessions.length}`,
          },
        ],
        overallScore: 0,
        confidence: 0,
      };
    }

    const avgSyncCoherence =
      syncSessions.reduce((sum, s) => sum + s.avgCollectiveCoherence, 0) / syncSessions.length;
    const avgControlCoherence =
      controlSessions.reduce((sum, s) => sum + s.avgCollectiveCoherence, 0) /
      controlSessions.length;
    const coherenceImprovement = ((avgSyncCoherence - avgControlCoherence) / avgControlCoherence) * 100;

    results.push({
      metric: 'Collective Coherence Improvement',
      expected: '>20% improvement vs control',
      actual: `${coherenceImprovement.toFixed(1)}%`,
      error: Math.abs(coherenceImprovement - 20),
      passed: coherenceImprovement > 20,
      notes: `Sync: ${avgSyncCoherence.toFixed(3)}, Control: ${avgControlCoherence.toFixed(3)}`,
    });

    const avgSyncStability =
      syncSessions.reduce((sum, s) => sum + s.coherenceStability, 0) / syncSessions.length;
    const avgControlStability =
      controlSessions.reduce((sum, s) => sum + s.coherenceStability, 0) / controlSessions.length;
    const stabilityImprovement = avgSyncStability - avgControlStability;

    results.push({
      metric: 'Coherence Stability Improvement',
      expected: '>0.1 improvement vs control',
      actual: stabilityImprovement.toFixed(3),
      error: stabilityImprovement,
      passed: stabilityImprovement > 0.1,
      notes: `Higher stability indicates more sustained coherence`,
    });

    const avgSyncPhase =
      syncSessions.reduce((sum, s) => sum + s.phaseSynchrony, 0) / syncSessions.length;
    const avgControlPhase =
      controlSessions.reduce((sum, s) => sum + s.phaseSynchrony, 0) / controlSessions.length;
    const phaseImprovement = ((avgSyncPhase - avgControlPhase) / (avgControlPhase + 0.01)) * 100;

    results.push({
      metric: 'Phase Synchrony Improvement',
      expected: '>50% improvement vs control',
      actual: `${phaseImprovement.toFixed(1)}%`,
      error: Math.abs(phaseImprovement - 50),
      passed: phaseImprovement > 50,
      notes: `Measures temporal alignment of participants`,
    });

    const avgSyncEntanglement =
      syncSessions.reduce((sum, s) => sum + s.entanglementCount, 0) / syncSessions.length;
    const avgControlEntanglement =
      controlSessions.reduce((sum, s) => sum + s.entanglementCount, 0) / controlSessions.length;

    results.push({
      metric: 'Entanglement Formation Rate',
      expected: '>2x control rate',
      actual: `${(avgSyncEntanglement / (avgControlEntanglement + 0.1)).toFixed(2)}x`,
      error: avgSyncEntanglement - avgControlEntanglement * 2,
      passed: avgSyncEntanglement > avgControlEntanglement * 2,
      notes: `Sync: ${avgSyncEntanglement.toFixed(1)}, Control: ${avgControlEntanglement.toFixed(1)} entanglements`,
    });

    const passedCount = results.filter((r) => r.passed).length;
    const overallScore = (passedCount / results.length) * 100;
    const confidence = this.calculateConfidence(
      Math.min(syncSessions.length, controlSessions.length),
      5
    );

    return {
      timestamp: Date.now(),
      testType: 'Synchronization Effectiveness',
      participants: Math.max(
        ...this.syncTests.map((t) => t.participants),
        0
      ),
      results,
      overallScore,
      confidence,
    };
  }

  calculateAIPredictionAccuracy(): ValidationMetrics {
    const results: ValidationResult[] = [];

    if (this.aiTests.length === 0) {
      return {
        timestamp: Date.now(),
        testType: 'AI Prediction Accuracy',
        participants: 0,
        results: [
          {
            metric: 'Data Availability',
            expected: 'AI prediction samples',
            actual: 'No predictions logged',
            passed: false,
          },
        ],
        overallScore: 0,
        confidence: 0,
      };
    }

    const coherenceErrors = this.aiTests.map((t) => t.predictionError);
    const rmseCoherence = Math.sqrt(
      coherenceErrors.reduce((sum, e) => sum + e * e, 0) / coherenceErrors.length
    );
    const maxAcceptableRMSE = 0.2;

    results.push({
      metric: 'Coherence Prediction RMSE',
      expected: `<${maxAcceptableRMSE}`,
      actual: rmseCoherence.toFixed(3),
      error: rmseCoherence,
      passed: rmseCoherence < maxAcceptableRMSE,
      notes: `Root Mean Square Error across ${this.aiTests.length} predictions`,
    });

    const frequencyErrors = this.aiTests.map((t) => t.frequencyError);
    const rmseFrequency = Math.sqrt(
      frequencyErrors.reduce((sum, e) => sum + e * e, 0) / frequencyErrors.length
    );
    const maxAcceptableFreqRMSE = 50;

    results.push({
      metric: 'Frequency Prediction RMSE',
      expected: `<${maxAcceptableFreqRMSE} Hz`,
      actual: `${rmseFrequency.toFixed(1)} Hz`,
      error: rmseFrequency,
      passed: rmseFrequency < maxAcceptableFreqRMSE,
      notes: `Frequency prediction accuracy`,
    });

    const highConfidenceTests = this.aiTests.filter((t) => t.confidence > 0.8);
    const highConfErrors = highConfidenceTests.map((t) => Math.abs(t.predictionError));
    const avgHighConfError =
      highConfErrors.reduce((sum, e) => sum + e, 0) / highConfErrors.length;
    const maxHighConfError = 0.1;

    results.push({
      metric: 'High Confidence Prediction Accuracy',
      expected: `<${maxHighConfError} error when confidence >0.8`,
      actual: avgHighConfError.toFixed(3),
      error: avgHighConfError,
      passed: avgHighConfError < maxHighConfError,
      notes: `${highConfidenceTests.length} high-confidence predictions`,
    });

    const passedCount = results.filter((r) => r.passed).length;
    const overallScore = (passedCount / results.length) * 100;
    const confidence = this.calculateConfidence(this.aiTests.length, 20);

    return {
      timestamp: Date.now(),
      testType: 'AI Prediction Accuracy',
      participants: 0,
      results,
      overallScore,
      confidence,
    };
  }

  calculateVotingCorrectness(): ValidationMetrics {
    const results: ValidationResult[] = [];

    if (this.votingTests.length === 0) {
      return {
        timestamp: Date.now(),
        testType: 'Voting Algorithm Correctness',
        participants: 0,
        results: [
          {
            metric: 'Data Availability',
            expected: 'Voting test cases',
            actual: 'No tests logged',
            passed: false,
          },
        ],
        overallScore: 0,
        confidence: 0,
      };
    }

    const correctVotes = this.votingTests.filter((t) => t.passed).length;
    const totalVotes = this.votingTests.length;
    const accuracy = (correctVotes / totalVotes) * 100;

    results.push({
      metric: 'Voting Algorithm Correctness',
      expected: '100% correct winner selection',
      actual: `${accuracy.toFixed(1)}%`,
      error: 100 - accuracy,
      passed: accuracy === 100,
      notes: `${correctVotes}/${totalVotes} tests passed`,
    });

    const passedCount = results.filter((r) => r.passed).length;
    const overallScore = (passedCount / results.length) * 100;
    const confidence = this.calculateConfidence(this.votingTests.length, 5);

    return {
      timestamp: Date.now(),
      testType: 'Voting Algorithm Correctness',
      participants: 0,
      results,
      overallScore,
      confidence,
    };
  }

  private calculateConfidence(sampleSize: number, minRequired: number): number {
    if (sampleSize < minRequired) {
      return (sampleSize / minRequired) * 0.5;
    }

    const confidenceBoost = Math.min((sampleSize - minRequired) / (minRequired * 2), 0.3);
    return 0.7 + confidenceBoost;
  }

  generateFullReport(): {
    generatedAt: number;
    summary: string;
    metrics: ValidationMetrics[];
    untestableClaims: UnverifiableClaim[];
    dataExport: {
      biometricTests: BiometricAccuracyTest[];
      syncTests: SynchronizationTest[];
      aiTests: AIPredictionTest[];
      votingTests: VotingValidationTest[];
    };
  } {
    const metrics = [
      this.calculateBiometricAccuracy(),
      this.calculateSynchronizationEffectiveness(),
      this.calculateAIPredictionAccuracy(),
      this.calculateVotingCorrectness(),
    ];

    const overallScore =
      metrics.reduce((sum, m) => sum + m.overallScore * m.confidence, 0) /
      metrics.reduce((sum, m) => sum + m.confidence, 0);

    const summary = this.generateSummaryText(metrics, overallScore);
    const untestableClaims = this.identifyUntestableClaims();

    return {
      generatedAt: Date.now(),
      summary,
      metrics,
      untestableClaims,
      dataExport: {
        biometricTests: this.biometricTests,
        syncTests: this.syncTests,
        aiTests: this.aiTests,
        votingTests: this.votingTests,
      },
    };
  }

  private generateSummaryText(metrics: ValidationMetrics[], overallScore: number): string {
    const biometric = metrics.find((m) => m.testType === 'Biometric Accuracy');
    const sync = metrics.find((m) => m.testType === 'Synchronization Effectiveness');
    const ai = metrics.find((m) => m.testType === 'AI Prediction Accuracy');
    const voting = metrics.find((m) => m.testType === 'Voting Algorithm Correctness');

    return `
VALIDATION REPORT SUMMARY
=========================

Overall System Score: ${overallScore.toFixed(1)}% (Confidence-weighted)

Biometric Accuracy: ${biometric?.overallScore.toFixed(1)}% (${(biometric?.confidence || 0) * 100}% confidence)
- Tests conducted: ${biometric?.results.length || 0}
- Participants: ${biometric?.participants || 0}

Synchronization Effectiveness: ${sync?.overallScore.toFixed(1)}% (${(sync?.confidence || 0) * 100}% confidence)
- Sessions analyzed: ${this.syncTests.length}
- Participants: ${sync?.participants || 0}

AI Prediction Accuracy: ${ai?.overallScore.toFixed(1)}% (${(ai?.confidence || 0) * 100}% confidence)
- Predictions tested: ${this.aiTests.length}

Voting Correctness: ${voting?.overallScore.toFixed(1)}% (${(voting?.confidence || 0) * 100}% confidence)
- Test cases: ${this.votingTests.length}

INTERPRETATION:
${overallScore > 80 ? '✓ System performs at production-grade standards' : overallScore > 60 ? '⚠ System shows promise but needs refinement' : '✗ System requires significant improvement'}

NOTE: See untestable claims section for theoretical features without measurable validation.
    `.trim();
  }

  private identifyUntestableClaims(): UnverifiableClaim[] {
    return [
      {
        claim: 'Quantum Entanglement Between Participants',
        description:
          'Wave function correlation described as "entanglement" is a mathematical metaphor, not quantum mechanical entanglement',
        testability: 'untestable',
        reason:
          'True quantum entanglement requires subatomic particles in superposition. Our system uses classical correlation metrics.',
        recommendedFraming:
          'High correlation between participant states (correlation coefficient > 0.7)',
        measurableAlternative: 'Pearson correlation coefficient between biometric time series',
      },
      {
        claim: 'Quantum Wave Function Collapse',
        description: 'System "collapses" to target frequency through democratic voting',
        testability: 'partially-testable',
        reason:
          'The algorithmic transition to target frequency is testable, but "collapse" terminology implies quantum mechanics',
        recommendedFraming: 'Frequency convergence algorithm triggered by vote outcome',
        measurableAlternative: 'Time to reach target frequency ±5 Hz after vote completion',
      },
      {
        claim: 'Non-Local Influence Propagation',
        description: 'High-coherence users influence distant low-coherence users',
        testability: 'testable-with-proper-protocol',
        reason:
          'Requires controlled experiment isolating direct vs mediated influence pathways',
        recommendedFraming:
          'Correlation-based state coupling between participants through shared field',
        measurableAlternative:
          'Cross-correlation with lag analysis to detect influence direction and timing',
      },
      {
        claim: 'Quantum Tunneling for State Transitions',
        description: 'Spontaneous jumps to distant states without traversing intermediate',
        testability: 'untestable-quantum-mechanics',
        reason:
          'True quantum tunneling occurs at subatomic scale. Our algorithm is probabilistic state change.',
        recommendedFraming:
          'Stochastic state transition with exponential distance penalty',
        measurableAlternative:
          'Probability distribution of state changes vs distance in state space',
      },
      {
        claim: 'Collective Consciousness Field',
        description: 'Emergent field arising from participant interactions',
        testability: 'partially-testable',
        reason:
          '"Field" is a useful metaphor but not a physical field like electromagnetic',
        recommendedFraming:
          'Aggregated collective metrics computed from individual biometric states',
        measurableAlternative:
          'Time-series of computed metrics: avg coherence, phase synchrony, correlation network density',
      },
      {
        claim: 'Consciousness Quotient (CQ)',
        description: 'Composite metric of consciousness evolution',
        testability: 'testable-construct-validity',
        reason:
          'Requires validation against established psychometric measures of wellbeing, mindfulness, etc.',
        recommendedFraming: 'Engagement and coherence composite score',
        measurableAlternative:
          'Correlation with validated scales: MAAS (mindfulness), PANAS (affect), etc.',
      },
      {
        claim: 'Emergent Frequency Discovery',
        description: 'System autonomously discovers new consciousness technologies',
        testability: 'testable-with-criteria',
        reason:
          'Requires pre-registered criteria for what counts as "discovery" vs noise',
        recommendedFraming:
          'Detection of novel frequency combinations with sustained high coherence',
        measurableAlternative:
          'Statistical novelty detection: frequency combinations 2+ SD from historical mean with coherence >0.7',
      },
    ];
  }

  exportToJSON(): string {
    return JSON.stringify(this.generateFullReport(), null, 2);
  }

  exportToCSV(): { biometrics: string; sync: string; ai: string; voting: string } {
    const biometricsCSV = this.arrayToCSV(
      this.biometricTests,
      [
        'testName',
        'participantId',
        'ourHR',
        'referenceHR',
        'ourHRV',
        'referenceHRV',
        'ourCoherence',
        'referenceCoherence',
        'timestampMs',
      ]
    );

    const syncCSV = this.arrayToCSV(
      this.syncTests,
      [
        'testName',
        'sessionType',
        'participants',
        'avgCollectiveCoherence',
        'coherenceStability',
        'phaseSynchrony',
        'entanglementCount',
        'duration',
        'timestampMs',
      ]
    );

    const aiCSV = this.arrayToCSV(
      this.aiTests,
      [
        'testName',
        'timestampMs',
        'predictedCoherence',
        'actualCoherence',
        'predictionError',
        'predictedFrequency',
        'actualFrequency',
        'frequencyError',
        'confidence',
      ]
    );

    const votingCSV = this.votingTests
      .map(
        (t) =>
          `${t.testName},${t.actualWinner},${t.expectedWinner},${t.passed}`
      )
      .join('\n');

    return {
      biometrics: biometricsCSV,
      sync: syncCSV,
      ai: aiCSV,
      voting: `testName,actualWinner,expectedWinner,passed\n${votingCSV}`,
    };
  }

  private arrayToCSV(data: any[], columns: string[]): string {
    const header = columns.join(',');
    const rows = data.map((item) => columns.map((col) => item[col] || '').join(','));
    return `${header}\n${rows.join('\n')}`;
  }

  reset(): void {
    this.biometricTests = [];
    this.syncTests = [];
    this.aiTests = [];
    this.votingTests = [];
  }
}

export interface UnverifiableClaim {
  claim: string;
  description: string;
  testability: 'testable' | 'partially-testable' | 'untestable' | 'testable-with-proper-protocol' | 'untestable-quantum-mechanics' | 'testable-construct-validity' | 'testable-with-criteria';
  reason: string;
  recommendedFraming: string;
  measurableAlternative: string;
}

export const globalValidationFramework = new ValidationFramework();
