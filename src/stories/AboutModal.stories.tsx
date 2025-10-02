import type { Meta, StoryObj } from '@storybook/react';
import { AboutModal } from '../components/AboutModal';

const meta = {
  title: 'Components/AboutModal',
  component: AboutModal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AboutModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MissionTab: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Close modal'),
    theme: 'dark',
  },
};

export const UsageTab: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Close modal'),
    theme: 'dark',
  },
  play: async ({ canvasElement }) => {
    const usageButton = canvasElement.querySelector('button:nth-of-type(2)') as HTMLButtonElement;
    if (usageButton) {
      usageButton.click();
    }
  },
};

export const TipsTab: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Close modal'),
    theme: 'dark',
  },
  play: async ({ canvasElement }) => {
    const tipsButton = canvasElement.querySelector('button:nth-of-type(3)') as HTMLButtonElement;
    if (tipsButton) {
      tipsButton.click();
    }
  },
};

export const LightTheme: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Close modal'),
    theme: 'light',
  },
};
