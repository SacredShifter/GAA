export interface GeometricFrequencyPack {
  name: string;
  description: string;
  ratios: number[];
  gains: number[];
}

export const GEOMETRIC_PACKS: Record<string, GeometricFrequencyPack> = {
  triangle: {
    name: 'Triangle',
    description: 'Three-fold harmony - stability and balance',
    ratios: [1, 3/2, 5/4],
    gains: [1.0, 0.5, 0.35],
  },
  square: {
    name: 'Square',
    description: 'Four-fold manifestation - grounding and structure',
    ratios: [1, 4/3, 3/2, 2],
    gains: [1.0, 0.5, 0.4, 0.3],
  },
  pentagon: {
    name: 'Pentagon',
    description: 'Five-fold golden ratio - natural harmony',
    ratios: [1, 3/2, 8/5, 2],
    gains: [1.0, 0.5, 0.4, 0.3],
  },
  flower: {
    name: 'Flower (6-petal)',
    description: 'Six-fold creation - life force energy',
    ratios: [1, 4/3, 3/2, 5/3, 2],
    gains: [1.0, 0.5, 0.45, 0.35, 0.3],
  },
  octave: {
    name: 'Pure Octave',
    description: 'Harmonic series - universal resonance',
    ratios: [1, 2, 3, 4, 5],
    gains: [1.0, 0.5, 0.35, 0.25, 0.2],
  },
};

export const BASE_FREQUENCIES = {
  C256: 256.0,
  A432: 432.0,
  A440: 440.0,
} as const;

export function calculateHarmonicStack(
  baseFrequency: number,
  ratios: number[],
  gains: number[]
): Array<{ frequency: number; gain: number }> {
  return ratios.map((ratio, index) => ({
    frequency: baseFrequency * ratio,
    gain: gains[index] || 0.2,
  }));
}

export function getGeometricPackByShape(shape: string): GeometricFrequencyPack {
  return GEOMETRIC_PACKS[shape] || GEOMETRIC_PACKS.octave;
}

export function centsToFrequencyRatio(cents: number): number {
  return Math.pow(2, cents / 1200);
}

export function frequencyRatioToCents(ratio: number): number {
  return 1200 * Math.log2(ratio);
}
