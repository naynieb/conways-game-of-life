/**
 * useGameOfLife - Core state management hook for Conway's Game of Life.
 * 
 * This hook encapsulates all game logic including:
 * - Grid state and history management
 * - Generation stepping and auto-play
 * - Time-travel (undo/redo) functionality
 * - Conclusion detection (extinction, stable patterns, generation limits)
 * 
 * @example
 * ```tsx
 * const { grid, isPlaying, play, pause, step, toggleCell } = useGameOfLife({
 *   rows: 25,
 *   cols: 40,
 *   intervalMs: 100,
 * });
 * ```
 */

import { useState, useCallback, useEffect } from "react";
import type { Grid, GameConfig, UseGameOfLife, ConclusionReason } from "../types/game";
import {
  createEmptyGrid,
  cloneGrid,
  computeNextGeneration,
  isGridEmpty,
  gridsEqual,
} from "../types/game";
import { GRID_CONFIG, SIMULATION_CONFIG, LIMITS_CONFIG } from "../config/gameConfig";

const DEFAULT_CONFIG: Required<GameConfig> = {
  rows: GRID_CONFIG.defaultRows,
  cols: GRID_CONFIG.defaultCols,
  intervalMs: SIMULATION_CONFIG.defaultIntervalMs,
  maxGenerations: LIMITS_CONFIG.defaultMaxGenerations,
};

export function useGameOfLife(config: Partial<GameConfig> = {}): UseGameOfLife {
  const merged = { ...DEFAULT_CONFIG, ...config };
  const { rows, cols, intervalMs } = merged;

  // State
  const [history, setHistory] = useState<Grid[]>(() => [createEmptyGrid(rows, cols)]);
  const [generationIndex, setIndex] = useState(0);
  const [isPlaying, setPlaying] = useState(false);
  const [maxGenerations, setMax] = useState(merged.maxGenerations);
  const [conclusionReason, setConclusion] = useState<ConclusionReason>(null);

  const grid = history[generationIndex];

  // Derived State
  const canUndo = generationIndex > 0;
  const canRedo = generationIndex < history.length - 1;
  
  /**
   * Fully reset the session UI state.
   */
  const resetSession = useCallback(() => {
    setPlaying(false);
    setConclusion(null);
  }, []);

  /**
   * Trim history to prevent memory issues.
   * Keeps the most recent entries up to maxHistorySize.
   */
  const trimHistory = useCallback((hist: Grid[], currentIndex: number): { history: Grid[]; index: number } => {
    if (hist.length <= LIMITS_CONFIG.maxHistorySize) {
      return { history: hist, index: currentIndex };
    }

    // Calculate how many entries to remove from the beginning
    const excess = hist.length - LIMITS_CONFIG.maxHistorySize;
    const trimmedHistory = hist.slice(excess);
    const adjustedIndex = Math.max(0, currentIndex - excess);

    return { history: trimmedHistory, index: adjustedIndex };
  }, []);

  /**
   * Toggle a cell between alive and dead states.
   */
  const toggleCell = useCallback(
    (r: number, c: number) => {
      setHistory((prev) => {
        const current = prev[generationIndex];
        const next = cloneGrid(current);
        next[r][c] = !next[r][c];

        // Truncate future history when editing
        return [...prev.slice(0, generationIndex), next];
      });
    },
    [generationIndex]
  );

  /**
   * Import a new grid, replacing the current state.
   */
  const importGrid = useCallback((g: Grid) => {
    setHistory([g]);
    setIndex(0);
    resetSession();
  }, [resetSession]);

  /**
   * Clear the grid to all dead cells.
   */
  const clear = useCallback(() => {
    setHistory([createEmptyGrid(rows, cols)]);
    setIndex(0);
    resetSession();
  }, [rows, cols, resetSession]);

  /**
   * Advance to the next generation.
   * Detects conclusions: extinction, stable patterns, and generation limits.
   */
  const step = useCallback(() => {
    if (conclusionReason) return;

    setHistory((prev) => {
      const current = prev[generationIndex];
      const next = computeNextGeneration(current);
      const nextIndex = generationIndex + 1;

      const updated = [...prev.slice(0, generationIndex + 1), next];
      
      const { history: trimmedHistory, index: adjustedIndex } = trimHistory(updated, nextIndex);
      
      setIndex(adjustedIndex);

      // Detect conclusions
      if (isGridEmpty(next)) {
        setConclusion("extinct");
        setPlaying(false);
      } else if (gridsEqual(current, next)) {
        setConclusion("stable");
        setPlaying(false);
      } else if (nextIndex >= maxGenerations) {
        setConclusion("limit");
        setPlaying(false);
      }

      return trimmedHistory;
    });
  }, [generationIndex, conclusionReason, maxGenerations, trimHistory]);

  /**
   * Go back one generation in history.
   */
  const undo = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  /**
   * Go forward one generation in history.
   */
  const redo = useCallback(() => {
    setIndex((i) => Math.min(i + 1, history.length - 1));
  }, [history.length]);

  /**
   * Start auto-playing generations.
   */
  const play = useCallback(() => setPlaying(true), []);

  /**
   * Pause auto-play.
   */
  const pause = useCallback(() => setPlaying(false), []);

  /**
   * Update the maximum generations limit.
   */
  const setMaxGenerations = useCallback((max: number) => setMax(max), []);

  /**
   * Dismiss the conclusion message.
   */
  const dismissConclusion = useCallback(() => setConclusion(null), []);

  // Auto-play Effect
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(step, intervalMs);
    return () => clearInterval(id);
  }, [isPlaying, step, intervalMs]);

  return {
    grid,
    history,
    generationIndex,
    isPlaying,
    maxGenerations,
    conclusionReason,
    canUndo,
    canRedo,

    toggleCell,
    importGrid,
    clear,
    step,
    undo,
    redo,
    play,
    pause,
    setMaxGenerations,
    dismissConclusion,
  };
}
