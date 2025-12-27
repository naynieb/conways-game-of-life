import { useRef } from 'react';
import { useGameOfLife } from '../hooks/useGameOfLife';
import { Grid } from './Grid';
import type { Grid as GridType } from '../types/game';

export function GameBoard() {
  const {
    grid,
    generationIndex,
    toggleCell,
    importGrid,
    clear,
  } = useGameOfLife({ rows: 25, cols: 40 });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        
        // Validate it's a 2D array of booleans or numbers (0/1)
        if (!Array.isArray(parsed) || !parsed.every(row => Array.isArray(row))) {
          throw new Error('Invalid format: expected 2D array');
        }

        // Convert to boolean grid
        const newGrid: GridType = parsed.map(row =>
          row.map((cell: unknown) => Boolean(cell))
        );

        importGrid(newGrid);
      } catch (err) {
        console.error('Failed to parse grid file:', err);
        alert('Invalid grid file. Expected a JSON file with a 2D array of booleans or 0/1 values.');
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-zinc-100 tracking-tight mb-1">
          Conway's Game of Life
        </h1>
        <p className="text-zinc-500 text-sm">
          Click cells to toggle
        </p>
      </div>

      <Grid grid={grid} toggleCell={toggleCell} />

      <div className="flex items-center gap-4">
        <button
          onClick={clear}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 
                     rounded-lg border border-zinc-700 transition-colors
                     text-sm font-medium"
        >
          Clear
        </button>

        <label className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 
                          rounded-lg border border-zinc-700 transition-colors
                          text-sm font-medium cursor-pointer">
          Import
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>
        
        <div className="text-zinc-600 text-sm">
          Generation: {generationIndex}
        </div>
      </div>
    </div>
  );
}
