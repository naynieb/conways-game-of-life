import type { Grid } from '../types/game';
import { GRID_CONFIG } from '../config/gameConfig';

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Check if data is a non-empty array.
 */
function validateIsNonEmptyArray(data: unknown): ValidationResult<unknown[]> {
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

  return { success: true, data };
}

/**
 * Check if row count is within configured limits.
 */
function validateRowCount(rows: unknown[]): ValidationResult<void> {
  if (rows.length > GRID_CONFIG.maxRows) {
    return {
      success: false,
      error: `Grid too large: maximum ${GRID_CONFIG.maxRows} rows allowed, got ${rows.length}`,
    };
  }

  return { success: true, data: undefined };
}

/**
 * Validate a single row structure: must be a non-empty array with consistent column count.
 */
function validateRow(
  row: unknown,
  rowIndex: number,
  expectedCols: number | null
): ValidationResult<{ cols: number }> {
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

  if (expectedCols !== null && row.length !== expectedCols) {
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

  return { success: true, data: { cols: row.length } };
}

/**
 * Convert an array of values to booleans.
 * Accepts booleans, numbers (0/1), or any truthy/falsy values.
 */
function convertRowToBooleans(row: unknown[]): boolean[] {
  return row.map((cell) => {
    if (typeof cell === 'boolean') {
      return cell;
    }
    if (typeof cell === 'number') {
      return cell !== 0;
    }
    return Boolean(cell);
  });
}

/**
 * Validates that a value is a valid 2D boolean grid.
 * Accepts arrays of booleans or numbers (0/1) and converts to booleans.
 * 
 * @param data - Unknown data to validate
 * @returns ValidationResult with the validated Grid or an error message
 */
export function validateGridImport(data: unknown): ValidationResult<Grid> {
  const arrayResult = validateIsNonEmptyArray(data);
  if (!arrayResult.success) {
    return arrayResult;
  }

  const rows = arrayResult.data;
  const rowCountResult = validateRowCount(rows);
  if (!rowCountResult.success) {
    return rowCountResult;
  }

  const grid: Grid = [];
  let expectedCols: number | null = null;

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const rowResult = validateRow(rows[rowIndex], rowIndex, expectedCols);
    if (!rowResult.success) {
      return rowResult;
    }
    expectedCols = rowResult.data.cols;
    grid.push(convertRowToBooleans(rows[rowIndex] as unknown[]));
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
