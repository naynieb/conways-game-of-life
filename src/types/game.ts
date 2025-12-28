/**
 * All functions are pure and operate on immutable data structures.
 * The core algorithm runs in O(rows * cols) time complexity.
 * 
 * @see https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life
 */

/**
 * A 2D grid representing cell states.
 * true = alive, false = dead
 */
export type Grid = boolean[][];

export type ConclusionReason = 'extinct' | 'stable' | 'limit' | null;

export interface GameState {
  grid: Grid;
  history: Grid[];
  generationIndex: number;
  isPlaying: boolean;
  maxGenerations: number;
  conclusionReason: ConclusionReason;
  canUndo: boolean;
  canRedo: boolean;
}

export interface GameActions {
  toggleCell: (row: number, col: number) => void;
  /** Import a grid from a 2D boolean array */
  importGrid: (newGrid: Grid) => void;
  /** Clear the entire grid */
  clear: () => void;
  /** Advance one generation */
  step: () => void;
  /** Go back one generation */
  undo: () => void;
  /** Go forward one generation (if previously undone) */
  redo: () => void;
  /** Start auto-playing generations */
  play: () => void;
  /** Pause auto-play */
  pause: () => void;
  /** Set the maximum generations limit */
  setMaxGenerations: (max: number) => void;
  /** Dismiss the conclusion message */
  dismissConclusion: () => void;
}

export type UseGameOfLife = GameState & GameActions;

export interface GameConfig {
  rows: number;
  cols: number;
  intervalMs?: number;
  maxGenerations?: number;
}

export function createEmptyGrid(rows: number, cols: number): Grid {
  return Array.from({ length: rows }, () => Array(cols).fill(false));
}

export function cloneGrid(grid: Grid): Grid {
  return grid.map(row => [...row]);
}

/**
 * Check if all cells in the grid are dead (extinction).
 */
export function isGridEmpty(grid: Grid): boolean {
  return grid.every(row => row.every(cell => !cell));
}

/**
 * Check if two grids are identical (stable pattern detection).
 */
export function gridsEqual(a: Grid, b: Grid): boolean {
  if (a.length !== b.length) return false;

  for (let rowIndex = 0; rowIndex < a.length; rowIndex++) {
    const rowA = a[rowIndex];
    const rowB = b[rowIndex];

    if (rowA.length !== rowB.length) return false;

    for (let colIndex = 0; colIndex < rowA.length; colIndex++) {
      if (rowA[colIndex] !== rowB[colIndex]) return false;
    }
  }

  return true;
}

/**
 * Count live neighbors for a cell.
 * Cells at the edge have fewer neighbors (no wrapping).
 */
const NEIGHBOR_OFFSETS: Array<[dy: number, dx: number]> = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],          [0, 1],
  [1, -1], [1, 0],  [1, 1],
];

export function countNeighbors(grid: Grid, row: number, col: number): number {
  const rowCount = grid.length;
  const colCount = grid[0]?.length ?? 0;

  return NEIGHBOR_OFFSETS.reduce((count, [dy, dx]) => {
    const y = row + dy;
    const x = col + dx;

    const inBounds =
      y >= 0 && y < rowCount &&
      x >= 0 && x < colCount;

    return inBounds && grid[y][x] ? count + 1 : count;
  }, 0);
}

/**
 * Compute the next generation by applying Conway's Game of Life rules:
 * 1. Any live cell with fewer than two live neighbours dies (underpopulation)
 * 2. Any live cell with two or three live neighbours lives on
 * 3. Any live cell with more than three live neighbours dies (overpopulation)
 * 4. Any dead cell with exactly three live neighbours becomes alive (reproduction)
 */
export function computeNextGeneration(grid: Grid): Grid {
  const rowCount = grid.length;
  const colCount = grid[0]?.length ?? 0;

  const next = createEmptyGrid(rowCount, colCount);

  for (let row = 0; row < rowCount; row++) {
    for (let col = 0; col < colCount; col++) {
      const isAlive = grid[row][col];
      const neighborCount = countNeighbors(grid, row, col);

      if (isAlive) {
        // Live cell survives only with 2 or 3 neighbors
        next[row][col] = neighborCount === 2 || neighborCount === 3;
      } else {
        // Dead cell becomes live with exactly 3 neighbors
        next[row][col] = neighborCount === 3;
      }
    }
  }

  return next;
}
