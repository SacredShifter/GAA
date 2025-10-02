export interface QuantumState {
  userId: string;
  waveFunction: Complex[];
  phaseAngle: number;
  entanglementStrength: number;
  coherenceAmplitude: number;
  measurementProbability: number;
}

export interface Complex {
  real: number;
  imag: number;
}

export interface EntanglementPair {
  userA: string;
  userB: string;
  correlation: number;
  sharedPhase: number;
}

export interface CollectiveWaveFunction {
  timestamp: number;
  participants: string[];
  superpositionStates: Map<string, QuantumState>;
  entanglements: EntanglementPair[];
  globalCoherence: number;
  collapseProbability: number;
  emergentFrequency: number;
}

export class QuantumCoherenceEngine {
  private userStates: Map<string, QuantumState> = new Map();
  private entanglements: EntanglementPair[] = [];
  private hilbertDimension = 64;
  private readonly ENTANGLEMENT_THRESHOLD = 0.7;
  private readonly DECOHERENCE_RATE = 0.05;
  private lastUpdateTime = 0;

  initializeUserState(userId: string, initialCoherence: number = 0.5): QuantumState {
    const waveFunction = this.createInitialWaveFunction(initialCoherence);
    const state: QuantumState = {
      userId,
      waveFunction,
      phaseAngle: Math.random() * 2 * Math.PI,
      entanglementStrength: 0,
      coherenceAmplitude: initialCoherence,
      measurementProbability: this.calculateMeasurementProbability(waveFunction),
    };

    this.userStates.set(userId, state);
    return state;
  }

  updateUserCoherence(userId: string, newCoherence: number, frequency: number): void {
    const state = this.userStates.get(userId);
    if (!state) return;

    state.coherenceAmplitude = newCoherence;
    state.phaseAngle = (state.phaseAngle + (frequency / 1000) * Math.PI) % (2 * Math.PI);

    state.waveFunction = this.evolveWaveFunction(state.waveFunction, newCoherence, frequency);

    this.detectEntanglement(userId);

    this.userStates.set(userId, state);
  }

  private createInitialWaveFunction(coherence: number): Complex[] {
    const waveFunction: Complex[] = [];

    const coherentState = Math.floor(this.hilbertDimension * coherence);

    for (let i = 0; i < this.hilbertDimension; i++) {
      const distance = Math.abs(i - coherentState);
      const amplitude = Math.exp(-distance * distance / (2 * this.hilbertDimension));

      const phase = (i * 2 * Math.PI) / this.hilbertDimension;
      waveFunction.push({
        real: amplitude * Math.cos(phase),
        imag: amplitude * Math.sin(phase),
      });
    }

    return this.normalize(waveFunction);
  }

  private evolveWaveFunction(
    waveFunction: Complex[],
    coherence: number,
    frequency: number
  ): Complex[] {
    const evolved = waveFunction.map((psi, i) => {
      const energy = (i * frequency) / this.hilbertDimension;
      const timePhase = (energy * 0.001) % (2 * Math.PI);

      return {
        real: psi.real * Math.cos(timePhase) - psi.imag * Math.sin(timePhase),
        imag: psi.real * Math.sin(timePhase) + psi.imag * Math.cos(timePhase),
      };
    });

    const decoherence = 1 - this.DECOHERENCE_RATE * (1 - coherence);
    return this.normalize(
      evolved.map((psi) => ({
        real: psi.real * decoherence,
        imag: psi.imag * decoherence,
      }))
    );
  }

  private normalize(waveFunction: Complex[]): Complex[] {
    const norm = Math.sqrt(
      waveFunction.reduce((sum, psi) => sum + psi.real * psi.real + psi.imag * psi.imag, 0)
    );

    if (norm === 0) return waveFunction;

    return waveFunction.map((psi) => ({
      real: psi.real / norm,
      imag: psi.imag / norm,
    }));
  }

  private detectEntanglement(userId: string): void {
    const stateA = this.userStates.get(userId);
    if (!stateA) return;

    for (const [otherUserId, stateB] of this.userStates) {
      if (otherUserId === userId) continue;

      const correlation = this.calculateCorrelation(stateA, stateB);

      if (correlation > this.ENTANGLEMENT_THRESHOLD) {
        const existingPair = this.entanglements.find(
          (e) =>
            (e.userA === userId && e.userB === otherUserId) ||
            (e.userA === otherUserId && e.userB === userId)
        );

        const sharedPhase = (stateA.phaseAngle + stateB.phaseAngle) / 2;

        if (existingPair) {
          existingPair.correlation = correlation;
          existingPair.sharedPhase = sharedPhase;
        } else {
          this.entanglements.push({
            userA: userId,
            userB: otherUserId,
            correlation,
            sharedPhase,
          });
        }

        stateA.entanglementStrength = Math.max(stateA.entanglementStrength, correlation);
        stateB.entanglementStrength = Math.max(stateB.entanglementStrength, correlation);
      }
    }

    this.entanglements = this.entanglements.filter((e) => e.correlation > 0.5);
  }

  private calculateCorrelation(stateA: QuantumState, stateB: QuantumState): number {
    let correlation = 0;

    for (let i = 0; i < this.hilbertDimension; i++) {
      const psiA = stateA.waveFunction[i];
      const psiB = stateB.waveFunction[i];

      const product =
        psiA.real * psiB.real + psiA.imag * psiB.imag +
        psiA.real * psiB.imag - psiA.imag * psiB.real;

      correlation += product;
    }

    return Math.abs(correlation) / this.hilbertDimension;
  }

  calculateCollectiveWaveFunction(): CollectiveWaveFunction {
    const participants = Array.from(this.userStates.keys());

    if (participants.length === 0) {
      return {
        timestamp: Date.now(),
        participants: [],
        superpositionStates: new Map(),
        entanglements: [],
        globalCoherence: 0,
        collapseProbability: 0,
        emergentFrequency: 432,
      };
    }

    const collectiveWave = new Array(this.hilbertDimension).fill(null).map(() => ({
      real: 0,
      imag: 0,
    }));

    for (const state of this.userStates.values()) {
      for (let i = 0; i < this.hilbertDimension; i++) {
        collectiveWave[i].real += state.waveFunction[i].real;
        collectiveWave[i].imag += state.waveFunction[i].imag;
      }
    }

    const normalizedCollective = this.normalize(collectiveWave);

    const globalCoherence = this.calculateGlobalCoherence(normalizedCollective);

    const collapseProbability = this.calculateCollapseProbability();

    const emergentFrequency = this.calculateEmergentFrequency(normalizedCollective);

    return {
      timestamp: Date.now(),
      participants,
      superpositionStates: new Map(this.userStates),
      entanglements: [...this.entanglements],
      globalCoherence,
      collapseProbability,
      emergentFrequency,
    };
  }

  private calculateGlobalCoherence(collectiveWave: Complex[]): number {
    const amplitudes = collectiveWave.map((psi) =>
      Math.sqrt(psi.real * psi.real + psi.imag * psi.imag)
    );

    const maxAmplitude = Math.max(...amplitudes);
    const sumAmplitudes = amplitudes.reduce((sum, a) => sum + a, 0);

    const concentration = maxAmplitude / (sumAmplitudes / this.hilbertDimension);

    return Math.min(1, concentration / 10);
  }

  private calculateCollapseProbability(): number {
    const avgEntanglement =
      this.entanglements.reduce((sum, e) => sum + e.correlation, 0) /
        Math.max(1, this.entanglements.length);

    const participantCount = this.userStates.size;

    const maxEntanglements = (participantCount * (participantCount - 1)) / 2;
    const actualEntanglements = this.entanglements.length;

    const connectedness =
      maxEntanglements > 0 ? actualEntanglements / maxEntanglements : 0;

    return avgEntanglement * connectedness;
  }

  private calculateEmergentFrequency(collectiveWave: Complex[]): number {
    let weightedFrequency = 0;
    let totalWeight = 0;

    for (let i = 0; i < this.hilbertDimension; i++) {
      const amplitude = Math.sqrt(
        collectiveWave[i].real * collectiveWave[i].real +
          collectiveWave[i].imag * collectiveWave[i].imag
      );

      const frequency = 200 + (i * 800) / this.hilbertDimension;

      weightedFrequency += frequency * amplitude;
      totalWeight += amplitude;
    }

    return totalWeight > 0 ? weightedFrequency / totalWeight : 432;
  }

  private calculateMeasurementProbability(waveFunction: Complex[]): number {
    const probabilities = waveFunction.map(
      (psi) => psi.real * psi.real + psi.imag * psi.imag
    );

    const maxProbability = Math.max(...probabilities);

    return maxProbability;
  }

  collapseWaveFunction(targetFrequency: number): void {
    const targetState = Math.floor(
      ((targetFrequency - 200) / 800) * this.hilbertDimension
    );

    for (const [userId, state] of this.userStates) {
      const collapsedWave = new Array(this.hilbertDimension).fill(null).map((_, i) => {
        const distance = Math.abs(i - targetState);
        const amplitude = Math.exp(-distance * distance / 10);
        return {
          real: amplitude,
          imag: 0,
        };
      });

      state.waveFunction = this.normalize(collapsedWave);
      state.coherenceAmplitude = 1.0;
      state.measurementProbability = 1.0;

      this.userStates.set(userId, state);
    }
  }

  simulateQuantumTunneling(
    userId: string,
    targetState: number
  ): { success: boolean; newFrequency: number } {
    const state = this.userStates.get(userId);
    if (!state) return { success: false, newFrequency: 432 };

    const currentMaxIndex = state.waveFunction.reduce(
      (maxIdx, psi, idx, arr) => {
        const currentMax =
          arr[maxIdx].real * arr[maxIdx].real + arr[maxIdx].imag * arr[maxIdx].imag;
        const current = psi.real * psi.real + psi.imag * psi.imag;
        return current > currentMax ? idx : maxIdx;
      },
      0
    );

    const barrierHeight = Math.abs(targetState - currentMaxIndex);
    const tunnelingProbability = Math.exp(-barrierHeight / 10) * state.coherenceAmplitude;

    if (Math.random() < tunnelingProbability) {
      const tunneledWave = new Array(this.hilbertDimension).fill(null).map((_, i) => {
        const distance = Math.abs(i - targetState);
        const amplitude = Math.exp(-distance * distance / 5);
        return {
          real: amplitude,
          imag: 0,
        };
      });

      state.waveFunction = this.normalize(tunneledWave);
      const newFrequency = 200 + (targetState * 800) / this.hilbertDimension;

      return { success: true, newFrequency };
    }

    return { success: false, newFrequency: 432 };
  }

  applyNonLocalInfluence(sourceUserId: string, targetUserId: string, strength: number): void {
    const sourceState = this.userStates.get(sourceUserId);
    const targetState = this.userStates.get(targetUserId);

    if (!sourceState || !targetState) return;

    for (let i = 0; i < this.hilbertDimension; i++) {
      targetState.waveFunction[i].real =
        targetState.waveFunction[i].real * (1 - strength) +
        sourceState.waveFunction[i].real * strength;

      targetState.waveFunction[i].imag =
        targetState.waveFunction[i].imag * (1 - strength) +
        sourceState.waveFunction[i].imag * strength;
    }

    targetState.waveFunction = this.normalize(targetState.waveFunction);
  }

  removeUser(userId: string): void {
    this.userStates.delete(userId);
    this.entanglements = this.entanglements.filter(
      (e) => e.userA !== userId && e.userB !== userId
    );
  }

  getEntanglementNetwork(): { nodes: string[]; edges: EntanglementPair[] } {
    return {
      nodes: Array.from(this.userStates.keys()),
      edges: this.entanglements,
    };
  }

  reset(): void {
    this.userStates.clear();
    this.entanglements = [];
  }
}
