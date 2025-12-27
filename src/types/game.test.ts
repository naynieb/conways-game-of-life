import { createEmptyGrid, cloneGrid } from './game';

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
});

