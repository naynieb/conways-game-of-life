import { renderHook, act } from '@testing-library/react';
import { useGameOfLife } from './useGameOfLife';

describe('useGameOfLife', () => {
  describe('initialization', () => {
    test('creates grid with correct dimensions', () => {
      const { result } = renderHook(() => useGameOfLife({ rows: 5, cols: 10 }));
      expect(result.current.grid.length).toBe(5);
      expect(result.current.grid[0].length).toBe(10);
    });

    test('initializes with all dead cells', () => {
      const { result } = renderHook(() => useGameOfLife({ rows: 3, cols: 3 }));
      for (const row of result.current.grid) {
        for (const cell of row) {
          expect(cell).toBe(false);
        }
      }
    });

    test('starts at generation 0', () => {
      const { result } = renderHook(() => useGameOfLife());
      expect(result.current.generationIndex).toBe(0);
    });

    test('starts with isPlaying false', () => {
      const { result } = renderHook(() => useGameOfLife());
      expect(result.current.isPlaying).toBe(false);
    });

    test('starts with empty history', () => {
      const { result } = renderHook(() => useGameOfLife());
      expect(result.current.history).toEqual([]);
    });
  });

  describe('toggleCell', () => {
    test('toggles cell from dead to alive', () => {
      const { result } = renderHook(() => useGameOfLife({ rows: 3, cols: 3 }));

      act(() => {
        result.current.toggleCell(1, 1);
      });

      expect(result.current.grid[1][1]).toBe(true);
    });

    test('toggles cell from alive to dead', () => {
      const { result } = renderHook(() => useGameOfLife({ rows: 3, cols: 3 }));

      act(() => {
        result.current.toggleCell(0, 0);
      });
      expect(result.current.grid[0][0]).toBe(true);

      act(() => {
        result.current.toggleCell(0, 0);
      });
      expect(result.current.grid[0][0]).toBe(false);
    });
  });

  describe('importGrid', () => {
    test('replaces grid with imported grid', () => {
      const { result } = renderHook(() => useGameOfLife({ rows: 3, cols: 3 }));

      const newGrid = [
        [true, false],
        [false, true],
      ];

      act(() => {
        result.current.importGrid(newGrid);
      });

      expect(result.current.grid).toEqual(newGrid);
    });

    test('resets generation index to 0', () => {
      const { result } = renderHook(() => useGameOfLife({ rows: 3, cols: 3 }));

      // First step to increase generation
      act(() => {
        result.current.step();
      });
      expect(result.current.generationIndex).toBe(1);

      // Import should reset
      act(() => {
        result.current.importGrid([[true]]);
      });
      expect(result.current.generationIndex).toBe(0);
    });

    test('clears history', () => {
      const { result } = renderHook(() => useGameOfLife({ rows: 3, cols: 3 }));

      act(() => {
        result.current.step();
      });

      act(() => {
        result.current.importGrid([[true]]);
      });

      expect(result.current.history).toEqual([]);
    });

    test('sets isPlaying to false', () => {
      const { result } = renderHook(() => useGameOfLife({ rows: 3, cols: 3 }));

      act(() => {
        result.current.play();
      });
      expect(result.current.isPlaying).toBe(true);

      act(() => {
        result.current.importGrid([[true]]);
      });
      expect(result.current.isPlaying).toBe(false);
    });
  });

  describe('clear', () => {
    test('resets grid to all dead cells', () => {
      const { result } = renderHook(() => useGameOfLife({ rows: 3, cols: 3 }));

      act(() => {
        result.current.toggleCell(0, 0);
        result.current.toggleCell(1, 1);
      });

      act(() => {
        result.current.clear();
      });

      for (const row of result.current.grid) {
        for (const cell of row) {
          expect(cell).toBe(false);
        }
      }
    });

    test('resets generation index to 0', () => {
      const { result } = renderHook(() => useGameOfLife({ rows: 3, cols: 3 }));

      act(() => {
        result.current.step();
      });

      act(() => {
        result.current.clear();
      });

      expect(result.current.generationIndex).toBe(0);
    });

    test('clears history', () => {
      const { result } = renderHook(() => useGameOfLife({ rows: 3, cols: 3 }));

      act(() => {
        result.current.step();
      });

      act(() => {
        result.current.clear();
      });

      expect(result.current.history).toEqual([]);
    });

    test('sets isPlaying to false', () => {
      const { result } = renderHook(() => useGameOfLife({ rows: 3, cols: 3 }));

      act(() => {
        result.current.play();
      });

      act(() => {
        result.current.clear();
      });

      expect(result.current.isPlaying).toBe(false);
    });
  });

  describe('step', () => {
    test('increments generation index', () => {
      const { result } = renderHook(() => useGameOfLife({ rows: 3, cols: 3 }));

      act(() => {
        result.current.step();
      });

      expect(result.current.generationIndex).toBe(1);
    });

    test('adds current grid to history', () => {
      const { result } = renderHook(() => useGameOfLife({ rows: 2, cols: 2 }));

      act(() => {
        result.current.toggleCell(0, 0);
      });

      const gridBeforeStep = result.current.grid.map(row => [...row]);

      act(() => {
        result.current.step();
      });

      expect(result.current.history[0]).toEqual(gridBeforeStep);
    });
  });

  describe('undo', () => {
    test('goes back to previous generation', () => {
      const { result } = renderHook(() => useGameOfLife({ rows: 2, cols: 2 }));

      act(() => {
        result.current.toggleCell(0, 0);
      });

      const gridBeforeStep = result.current.grid.map(row => [...row]);

      act(() => {
        result.current.step();
      });

      act(() => {
        result.current.undo();
      });

      expect(result.current.generationIndex).toBe(0);
      expect(result.current.grid).toEqual(gridBeforeStep);
    });

    test('does nothing when at generation 0', () => {
      const { result } = renderHook(() => useGameOfLife({ rows: 2, cols: 2 }));

      act(() => {
        result.current.undo();
      });

      expect(result.current.generationIndex).toBe(0);
    });
  });

  describe('redo', () => {
    test('goes forward after undo', () => {
      const { result } = renderHook(() => useGameOfLife({ rows: 2, cols: 2 }));

      act(() => {
        result.current.toggleCell(0, 0);
      });

      act(() => {
        result.current.step();
      });

      act(() => {
        result.current.undo();
      });

      expect(result.current.generationIndex).toBe(0);

      act(() => {
        result.current.redo();
      });

      expect(result.current.generationIndex).toBe(1);
    });

    test('does nothing when no future history', () => {
      const { result } = renderHook(() => useGameOfLife({ rows: 2, cols: 2 }));

      act(() => {
        result.current.redo();
      });

      expect(result.current.generationIndex).toBe(0);
    });
  });

  describe('play/pause', () => {
    test('play sets isPlaying to true', () => {
      const { result } = renderHook(() => useGameOfLife());

      act(() => {
        result.current.play();
      });

      expect(result.current.isPlaying).toBe(true);
    });

    test('pause sets isPlaying to false', () => {
      const { result } = renderHook(() => useGameOfLife());

      act(() => {
        result.current.play();
      });

      act(() => {
        result.current.pause();
      });

      expect(result.current.isPlaying).toBe(false);
    });
  });
});

