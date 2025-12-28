import type { Grid } from '../types/game';
import { GRID_CONFIG } from '../config/gameConfig';

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Validates that a value is a valid 2D boolean grid.
 * Accepts arrays of booleans or numbers (0/1) and converts to booleans.
 * 
 * @param data - Unknown data to validate
 * @returns ValidationResult with the validated Grid or an error message
 */
export function validateGridImport(data: unknown): ValidationResult<Grid> {
  // TODO: extract validation logic into separate functions
  if (!Array.isArray(data)) {
    return {
      success: false,
      error: 'Invalid format: expected a 2D array of values',
    };
  }

  if (data.length === 0) {
    return {
      success: false,
      error: 'Invalid format: grid cannot be empty',
    };
  }

  if (data.length > GRID_CONFIG.maxRows) {
    return {
      success: false,
      error: `Grid too large: maximum ${GRID_CONFIG.maxRows} rows allowed, got ${data.length}`,
    };
  }

  const grid: Grid = [];
  let expectedCols: number | null = null;

  for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
    const row = data[rowIndex];

    if (!Array.isArray(row)) {
      return {
        success: false,
        error: `Invalid format: row ${rowIndex} is not an array`,
      };
    }

    if (row.length === 0) {
      return {
        success: false,
        error: `Invalid format: row ${rowIndex} cannot be empty`,
      };
    }

    if (expectedCols === null) {
      expectedCols = row.length;
    } else if (row.length !== expectedCols) {
      return {
        success: false,
        error: `Invalid format: inconsistent row lengths (row 0 has ${expectedCols} columns, row ${rowIndex} has ${row.length})`,
      };
    }

    if (row.length > GRID_CONFIG.maxCols) {
      return {
        success: false,
        error: `Grid too large: maximum ${GRID_CONFIG.maxCols} columns allowed, got ${row.length}`,
      };
    }

    const boolRow: boolean[] = [];
    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const cell = row[colIndex];
      
      // Accept booleans, numbers (0/1), or truthy/falsy values
      if (typeof cell === 'boolean') {
        boolRow.push(cell);
      } else if (typeof cell === 'number') {
        boolRow.push(cell !== 0);
      } else {
        boolRow.push(Boolean(cell));
      }
    }

    grid.push(boolRow);
  }

  return { success: true, data: grid };
}

/**
 * Validates grid dimensions are within acceptable bounds.
 * 
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @returns ValidationResult indicating success or an error message
 */
export function validateGridDimensions(
  rows: number,
  cols: number
): ValidationResult<{ rows: number; cols: number }> {
  if (!Number.isInteger(rows) || !Number.isInteger(cols)) {
    return {
      success: false,
      error: 'Dimensions must be whole numbers',
    };
  }

  if (rows < GRID_CONFIG.minDimension || cols < GRID_CONFIG.minDimension) {
    return {
      success: false,
      error: `Dimensions must be at least ${GRID_CONFIG.minDimension}`,
    };
  }

  if (rows > GRID_CONFIG.maxRows) {
    return {
      success: false,
      error: `Maximum ${GRID_CONFIG.maxRows} rows allowed`,
    };
  }

  if (cols > GRID_CONFIG.maxCols) {
    return {
      success: false,
      error: `Maximum ${GRID_CONFIG.maxCols} columns allowed`,
    };
  }

  return { success: true, data: { rows, cols } };
}

/**
 * Validates that a JSON string can be parsed and contains a valid grid.
 * 
 * @param jsonString - Raw JSON string to parse and validate
 * @returns ValidationResult with the validated Grid or an error message
 */
export function validateGridJson(jsonString: string): ValidationResult<Grid> {
  let parsed: unknown;

  try {
    parsed = JSON.parse(jsonString);
  } catch {
    return {
      success: false,
      error: 'Invalid JSON: could not parse the file contents',
    };
  }

  return validateGridImport(parsed);
}
