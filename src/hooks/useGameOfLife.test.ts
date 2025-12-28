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

    test('starts with initial grid in history', () => {
      const { result } = renderHook(() => useGameOfLife({ rows: 3, cols: 3 }));
      // History starts with one entry: the initial empty grid
      expect(result.current.history.length).toBe(1);
      expect(result.current.history[0]).toEqual(result.current.grid);
    });

    test('starts with conclusionReason as null', () => {
      const { result } = renderHook(() => useGameOfLife());
      expect(result.current.conclusionReason).toBe(null);
    });

    test('starts with canUndo false', () => {
      const { result } = renderHook(() => useGameOfLife());
      expect(result.current.canUndo).toBe(false);
    });

    test('starts with canRedo false', () => {
      const { result } = renderHook(() => useGameOfLife());
      expect(result.current.canRedo).toBe(false);
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

    test('resets history to contain only imported grid', () => {
      const { result } = renderHook(() => useGameOfLife({ rows: 3, cols: 3 }));

      act(() => {
        result.current.step();
      });

      const newGrid = [[true]];
      act(() => {
        result.current.importGrid(newGrid);
      });

      expect(result.current.history.length).toBe(1);
      expect(result.current.history[0]).toEqual(newGrid);
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

    test('clears conclusionReason', () => {
      const { result } = renderHook(() => useGameOfLife({ rows: 2, cols: 2 }));

      // Create a pattern that will go extinct
      act(() => {
        result.current.toggleCell(0, 0);
        result.current.step(); // Single cell dies
      });

      expect(result.current.conclusionReason).toBe('extinct');

      act(() => {
        result.current.importGrid([[true, true], [true, true]]);
      });

      expect(result.current.conclusionReason).toBe(null);
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

    test('resets history to single empty grid', () => {
      const { result } = renderHook(() => useGameOfLife({ rows: 3, cols: 3 }));

      act(() => {
        result.current.step();
      });

      act(() => {
        result.current.clear();
      });

      expect(result.current.history.length).toBe(1);
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

    test('adds next generation to history', () => {
      const { result } = renderHook(() => useGameOfLife({ rows: 2, cols: 2 }));

      act(() => {
        result.current.toggleCell(0, 0);
      });

      const historyLengthBefore = result.current.history.length;

      act(() => {
        result.current.step();
      });

      expect(result.current.history.length).toBe(historyLengthBefore + 1);
    });

    test('does nothing when conclusionReason is set', () => {
      const { result } = renderHook(() => useGameOfLife({ rows: 2, cols: 2 }));

      // Create extinction
      act(() => {
        result.current.toggleCell(0, 0);
        result.current.step();
      });

      expect(result.current.conclusionReason).toBe('extinct');
      const genBefore = result.current.generationIndex;

      act(() => {
        result.current.step();
      });

      expect(result.current.generationIndex).toBe(genBefore);
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

    test('sets canRedo to true after undo', () => {
      const { result } = renderHook(() => useGameOfLife({ rows: 2, cols: 2 }));

      act(() => {
        result.current.step();
        result.current.undo();
      });

      expect(result.current.canRedo).toBe(true);
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

  describe('conclusion detection', () => {
    test('detects extinction when all cells die', () => {
      const { result } = renderHook(() => useGameOfLife({ rows: 3, cols: 3 }));

      // Single cell will die (no neighbors)
      act(() => {
        result.current.toggleCell(1, 1);
        result.current.step();
      });

      expect(result.current.conclusionReason).toBe('extinct');
      expect(result.current.isPlaying).toBe(false);
    });

    test('detects stable pattern when grid does not change', () => {
      const { result } = renderHook(() => useGameOfLife({ rows: 4, cols: 4 }));

      // Create a 2x2 block (stable pattern)
      act(() => {
        result.current.toggleCell(1, 1);
        result.current.toggleCell(1, 2);
        result.current.toggleCell(2, 1);
        result.current.toggleCell(2, 2);
        result.current.step();
      });

      expect(result.current.conclusionReason).toBe('stable');
      expect(result.current.isPlaying).toBe(false);
    });

    test('detects generation limit reached', () => {
      const { result } = renderHook(() => useGameOfLife({ rows: 5, cols: 5, maxGenerations: 2 }));

      // Create a blinker pattern (oscillates forever without hitting stable/extinct)
      act(() => {
        result.current.toggleCell(2, 1);
        result.current.toggleCell(2, 2);
        result.current.toggleCell(2, 3);
      });

      // Step until limit (maxGenerations: 2 means stop at gen 2)
      act(() => {
        result.current.step(); // gen 1
      });
      expect(result.current.conclusionReason).toBe(null);
      
      act(() => {
        result.current.step(); // gen 2 - should hit limit
      });

      expect(result.current.conclusionReason).toBe('limit');
      expect(result.current.isPlaying).toBe(false);
    });

    test('dismissConclusion clears the conclusion', () => {
      const { result } = renderHook(() => useGameOfLife({ rows: 2, cols: 2 }));

      act(() => {
        result.current.toggleCell(0, 0);
        result.current.step();
      });

      expect(result.current.conclusionReason).toBe('extinct');

      act(() => {
        result.current.dismissConclusion();
      });

      expect(result.current.conclusionReason).toBe(null);
    });
  });

  describe('setMaxGenerations', () => {
    test('updates maxGenerations value', () => {
      const { result } = renderHook(() => useGameOfLife());

      act(() => {
        result.current.setMaxGenerations(500);
      });

      expect(result.current.maxGenerations).toBe(500);
    });
  });
});
