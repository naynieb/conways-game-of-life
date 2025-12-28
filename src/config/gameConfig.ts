/**
 * Centralized configuration for Conway's Game of Life.
 * 
 * This module contains all configurable constants used throughout the application.
 * Modifying values here will affect the entire application behavior.
 */

/**
 * Grid dimension constraints and defaults.
 */
export const GRID_CONFIG = {
  /** Default number of rows when not specified */
  defaultRows: 30,
  /** Default number of columns when not specified */
  defaultCols: 50,
  /** Maximum allowed rows (performance limit) */
  maxRows: 100,
  /** Maximum allowed columns (performance limit) */
  maxCols: 100,
  /** Minimum grid dimension */
  minDimension: 1,
} as const;

/**
 * Simulation timing configuration.
 */
export const SIMULATION_CONFIG = {
  /** Default interval between generations in milliseconds */
  defaultIntervalMs: 100,
  /** Minimum allowed interval (fastest speed) */
  minIntervalMs: 50,
  /** Maximum allowed interval (slowest speed) */
  maxIntervalMs: 1000,
} as const;

/**
 * Generation and history limits.
 */
export const LIMITS_CONFIG = {
  /** Default maximum generations before auto-stop */
  defaultMaxGenerations: 1000,
  /** Minimum configurable max generations */
  minMaxGenerations: 100,
  /** Maximum configurable max generations */
  maxMaxGenerations: 5000,
  /** Maximum history entries to retain (memory management) */
  maxHistorySize: 500,
} as const;

/**
 * UI-related configuration.
 */
export const UI_CONFIG = {
  /** Duration for toast notifications in milliseconds */
  toastDurationMs: 3000,
  /** Cell size in pixels (should match CSS) */
  cellSizePx: 16,
} as const;

export const GAME_CONFIG = {
  grid: GRID_CONFIG,
  simulation: SIMULATION_CONFIG,
  limits: LIMITS_CONFIG,
  ui: UI_CONFIG,
} as const;

export type GameConfigType = typeof GAME_CONFIG;
