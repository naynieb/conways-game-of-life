import { useCallback } from 'react';
import type { Grid as GridType } from '../types/game';
import { Cell } from './Cell';

interface GridProps {
  grid: GridType;
  toggleCell: (row: number, col: number) => void;
}

export function Grid({ grid, toggleCell }: GridProps) {
  const cols = grid[0]?.length ?? 0;

  const handleCellClick = useCallback(
    (row: number, col: number) => () => toggleCell(row, col),
    [toggleCell]
  );

  return (
    <div
      className="inline-grid gap-0 bg-zinc-950 p-2 rounded-lg border border-zinc-800 select-none"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1rem)`,
        // CSS containment for improved rendering performance
        contain: 'layout style paint',
      }}
      role="grid"
      aria-label="Game of Life grid"
      aria-rowcount={grid.length}
      aria-colcount={cols}
    >
      {grid.map((row, rowIndex) =>
        row.map((alive, colIndex) => (
          <Cell
            key={`${rowIndex}-${colIndex}`}
            alive={alive}
            onClick={handleCellClick(rowIndex, colIndex)}
          />
        ))
      )}
    </div>
  );
}
