import type { Meta, StoryObj } from '@storybook/react';
import { EnhancedVisualsV2 } from '../components/EnhancedVisualsV2';

const mockGetSpectrumData = () => ({
  frequencyData: new Uint8Array(1024).fill(128),
  averageEnergy: 0.5,
  peakFrequency: 440,
  bassEnergy: 0.6,
  midEnergy: 0.5,
  trebleEnergy: 0.4,
});

const meta = {
  title: 'Components/EnhancedVisualsV2',
  component: EnhancedVisualsV2,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    quality: {
      control: 'select',
      options: ['low', 'medium', 'high', 'ultra'],
    },
    geometryMode: {
      control: 'select',
      options: ['waves', 'lattice', 'sacredGeometry', 'particles', 'dome', 'fractal', 'nebula'],
    },
  },
} satisfies Meta<typeof EnhancedVisualsV2>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FractalLowQuality: Story = {
  args: {
    frequency: 432,
    intensity: 0.7,
    pulseSpeed: 1,
    isPlaying: true,
    geometryMode: 'fractal',
    getSpectrumData: mockGetSpectrumData,
    quality: 'low',
    adaptiveQuality: false,
  },
};

export const FractalHighQuality: Story = {
  args: {
    frequency: 528,
    intensity: 0.8,
    pulseSpeed: 1.2,
    isPlaying: true,
    geometryMode: 'fractal',
    getSpectrumData: mockGetSpectrumData,
    quality: 'high',
    adaptiveQuality: false,
  },
};

export const FractalUltraQuality: Story = {
  args: {
    frequency: 639,
    intensity: 0.9,
    pulseSpeed: 1.5,
    isPlaying: true,
    geometryMode: 'fractal',
    getSpectrumData: mockGetSpectrumData,
    quality: 'ultra',
    adaptiveQuality: false,
  },
};

export const NebulaLowQuality: Story = {
  args: {
    frequency: 432,
    intensity: 0.7,
    pulseSpeed: 1,
    isPlaying: true,
    geometryMode: 'nebula',
    getSpectrumData: mockGetSpectrumData,
    quality: 'low',
    adaptiveQuality: false,
  },
};

export const NebulaMediumQuality: Story = {
  args: {
    frequency: 528,
    intensity: 0.8,
    pulseSpeed: 1.2,
    isPlaying: true,
    geometryMode: 'nebula',
    getSpectrumData: mockGetSpectrumData,
    quality: 'medium',
    adaptiveQuality: false,
  },
};

export const NebulaHighQuality: Story = {
  args: {
    frequency: 639,
    intensity: 0.9,
    pulseSpeed: 1.5,
    isPlaying: true,
    geometryMode: 'nebula',
    getSpectrumData: mockGetSpectrumData,
    quality: 'high',
    adaptiveQuality: false,
  },
};

export const NebulaUltraQuality: Story = {
  args: {
    frequency: 741,
    intensity: 1.0,
    pulseSpeed: 2,
    isPlaying: true,
    geometryMode: 'nebula',
    getSpectrumData: mockGetSpectrumData,
    quality: 'ultra',
    adaptiveQuality: false,
  },
};

export const AdaptiveQuality: Story = {
  args: {
    frequency: 528,
    intensity: 0.8,
    pulseSpeed: 1.2,
    isPlaying: true,
    geometryMode: 'nebula',
    getSpectrumData: mockGetSpectrumData,
    adaptiveQuality: true,
  },
};

export const WithOrbitControls: Story = {
  args: {
    frequency: 432,
    intensity: 0.7,
    pulseSpeed: 1,
    isPlaying: true,
    geometryMode: 'fractal',
    getSpectrumData: mockGetSpectrumData,
    quality: 'high',
    adaptiveQuality: false,
    enableOrbitControls: true,
  },
};
