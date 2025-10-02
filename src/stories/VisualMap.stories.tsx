import type { Meta, StoryObj } from '@storybook/react';
import { VisualMap } from '../components/VisualMap';
import type { SyncSession } from '../hooks/useSync';

const mockSessions: SyncSession[] = [
  {
    id: '1',
    user_id: 'user-1',
    circle_id: 'circle-1',
    frequency: 432,
    intensity: 0.7,
    wave_type: 'sine',
    pulse_speed: 1,
    geometry_mode: 'waves',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'user-2',
    circle_id: 'circle-1',
    frequency: 528,
    intensity: 0.8,
    wave_type: 'triangle',
    pulse_speed: 1.2,
    geometry_mode: 'lattice',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: 'user-3',
    frequency: 639,
    intensity: 0.6,
    wave_type: 'square',
    pulse_speed: 0.9,
    geometry_mode: 'sacredGeometry',
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

const manySessions: SyncSession[] = Array.from({ length: 10 }, (_, i) => ({
  id: `session-${i}`,
  user_id: `user-${i}`,
  circle_id: 'circle-1',
  frequency: 200 + i * 100,
  intensity: 0.5 + (i % 5) * 0.1,
  wave_type: ['sine', 'triangle', 'square', 'sawtooth'][i % 4],
  pulse_speed: 0.8 + (i % 3) * 0.3,
  geometry_mode: ['waves', 'lattice', 'sacredGeometry', 'particles'][i % 4],
  is_active: true,
  created_at: new Date().toISOString(),
}));

const meta = {
  title: 'Components/VisualMap',
  component: VisualMap,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof VisualMap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GlobeMode: Story = {
  args: {
    sessions: mockSessions,
    mode: 'globe',
    theme: 'dark',
  },
};

export const LatticeMode: Story = {
  args: {
    sessions: mockSessions,
    mode: 'lattice',
    theme: 'dark',
  },
};

export const LightTheme: Story = {
  args: {
    sessions: mockSessions,
    mode: 'globe',
    theme: 'light',
  },
};

export const ManySessions: Story = {
  args: {
    sessions: manySessions,
    mode: 'globe',
    theme: 'dark',
  },
};

export const ButterflySwarm: Story = {
  args: {
    sessions: manySessions,
    mode: 'lattice',
    theme: 'dark',
  },
};
