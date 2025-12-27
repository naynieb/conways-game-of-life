/**
 * A 2D grid representing cell states.
 * true = alive, false = dead
 */
export type Grid = boolean[][];

export interface GameState {
  grid: Grid;
  history: Grid[];
  generationIndex: number;
  isPlaying: boolean;
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
}

export type UseGameOfLife = GameState & GameActions;

export interface GameConfig {
  rows: number;
  cols: number;
  intervalMs?: number;
}

export function createEmptyGrid(rows: number, cols: number): Grid {
  return Array.from({ length: rows }, () => Array(cols).fill(false));
}

export function cloneGrid(grid: Grid): Grid {
  return grid.map(row => [...row]);
}
