import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts, KeyboardShortcutsConfig, KeyboardShortcutsActions } from './useKeyboardShortcuts';

function createMockActions(): KeyboardShortcutsActions {
  return {
    play: jest.fn(),
    pause: jest.fn(),
    step: jest.fn(),
    undo: jest.fn(),
    redo: jest.fn(),
    onClear: jest.fn(),
    onSave: jest.fn(),
  };
}

function createDefaultConfig(overrides: Partial<KeyboardShortcutsConfig> = {}): KeyboardShortcutsConfig {
  return {
    isPlaying: false,
    conclusionReason: null,
    canUndo: true,
    canRedo: true,
    isModalOpen: false,
    ...overrides,
  };
}

function dispatchKeyDown(key: string, options: Partial<KeyboardEventInit> = {}) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, ...options });
  window.dispatchEvent(event);
}

describe('useKeyboardShortcuts', () => {
  describe('Space key (play/pause toggle)', () => {
    test('calls play when not playing', () => {
      const actions = createMockActions();
      const config = createDefaultConfig({ isPlaying: false });

      renderHook(() => useKeyboardShortcuts(config, actions));
      dispatchKeyDown(' ');

      expect(actions.play).toHaveBeenCalledTimes(1);
      expect(actions.pause).not.toHaveBeenCalled();
    });

    test('calls pause when playing', () => {
      const actions = createMockActions();
      const config = createDefaultConfig({ isPlaying: true });

      renderHook(() => useKeyboardShortcuts(config, actions));
      dispatchKeyDown(' ');

      expect(actions.pause).toHaveBeenCalledTimes(1);
      expect(actions.play).not.toHaveBeenCalled();
    });

    test('does nothing when concluded and not playing', () => {
      const actions = createMockActions();
      const config = createDefaultConfig({ isPlaying: false, conclusionReason: 'extinct' });

      renderHook(() => useKeyboardShortcuts(config, actions));
      dispatchKeyDown(' ');

      expect(actions.play).not.toHaveBeenCalled();
      expect(actions.pause).not.toHaveBeenCalled();
    });

    test('allows pause when concluded but still playing', () => {
      const actions = createMockActions();
      const config = createDefaultConfig({ isPlaying: true, conclusionReason: 'stable' });

      renderHook(() => useKeyboardShortcuts(config, actions));
      dispatchKeyDown(' ');

      expect(actions.pause).toHaveBeenCalledTimes(1);
    });
  });

  describe('ArrowRight key (step)', () => {
    test('calls step when not playing and no conclusion', () => {
      const actions = createMockActions();
      const config = createDefaultConfig({ isPlaying: false, conclusionReason: null });

      renderHook(() => useKeyboardShortcuts(config, actions));
      dispatchKeyDown('ArrowRight');

      expect(actions.step).toHaveBeenCalledTimes(1);
    });

    test('does not call step when playing', () => {
      const actions = createMockActions();
      const config = createDefaultConfig({ isPlaying: true });

      renderHook(() => useKeyboardShortcuts(config, actions));
      dispatchKeyDown('ArrowRight');

      expect(actions.step).not.toHaveBeenCalled();
    });

    test('does not call step when concluded', () => {
      const actions = createMockActions();
      const config = createDefaultConfig({ conclusionReason: 'limit' });

      renderHook(() => useKeyboardShortcuts(config, actions));
      dispatchKeyDown('ArrowRight');

      expect(actions.step).not.toHaveBeenCalled();
    });
  });

  describe('ArrowLeft key (undo)', () => {
    test('calls undo when canUndo is true', () => {
      const actions = createMockActions();
      const config = createDefaultConfig({ canUndo: true });

      renderHook(() => useKeyboardShortcuts(config, actions));
      dispatchKeyDown('ArrowLeft');

      expect(actions.undo).toHaveBeenCalledTimes(1);
    });

    test('does not call undo when canUndo is false', () => {
      const actions = createMockActions();
      const config = createDefaultConfig({ canUndo: false });

      renderHook(() => useKeyboardShortcuts(config, actions));
      dispatchKeyDown('ArrowLeft');

      expect(actions.undo).not.toHaveBeenCalled();
    });
  });

  describe('ArrowUp key (redo)', () => {
    test('calls redo when canRedo is true', () => {
      const actions = createMockActions();
      const config = createDefaultConfig({ canRedo: true });

      renderHook(() => useKeyboardShortcuts(config, actions));
      dispatchKeyDown('ArrowUp');

      expect(actions.redo).toHaveBeenCalledTimes(1);
    });

    test('does not call redo when canRedo is false', () => {
      const actions = createMockActions();
      const config = createDefaultConfig({ canRedo: false });

      renderHook(() => useKeyboardShortcuts(config, actions));
      dispatchKeyDown('ArrowUp');

      expect(actions.redo).not.toHaveBeenCalled();
    });
  });

  describe('Escape key (pause)', () => {
    test('calls pause', () => {
      const actions = createMockActions();
      const config = createDefaultConfig();

      renderHook(() => useKeyboardShortcuts(config, actions));
      dispatchKeyDown('Escape');

      expect(actions.pause).toHaveBeenCalledTimes(1);
    });
  });

  describe('C key (clear)', () => {
    test('calls onClear for lowercase c', () => {
      const actions = createMockActions();
      const config = createDefaultConfig();

      renderHook(() => useKeyboardShortcuts(config, actions));
      dispatchKeyDown('c');

      expect(actions.onClear).toHaveBeenCalledTimes(1);
    });

    test('calls onClear for uppercase C', () => {
      const actions = createMockActions();
      const config = createDefaultConfig();

      renderHook(() => useKeyboardShortcuts(config, actions));
      dispatchKeyDown('C');

      expect(actions.onClear).toHaveBeenCalledTimes(1);
    });

    test('does not call onClear when Ctrl is pressed', () => {
      const actions = createMockActions();
      const config = createDefaultConfig();

      renderHook(() => useKeyboardShortcuts(config, actions));
      dispatchKeyDown('c', { ctrlKey: true });

      expect(actions.onClear).not.toHaveBeenCalled();
    });

    test('does not call onClear when Meta is pressed', () => {
      const actions = createMockActions();
      const config = createDefaultConfig();

      renderHook(() => useKeyboardShortcuts(config, actions));
      dispatchKeyDown('c', { metaKey: true });

      expect(actions.onClear).not.toHaveBeenCalled();
    });
  });

  describe('S key (save)', () => {
    test('calls onSave with Ctrl+S', () => {
      const actions = createMockActions();
      const config = createDefaultConfig();

      renderHook(() => useKeyboardShortcuts(config, actions));
      dispatchKeyDown('s', { ctrlKey: true });

      expect(actions.onSave).toHaveBeenCalledTimes(1);
    });

    test('calls onSave with Cmd+S (Meta)', () => {
      const actions = createMockActions();
      const config = createDefaultConfig();

      renderHook(() => useKeyboardShortcuts(config, actions));
      dispatchKeyDown('s', { metaKey: true });

      expect(actions.onSave).toHaveBeenCalledTimes(1);
    });

    test('does not call onSave without modifier', () => {
      const actions = createMockActions();
      const config = createDefaultConfig();

      renderHook(() => useKeyboardShortcuts(config, actions));
      dispatchKeyDown('s');

      expect(actions.onSave).not.toHaveBeenCalled();
    });
  });

  describe('modal open state', () => {
    test('ignores all shortcuts when modal is open', () => {
      const actions = createMockActions();
      const config = createDefaultConfig({ isModalOpen: true });

      renderHook(() => useKeyboardShortcuts(config, actions));

      dispatchKeyDown(' ');
      dispatchKeyDown('ArrowRight');
      dispatchKeyDown('ArrowLeft');
      dispatchKeyDown('ArrowUp');
      dispatchKeyDown('Escape');
      dispatchKeyDown('c');
      dispatchKeyDown('s', { ctrlKey: true });

      expect(actions.play).not.toHaveBeenCalled();
      expect(actions.pause).not.toHaveBeenCalled();
      expect(actions.step).not.toHaveBeenCalled();
      expect(actions.undo).not.toHaveBeenCalled();
      expect(actions.redo).not.toHaveBeenCalled();
      expect(actions.onClear).not.toHaveBeenCalled();
      expect(actions.onSave).not.toHaveBeenCalled();
    });
  });

  describe('input element focus', () => {
    test('ignores shortcuts when input element is focused', () => {
      const actions = createMockActions();
      const config = createDefaultConfig();

      renderHook(() => useKeyboardShortcuts(config, actions));

      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
      Object.defineProperty(event, 'target', { value: input });
      window.dispatchEvent(event);

      expect(actions.play).not.toHaveBeenCalled();

      document.body.removeChild(input);
    });

    test('ignores shortcuts when textarea element is focused', () => {
      const actions = createMockActions();
      const config = createDefaultConfig();

      renderHook(() => useKeyboardShortcuts(config, actions));

      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);
      textarea.focus();

      const event = new KeyboardEvent('keydown', { key: 'c', bubbles: true });
      Object.defineProperty(event, 'target', { value: textarea });
      window.dispatchEvent(event);

      expect(actions.onClear).not.toHaveBeenCalled();

      document.body.removeChild(textarea);
    });
  });

  describe('cleanup', () => {
    test('removes event listener on unmount', () => {
      const actions = createMockActions();
      const config = createDefaultConfig();

      const { unmount } = renderHook(() => useKeyboardShortcuts(config, actions));

      unmount();
      dispatchKeyDown(' ');

      expect(actions.play).not.toHaveBeenCalled();
    });
  });
});

