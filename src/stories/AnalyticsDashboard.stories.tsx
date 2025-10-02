import type { Meta, StoryObj } from '@storybook/react';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';

const meta = {
  title: 'Components/AnalyticsDashboard',
  component: AnalyticsDashboard,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AnalyticsDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DarkTheme: Story = {
  args: {
    userId: 'demo-user-123',
    theme: 'dark',
  },
};

export const LightTheme: Story = {
  args: {
    userId: 'demo-user-123',
    theme: 'light',
  },
};
