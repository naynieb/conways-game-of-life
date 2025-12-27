import { useState, useCallback } from 'react';
import type { Grid, GameConfig, UseGameOfLife } from '../types/game';
import { createEmptyGrid, cloneGrid } from '../types/game';

const DEFAULT_CONFIG: GameConfig = {
  rows: 30,
  cols: 50,
  intervalMs: 100,
};

/**
 * Provides grid state, history for time-travel, and all game actions.
 */
export function useGameOfLife(config: Partial<GameConfig> = {}): UseGameOfLife {
  const { rows, cols } = { ...DEFAULT_CONFIG, ...config };

  const [grid, setGrid] = useState<Grid>(() => createEmptyGrid(rows, cols));
  const [history, setHistory] = useState<Grid[]>([]);
  const [generationIndex, setGenerationIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleCell = useCallback((row: number, col: number) => {
    setGrid(prevGrid => {
      const newGrid = cloneGrid(prevGrid);
      newGrid[row][col] = !newGrid[row][col];
      return newGrid;
    });
  }, []);

  const importGrid = useCallback((newGrid: Grid) => {
    setGrid(newGrid);
    setHistory([]);
    setGenerationIndex(0);
    setIsPlaying(false);
  }, []);

  /**
   * Clear the entire grid.
   */
  const clear = useCallback(() => {
    setGrid(createEmptyGrid(rows, cols));
    setHistory([]);
    setGenerationIndex(0);
    setIsPlaying(false);
  }, [rows, cols]);

  /**
   * Advance one generation
   */
  const step = useCallback(() => {
    setGrid(prevGrid => {
      setHistory(prev => [...prev.slice(0, generationIndex + 1), prevGrid]);
      setGenerationIndex(prev => prev + 1);

      // TODO: Implement Conway's Game of Life rules here
      // For now, just return the same grid
      return prevGrid;
    });
  }, [generationIndex]);

  /**
   * Go back one generation.
   */
  const undo = useCallback(() => {
    if (generationIndex > 0 && history.length > 0) {
      const prevIndex = generationIndex - 1;
      setGenerationIndex(prevIndex);
      setGrid(history[prevIndex]);
    }
  }, [generationIndex, history]);

  /**
   * Go forward one generation (if previously undone).
   */
  const redo = useCallback(() => {
    if (generationIndex < history.length) {
      setGrid(history[generationIndex]);
      setGenerationIndex(prev => prev + 1);
    }
  }, [generationIndex, history]);

  /**
   * Start auto-playing generations.
   * TODO: Implement interval logic here
   */
  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  /**
   * Pause auto-play.
   */
  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  return {
    grid,
    history,
    generationIndex,
    isPlaying,

    toggleCell,
    importGrid,
    clear,
    step,
    undo,
    redo,
    play,
    pause,
  };
}

