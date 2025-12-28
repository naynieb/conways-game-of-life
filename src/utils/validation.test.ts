import {
  validateGridImport,
  validateGridDimensions,
  validateGridJson,
} from './validation';
import { GRID_CONFIG } from '../config/gameConfig';

describe('validateGridImport', () => {
  test('accepts valid boolean 2D array', () => {
    const data = [
      [true, false],
      [false, true],
    ];
    const result = validateGridImport(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(data);
    }
  });

  test('accepts numeric 0/1 array and converts to booleans', () => {
    const data = [
      [1, 0],
      [0, 1],
    ];
    const result = validateGridImport(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual([
        [true, false],
        [false, true],
      ]);
    }
  });

  test('rejects non-array input', () => {
    const result = validateGridImport('not an array');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('expected a 2D array');
    }
  });

  test('rejects empty array', () => {
    const result = validateGridImport([]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('cannot be empty');
    }
  });

  test('rejects array with empty rows', () => {
    const result = validateGridImport([[]]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('row 0 cannot be empty');
    }
  });

  test('rejects non-array rows', () => {
    const result = validateGridImport([true, false]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('row 0 is not an array');
    }
  });

  test('rejects inconsistent row lengths', () => {
    const data = [
      [true, false, true],
      [true, false],
    ];
    const result = validateGridImport(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('inconsistent row lengths');
    }
  });

  test('rejects grid exceeding max rows', () => {
    const rows = Array(GRID_CONFIG.maxRows + 1).fill([true]);
    const result = validateGridImport(rows);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain(`maximum ${GRID_CONFIG.maxRows} rows`);
    }
  });

  test('rejects grid exceeding max columns', () => {
    const row = Array(GRID_CONFIG.maxCols + 1).fill(true);
    const result = validateGridImport([row]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain(`maximum ${GRID_CONFIG.maxCols} columns`);
    }
  });

  test('accepts grid at max dimensions', () => {
    const row = Array(GRID_CONFIG.maxCols).fill(false);
    const grid = Array(GRID_CONFIG.maxRows).fill(null).map(() => [...row]);
    const result = validateGridImport(grid);
    expect(result.success).toBe(true);
  });

  test('handles mixed truthy/falsy values', () => {
    const data = [
      [1, 0, 'yes', '', null, undefined],
    ];
    const result = validateGridImport(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual([[true, false, true, false, false, false]]);
    }
  });
});

describe('validateGridDimensions', () => {
  test('accepts valid dimensions', () => {
    const result = validateGridDimensions(10, 20);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ rows: 10, cols: 20 });
    }
  });

  test('accepts minimum dimensions', () => {
    const result = validateGridDimensions(
      GRID_CONFIG.minDimension,
      GRID_CONFIG.minDimension
    );
    expect(result.success).toBe(true);
  });

  test('accepts maximum dimensions', () => {
    const result = validateGridDimensions(
      GRID_CONFIG.maxRows,
      GRID_CONFIG.maxCols
    );
    expect(result.success).toBe(true);
  });

  test('rejects non-integer rows', () => {
    const result = validateGridDimensions(5.5, 10);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('whole numbers');
    }
  });

  test('rejects non-integer columns', () => {
    const result = validateGridDimensions(10, 5.5);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('whole numbers');
    }
  });

  test('rejects rows below minimum', () => {
    const result = validateGridDimensions(0, 10);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('at least');
    }
  });

  test('rejects columns below minimum', () => {
    const result = validateGridDimensions(10, 0);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('at least');
    }
  });

  test('rejects rows above maximum', () => {
    const result = validateGridDimensions(GRID_CONFIG.maxRows + 1, 10);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain(`Maximum ${GRID_CONFIG.maxRows} rows`);
    }
  });

  test('rejects columns above maximum', () => {
    const result = validateGridDimensions(10, GRID_CONFIG.maxCols + 1);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain(`Maximum ${GRID_CONFIG.maxCols} columns`);
    }
  });
});

describe('validateGridJson', () => {
  test('parses and validates valid JSON', () => {
    const json = JSON.stringify([
      [true, false],
      [false, true],
    ]);
    const result = validateGridJson(json);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual([
        [true, false],
        [false, true],
      ]);
    }
  });

  test('rejects invalid JSON syntax', () => {
    const result = validateGridJson('not valid json');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Invalid JSON');
    }
  });

  test('rejects valid JSON that is not a valid grid', () => {
    const json = JSON.stringify({ not: 'an array' });
    const result = validateGridJson(json);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('expected a 2D array');
    }
  });

  test('handles numeric JSON grid', () => {
    const json = JSON.stringify([
      [1, 0, 1],
      [0, 1, 0],
    ]);
    const result = validateGridJson(json);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual([
        [true, false, true],
        [false, true, false],
      ]);
    }
  });
});
