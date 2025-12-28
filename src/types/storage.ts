import type { Grid } from './game';

export interface SavedBoard {
  /** Unique identifier (UUID v4) */
  id: string;
  /** User-provided or auto-generated name */
  name: string;
  /** The 2D boolean grid representing cell states */
  grid: Grid;
  /** Unix timestamp when the board was first saved */
  createdAt: number;
  /** Unix timestamp when the board was last updated */
  updatedAt: number;
}

export type SaveBoardInput = Pick<SavedBoard, 'name' | 'grid'>;

export type UpdateBoardInput = Partial<Pick<SavedBoard, 'name' | 'grid'>>;

export interface BoardStorage {
  /**
   * Save a new board.
   * @param board - The board data (name and grid)
   * @returns The saved board with generated id and timestamps
   */
  save(board: SaveBoardInput): Promise<SavedBoard>;

  /**
   * Load a board by ID.
   * @param id - The board's unique identifier
   * @returns The board if found, null otherwise
   */
  load(id: string): Promise<SavedBoard | null>;

  /**
   * List all saved boards.
   * @returns Array of all saved boards, sorted by updatedAt descending
   */
  list(): Promise<SavedBoard[]>;

  /**
   * Delete a board by ID.
   * @param id - The board's unique identifier
   */
  delete(id: string): Promise<void>;

  /**
   * Update an existing board.
   * @param id - The board's unique identifier
   * @param updates - Fields to update (name and/or grid)
   * @returns The updated board
   * @throws Error if board not found
   */
  update(id: string, updates: UpdateBoardInput): Promise<SavedBoard>;
}

/**
 * Storage configuration constants.
 */
export const STORAGE_CONFIG = {
  dbName: 'conways-game-of-life',
  dbVersion: 1,
  storeName: 'boards',
  localStorageKey: 'conways-boards',
} as const;
