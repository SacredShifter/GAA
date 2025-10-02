export interface EgyptianChapter {
  id: string;
  chapter: string;
  description: string;
  audio: {
    base?: number;
    overlay?: number;
    stack?: number[];
    sweep?: number[];
    steps?: number[];
    tones?: number[];
    beat?: number;
    binaural?: number;
    wave?: number;
    underlay?: number;
    chant?: string;
    interval?: 'phi' | 'octave' | 'harmonic';
  };
  visual: {
    type: string;
    geometry: string;
    description: string;
  };
  breath: {
    pattern: string;
    bpm?: number;
    isochronic?: number;
  };
  duration: number;
}

export const EGYPTIAN_CODE_CHAPTERS: EgyptianChapter[] = [
  {
    id: 'seal_remembrance',
    chapter: 'Seal of Remembrance',
    description: 'Eye Awakens - The foundation of remembering',
    audio: {
      base: 256,
      overlay: 432,
    },
    visual: {
      type: 'expanding_circles',
      geometry: 'circle',
      description: 'Expanding concentric circles of wholeness',
    },
    breath: {
      pattern: 'slow inhale/exhale',
      bpm: 6,
    },
    duration: 120,
  },
  {
    id: 'breath_thoth',
    chapter: 'Breath of Thoth',
    description: 'The sacred Hu sound awakens divine wisdom',
    audio: {
      base: 136.1,
      chant: 'Hu',
      interval: 'harmonic',
    },
    visual: {
      type: 'fibonacci_spiral',
      geometry: 'spiral',
      description: 'Golden spiral unwinding with breath',
    },
    breath: {
      pattern: 'inhale/exhale with chant',
      bpm: 6,
      isochronic: 0.1,
    },
    duration: 180,
  },
  {
    id: 'solar_heart',
    chapter: 'Solar Heart',
    description: 'Ra - Awakening the heart center',
    audio: {
      base: 528,
      overlay: 316,
    },
    visual: {
      type: 'sunburst_rays',
      geometry: 'sunburst',
      description: 'Radiating golden rays from the heart',
    },
    breath: {
      pattern: 'heart coherence',
      bpm: 6,
    },
    duration: 150,
  },
  {
    id: 'soundless_word',
    chapter: 'Soundless Word',
    description: "Creator's Hum - The stillness between",
    audio: {
      base: 64,
      overlay: 963,
    },
    visual: {
      type: 'void_wavefront',
      geometry: 'void',
      description: 'Stillness with subtle ripples',
    },
    breath: {
      pattern: 'suspension of breath',
      bpm: 3,
    },
    duration: 90,
  },
  {
    id: 'temple_light',
    chapter: 'Temple of Light',
    description: 'Body as sacred geometry',
    audio: {
      stack: [256, 384, 512],
    },
    visual: {
      type: 'pyramid_pulse',
      geometry: 'pyramid',
      description: 'Golden pyramid with ascending light',
    },
    breath: {
      pattern: 'building breath',
      bpm: 6,
    },
    duration: 180,
  },
  {
    id: 'mirror_isis',
    chapter: 'Mirror of Isis',
    description: 'Reflection and clarity',
    audio: {
      base: 888,
      overlay: 432,
    },
    visual: {
      type: 'vesica_piscis',
      geometry: 'vesica piscis',
      description: 'Intersecting spheres of divine union',
    },
    breath: {
      pattern: 'balanced breath',
      bpm: 6,
    },
    duration: 150,
  },
  {
    id: 'crown_osiris',
    chapter: 'Crown of Osiris',
    description: 'Resurrection and ascension',
    audio: {
      sweep: [128, 256, 384, 512, 768],
      interval: 'phi',
    },
    visual: {
      type: 'spiral_crown',
      geometry: 'spiral crown',
      description: 'Rising vortex culminating in radiant crown',
    },
    breath: {
      pattern: 'rising breath',
      bpm: 8,
    },
    duration: 200,
  },
  {
    id: 'ladder_thoth',
    chapter: 'Ladder of Thoth',
    description: 'Ascension through the spheres',
    audio: {
      steps: [256, 288, 320, 360, 400],
    },
    visual: {
      type: 'golden_ladder',
      geometry: 'ladder',
      description: 'Ascending golden rungs to infinity',
    },
    breath: {
      pattern: 'step breath',
      bpm: 5,
    },
    duration: 150,
  },
  {
    id: 'scales_maat',
    chapter: 'Scales of Ma\'at',
    description: 'Divine balance and truth',
    audio: {
      tones: [432, 444],
      beat: 12,
    },
    visual: {
      type: 'feather_scale',
      geometry: 'scales',
      description: 'Feather and heart finding equilibrium',
    },
    breath: {
      pattern: 'equalizing breath',
      bpm: 6,
    },
    duration: 120,
  },
  {
    id: 'throne_horus',
    chapter: 'Throne of Horus',
    description: 'Vision and divine sight',
    audio: {
      base: 720,
      binaural: 40,
    },
    visual: {
      type: 'eye_of_horus',
      geometry: 'eye',
      description: 'Eye of Horus opening with gamma activation',
    },
    breath: {
      pattern: 'focused breath',
      bpm: 6,
    },
    duration: 180,
  },
  {
    id: 'solar_body_ra',
    chapter: 'Solar Body of Ra',
    description: 'Radiance and light body activation',
    audio: {
      stack: [256, 512, 1024],
    },
    visual: {
      type: 'aura_sphere',
      geometry: 'sphere',
      description: 'Expanding golden aura of light',
    },
    breath: {
      pattern: 'expansive breath',
      bpm: 6,
    },
    duration: 200,
  },
  {
    id: 'solar_boat',
    chapter: 'Solar Boat',
    description: 'Navigation through the cosmic sea',
    audio: {
      base: 333,
      wave: 0.2,
    },
    visual: {
      type: 'solar_boat',
      geometry: 'boat',
      description: 'Golden vessel sailing star-sea',
    },
    breath: {
      pattern: 'wave breath',
      bpm: 5,
    },
    duration: 180,
  },
  {
    id: 'mirror_return',
    chapter: 'Mirror Return',
    description: 'Completion and integration',
    audio: {
      base: 999,
      underlay: 256,
    },
    visual: {
      type: 'completion_circle',
      geometry: 'circle',
      description: 'All geometries merging into unity',
    },
    breath: {
      pattern: 'integration breath',
      bpm: 6,
    },
    duration: 240,
  },
];

export function getTotalDuration(): number {
  return EGYPTIAN_CODE_CHAPTERS.reduce((sum, chapter) => sum + chapter.duration, 0);
}

export function getChapterById(id: string): EgyptianChapter | undefined {
  return EGYPTIAN_CODE_CHAPTERS.find(chapter => chapter.id === id);
}

export function getChapterIndex(id: string): number {
  return EGYPTIAN_CODE_CHAPTERS.findIndex(chapter => chapter.id === id);
}

export function getNextChapter(currentId: string): EgyptianChapter | null {
  const currentIndex = getChapterIndex(currentId);
  if (currentIndex === -1 || currentIndex >= EGYPTIAN_CODE_CHAPTERS.length - 1) {
    return null;
  }
  return EGYPTIAN_CODE_CHAPTERS[currentIndex + 1];
}

export function getPreviousChapter(currentId: string): EgyptianChapter | null {
  const currentIndex = getChapterIndex(currentId);
  if (currentIndex <= 0) {
    return null;
  }
  return EGYPTIAN_CODE_CHAPTERS[currentIndex - 1];
}

export const PHI = 1.618033988749;

export function generatePhiIntervals(baseFreq: number, count: number): number[] {
  const intervals: number[] = [baseFreq];
  for (let i = 1; i < count; i++) {
    intervals.push(baseFreq * Math.pow(PHI, i / 2));
  }
  return intervals;
}

export function generateHarmonicStack(baseFreq: number, harmonics: number): number[] {
  return Array.from({ length: harmonics }, (_, i) => baseFreq * (i + 1));
}
