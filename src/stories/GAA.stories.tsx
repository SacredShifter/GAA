import type { Meta, StoryObj } from '@storybook/react';
import { GAA } from '../components/GAA';

const meta = {
  title: 'Components/GAA',
  component: GAA,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof GAA>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    theme: 'dark',
    showControls: true,
    enableSync: false,
  },
};

export const LightTheme: Story = {
  args: {
    theme: 'light',
    showControls: true,
    enableSync: false,
  },
};

export const WithSync: Story = {
  args: {
    theme: 'dark',
    showControls: true,
    enableSync: true,
    userId: 'demo-user-123',
    circleId: 'demo-circle-456',
  },
};

export const CustomConfig: Story = {
  args: {
    theme: 'dark',
    showControls: true,
    enableSync: false,
    initialConfig: {
      frequency: 432,
      intensity: 0.7,
      waveType: 'sine',
      pulseSpeed: 1.5,
      geometryMode: 'sacredGeometry',
    },
  },
};

export const NoControls: Story = {
  args: {
    theme: 'dark',
    showControls: false,
    enableSync: false,
  },
};
