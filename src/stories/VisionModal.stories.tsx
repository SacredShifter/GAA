import type { Meta, StoryObj } from '@storybook/react';
import { VisionModal } from '../components/VisionModal';

const meta = {
  title: 'Components/VisionModal',
  component: VisionModal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof VisionModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DarkTheme: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Close modal'),
    theme: 'dark',
  },
};

export const LightTheme: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Close modal'),
    theme: 'light',
  },
};
