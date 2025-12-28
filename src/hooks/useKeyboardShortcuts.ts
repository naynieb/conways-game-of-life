import { useEffect } from 'react';
import type { ConclusionReason } from '../types/game';

export interface KeyboardShortcutsConfig {
  isPlaying: boolean;
  conclusionReason: ConclusionReason;
  canUndo: boolean;
  canRedo: boolean;
  isModalOpen: boolean;
}

export interface KeyboardShortcutsActions {
  play: () => void;
  pause: () => void;
  step: () => void;
  undo: () => void;
  redo: () => void;
  onClear: () => void;
  onSave: () => void;
}

/**
 * Custom hook to handle keyboard shortcuts for the Game of Life.
 * 
 * Shortcuts:
 * - Space: Play/Pause toggle
 * - ArrowRight: Step forward (when paused)
 * - ArrowLeft: Undo
 * - ArrowUp: Redo
 * - Escape: Pause
 * - C: Clear grid
 * - Ctrl/Cmd+S: Save
 */
export function useKeyboardShortcuts(
  config: KeyboardShortcutsConfig,
  actions: KeyboardShortcutsActions
): void {
  const { isPlaying, conclusionReason, canUndo, canRedo, isModalOpen } = config;
  const { play, pause, step, undo, redo, onClear, onSave } = actions;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input or modal is open
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        isModalOpen
      ) {
        return;
      }

      switch (event.key) {
        case ' ':
          event.preventDefault();
          if (conclusionReason && !isPlaying) return;
          if (isPlaying) {
            pause();
          } else {
            play();
          }
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (!isPlaying && !conclusionReason) step();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          if (canUndo) undo();
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (canRedo) redo();
          break;
        case 'Escape':
          event.preventDefault();
          pause();
          break;
        case 'c':
        case 'C':
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            onClear();
          }
          break;
        case 's':
        case 'S':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            onSave();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, conclusionReason, canUndo, canRedo, isModalOpen, play, pause, step, undo, redo, onClear, onSave]);
}

