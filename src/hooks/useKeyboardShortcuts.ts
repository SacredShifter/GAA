import { useEffect } from 'react';

export interface KeyboardShortcuts {
  onTogglePlay?: () => void;
  onIncreaseFrequency?: () => void;
  onDecreaseFrequency?: () => void;
  onIncreaseIntensity?: () => void;
  onDecreaseIntensity?: () => void;
  onNextGeometry?: () => void;
  onPreviousGeometry?: () => void;
  onSavePreset?: () => void;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcuts) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case ' ':
          event.preventDefault();
          shortcuts.onTogglePlay?.();
          break;
        case 'arrowup':
          event.preventDefault();
          shortcuts.onIncreaseFrequency?.();
          break;
        case 'arrowdown':
          event.preventDefault();
          shortcuts.onDecreaseFrequency?.();
          break;
        case 'arrowright':
          event.preventDefault();
          shortcuts.onIncreaseIntensity?.();
          break;
        case 'arrowleft':
          event.preventDefault();
          shortcuts.onDecreaseIntensity?.();
          break;
        case 'g':
          event.preventDefault();
          shortcuts.onNextGeometry?.();
          break;
        case 'shift+g':
          if (event.shiftKey) {
            event.preventDefault();
            shortcuts.onPreviousGeometry?.();
          }
          break;
        case 's':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            shortcuts.onSavePreset?.();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};
