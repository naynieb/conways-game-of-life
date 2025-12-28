import {
  createEmptyGrid,
  cloneGrid,
  isGridEmpty,
  gridsEqual,
  countNeighbors,
  computeNextGeneration,
  Grid,
} from './game';

describe('createEmptyGrid', () => {
  test('creates grid with correct dimensions', () => {
    const grid = createEmptyGrid(5, 10);
    expect(grid.length).toBe(5);
    expect(grid[0].length).toBe(10);
  });

  test('creates grid with all false values', () => {
    const grid = createEmptyGrid(3, 4);
    for (const row of grid) {
      for (const cell of row) {
        expect(cell).toBe(false);
      }
    }
  });

  test('creates empty grid when dimensions are 0', () => {
    const grid = createEmptyGrid(0, 0);
    expect(grid.length).toBe(0);
  });

  test('creates grid with 1x1 dimensions', () => {
    const grid = createEmptyGrid(1, 1);
    expect(grid.length).toBe(1);
    expect(grid[0].length).toBe(1);
    expect(grid[0][0]).toBe(false);
  });
});

describe('cloneGrid', () => {
  test('creates a copy with same values', () => {
    const original = [
      [true, false, true],
      [false, true, false],
    ];
    const cloned = cloneGrid(original);
    expect(cloned).toEqual(original);
  });

  test('creates a deep copy that does not share references', () => {
    const original = [
      [true, false],
      [false, true],
    ];
    const cloned = cloneGrid(original);

    // Modify the clone
    cloned[0][0] = false;

    // Original should be unchanged
    expect(original[0][0]).toBe(true);
  });

  test('row arrays are not shared', () => {
    const original = [[true, false]];
    const cloned = cloneGrid(original);

    expect(cloned[0]).not.toBe(original[0]);
  });

  test('handles empty grid', () => {
    const original: Grid = [];
    const cloned = cloneGrid(original);
    expect(cloned).toEqual([]);
  });
});

describe('isGridEmpty', () => {
  test('returns true for all-dead grid', () => {
    const grid = createEmptyGrid(3, 3);
    expect(isGridEmpty(grid)).toBe(true);
  });

  test('returns false when at least one cell is alive', () => {
    const grid = createEmptyGrid(3, 3);
    grid[1][1] = true;
    expect(isGridEmpty(grid)).toBe(false);
  });

  test('returns true for empty grid (0x0)', () => {
    expect(isGridEmpty([])).toBe(true);
  });

  test('returns false with cell in corner', () => {
    const grid = createEmptyGrid(3, 3);
    grid[0][0] = true;
    expect(isGridEmpty(grid)).toBe(false);
  });
});

describe('gridsEqual', () => {
  test('returns true for identical grids', () => {
    const a = [
      [true, false],
      [false, true],
    ];
    const b = [
      [true, false],
      [false, true],
    ];
    expect(gridsEqual(a, b)).toBe(true);
  });

  test('returns false for different grids', () => {
    const a = [
      [true, false],
      [false, true],
    ];
    const b = [
      [true, true],
      [false, true],
    ];
    expect(gridsEqual(a, b)).toBe(false);
  });

  test('returns false for different row counts', () => {
    const a = [[true], [false]];
    const b = [[true]];
    expect(gridsEqual(a, b)).toBe(false);
  });

  test('returns false for different column counts', () => {
    const a = [[true, false]];
    const b = [[true]];
    expect(gridsEqual(a, b)).toBe(false);
  });

  test('returns true for two empty grids', () => {
    expect(gridsEqual([], [])).toBe(true);
  });
});

describe('countNeighbors', () => {
  test('counts neighbors for center cell', () => {
    // 3x3 grid with all alive except center
    const grid = [
      [true, true, true],
      [true, false, true],
      [true, true, true],
    ];
    expect(countNeighbors(grid, 1, 1)).toBe(8);
  });

  test('counts neighbors for corner cell (top-left)', () => {
    const grid = [
      [false, true, false],
      [true, true, false],
      [false, false, false],
    ];
    // Top-left corner has 3 neighbors: right, below, diagonal
    expect(countNeighbors(grid, 0, 0)).toBe(3);
  });

  test('counts neighbors for corner cell (bottom-right)', () => {
    const grid = [
      [false, false, false],
      [false, true, true],
      [false, true, false],
    ];
    // Bottom-right corner has 3 neighbors: left, above, diagonal
    expect(countNeighbors(grid, 2, 2)).toBe(3);
  });

  test('counts neighbors for edge cell (top edge)', () => {
    const grid = [
      [true, false, true],
      [true, true, true],
      [false, false, false],
    ];
    // Top middle has 5 neighbors (no cells above)
    expect(countNeighbors(grid, 0, 1)).toBe(5);
  });

  test('counts neighbors for edge cell (left edge)', () => {
    const grid = [
      [true, true, false],
      [false, true, false],
      [true, true, false],
    ];
    // Left middle has 5 neighbors (no cells to the left)
    expect(countNeighbors(grid, 1, 0)).toBe(5);
  });

  test('returns 0 for isolated cell', () => {
    const grid = [
      [false, false, false],
      [false, true, false],
      [false, false, false],
    ];
    expect(countNeighbors(grid, 1, 1)).toBe(0);
  });

  test('handles 1x1 grid', () => {
    const grid = [[true]];
    expect(countNeighbors(grid, 0, 0)).toBe(0);
  });

  test('handles 1xN grid', () => {
    const grid = [[true, true, true]];
    expect(countNeighbors(grid, 0, 1)).toBe(2); // left and right
    expect(countNeighbors(grid, 0, 0)).toBe(1); // only right
    expect(countNeighbors(grid, 0, 2)).toBe(1); // only left
  });

  test('handles Nx1 grid', () => {
    const grid = [[true], [true], [true]];
    expect(countNeighbors(grid, 1, 0)).toBe(2); // above and below
    expect(countNeighbors(grid, 0, 0)).toBe(1); // only below
    expect(countNeighbors(grid, 2, 0)).toBe(1); // only above
  });
});

describe('computeNextGeneration', () => {
  describe('Conway rules', () => {
    test('live cell with 0 neighbors dies (underpopulation)', () => {
      const grid = [
        [false, false, false],
        [false, true, false],
        [false, false, false],
      ];
      const next = computeNextGeneration(grid);
      expect(next[1][1]).toBe(false);
    });

    test('live cell with 1 neighbor dies (underpopulation)', () => {
      const grid = [
        [false, true, false],
        [false, true, false],
        [false, false, false],
      ];
      const next = computeNextGeneration(grid);
      expect(next[1][1]).toBe(false);
    });

    test('live cell with 2 neighbors survives', () => {
      const grid = [
        [true, true, false],
        [false, true, false],
        [false, false, false],
      ];
      const next = computeNextGeneration(grid);
      expect(next[1][1]).toBe(true);
    });

    test('live cell with 3 neighbors survives', () => {
      const grid = [
        [true, true, true],
        [false, true, false],
        [false, false, false],
      ];
      const next = computeNextGeneration(grid);
      expect(next[1][1]).toBe(true);
    });

    test('live cell with 4+ neighbors dies (overpopulation)', () => {
      const grid = [
        [true, true, true],
        [true, true, false],
        [false, false, false],
      ];
      const next = computeNextGeneration(grid);
      expect(next[1][1]).toBe(false);
    });

    test('dead cell with exactly 3 neighbors becomes alive (reproduction)', () => {
      const grid = [
        [true, true, true],
        [false, false, false],
        [false, false, false],
      ];
      const next = computeNextGeneration(grid);
      expect(next[1][1]).toBe(true);
    });

    test('dead cell with 2 neighbors stays dead', () => {
      const grid = [
        [true, true, false],
        [false, false, false],
        [false, false, false],
      ];
      const next = computeNextGeneration(grid);
      expect(next[1][1]).toBe(false);
    });

    test('dead cell with 4 neighbors stays dead', () => {
      const grid = [
        [true, true, true],
        [true, false, false],
        [false, false, false],
      ];
      const next = computeNextGeneration(grid);
      expect(next[1][1]).toBe(false);
    });
  });

  describe('known patterns', () => {
    test('block pattern is stable', () => {
      // Block: 2x2 square - should remain unchanged
      const grid = [
        [false, false, false, false],
        [false, true, true, false],
        [false, true, true, false],
        [false, false, false, false],
      ];
      const next = computeNextGeneration(grid);
      expect(next).toEqual(grid);
    });

    test('blinker pattern oscillates (period 2)', () => {
      // Horizontal blinker
      const horizontal = [
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, true, true, true, false],
        [false, false, false, false, false],
        [false, false, false, false, false],
      ];

      // Vertical blinker
      const vertical = [
        [false, false, false, false, false],
        [false, false, true, false, false],
        [false, false, true, false, false],
        [false, false, true, false, false],
        [false, false, false, false, false],
      ];

      const next1 = computeNextGeneration(horizontal);
      expect(next1).toEqual(vertical);

      const next2 = computeNextGeneration(vertical);
      expect(next2).toEqual(horizontal);
    });

    test('beehive pattern is stable', () => {
      const grid = [
        [false, false, false, false, false, false],
        [false, false, true, true, false, false],
        [false, true, false, false, true, false],
        [false, false, true, true, false, false],
        [false, false, false, false, false, false],
      ];
      const next = computeNextGeneration(grid);
      expect(next).toEqual(grid);
    });

    test('toad pattern oscillates', () => {
      const phase1 = [
        [false, false, false, false, false, false],
        [false, false, true, true, true, false],
        [false, true, true, true, false, false],
        [false, false, false, false, false, false],
      ];

      const phase2 = [
        [false, false, false, true, false, false],
        [false, true, false, false, true, false],
        [false, true, false, false, true, false],
        [false, false, true, false, false, false],
      ];

      const next = computeNextGeneration(phase1);
      expect(next).toEqual(phase2);
    });

    test('glider moves diagonally', () => {
      const phase1 = [
        [false, false, false, false, false],
        [false, false, true, false, false],
        [false, false, false, true, false],
        [false, true, true, true, false],
        [false, false, false, false, false],
      ];

      // After 4 generations, glider moves one cell diagonally
      let current = phase1;
      for (let i = 0; i < 4; i++) {
        current = computeNextGeneration(current);
      }

      // Glider should have moved down-right by one cell
      const expected = [
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, true, false],
        [false, false, false, false, true],
        [false, false, true, true, true],
      ];

      expect(current).toEqual(expected);
    });
  });

  describe('edge cases', () => {
    test('empty grid stays empty', () => {
      const grid = createEmptyGrid(5, 5);
      const next = computeNextGeneration(grid);
      expect(isGridEmpty(next)).toBe(true);
    });

    test('single cell dies', () => {
      const grid = [
        [false, false, false],
        [false, true, false],
        [false, false, false],
      ];
      const next = computeNextGeneration(grid);
      expect(isGridEmpty(next)).toBe(true);
    });

    test('handles 1x1 grid', () => {
      const grid = [[true]];
      const next = computeNextGeneration(grid);
      expect(next).toEqual([[false]]);
    });

    test('handles 2x2 grid with all alive', () => {
      const grid = [
        [true, true],
        [true, true],
      ];
      const next = computeNextGeneration(grid);
      expect(next).toEqual([
        [true, true],
        [true, true],
      ]);
    });

    test('preserves grid dimensions', () => {
      const grid = createEmptyGrid(7, 11);
      grid[3][5] = true;
      const next = computeNextGeneration(grid);
      expect(next.length).toBe(7);
      expect(next[0].length).toBe(11);
    });
  });
});
