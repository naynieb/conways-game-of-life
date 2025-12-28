import { useRef, useEffect, useCallback } from 'react';
import { useGameOfLife } from '../hooks/useGameOfLife';
import { Grid } from './Grid';
import { ToastContainer } from './Toast';
import { useToast } from '../hooks/useToast';
import { validateGridJson } from '../utils/validation';
import { GRID_CONFIG } from '../config/gameConfig';

export function GameBoard() {
  const {
    grid,
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
  } = useGameOfLife({ rows: 25, cols: 40 });

  const { toasts, dismissToast, showSuccess, showError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Handle file import with validation.
   */
  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = validateGridJson(e.target?.result as string);

      if (!result.success) {
        showError(result.error);
        return;
      }

      importGrid(result.data);
      showSuccess(`Pattern imported: ${result.data.length}×${result.data[0]?.length ?? 0} grid`);
    };

    reader.onerror = () => {
      showError('Failed to read the file. Please try again.');
    };

    reader.readAsText(file);

    // Reset input to allow re-importing the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [importGrid, showSuccess, showError]);

  /**
   * Handle keyboard shortcuts.
   * TODO: extract keyboard handling into separate hook
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key) {
        case ' ':
          event.preventDefault();
          if (conclusionReason && !isPlaying) return;
          if (isPlaying) {
            pause();
          } else {
            play();
          }
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (!isPlaying && !conclusionReason) step();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          if (canUndo) undo();
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (canRedo) redo();
          break;
        case 'Escape':
          event.preventDefault();
          pause();
          break;
        case 'c':
        case 'C':
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            clear();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, conclusionReason, canUndo, canRedo, play, pause, step, undo, redo, clear]);

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-6 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-zinc-100 tracking-tight mb-1">
          Conway's Game of Life
        </h1>
        <p className="text-zinc-500 text-sm">
          Click cells to toggle • Space to play/pause • Arrows to navigate
        </p>
      </div>

      <Grid grid={grid} toggleCell={toggleCell} />

      <div className="flex items-center gap-3">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 
                     rounded-lg border border-zinc-700 transition-colors
                     text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          title="Undo (go back one generation) [←]"
          aria-label="Undo"
        >
          ◀◀
        </button>

        <button
          onClick={step}
          disabled={isPlaying || !!conclusionReason}
          className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 
                     rounded-lg border border-zinc-700 transition-colors
                     text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          title="Step (advance one generation) [→]"
          aria-label="Step forward"
        >
          ▶|
        </button>

        <button
          onClick={isPlaying ? pause : play}
          disabled={!!conclusionReason && !isPlaying}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white 
                     rounded-lg border border-emerald-500 transition-colors
                     text-sm font-medium min-w-[80px] disabled:opacity-40 disabled:cursor-not-allowed"
          title={isPlaying ? 'Pause [Space]' : 'Play [Space]'}
          aria-label={isPlaying ? 'Pause simulation' : 'Play simulation'}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>

        <button
          onClick={redo}
          disabled={!canRedo}
          className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 
                     rounded-lg border border-zinc-700 transition-colors
                     text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          title="Redo (go forward one generation) [↑]"
          aria-label="Redo"
        >
          ▶▶
        </button>

        <div className="w-px h-6 bg-zinc-700" aria-hidden="true" />

        <button
          onClick={clear}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 
                     rounded-lg border border-zinc-700 transition-colors
                     text-sm font-medium"
          title="Clear grid [C]"
          aria-label="Clear grid"
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
            aria-label="Import pattern from JSON file"
          />
        </label>

        <div className="w-px h-6 bg-zinc-700" aria-hidden="true" />
        
        <div className="text-zinc-400 text-sm font-mono" aria-live="polite" aria-atomic="true">
          Generation: <span className="text-emerald-400">{generationIndex}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label htmlFor="max-generations" className="text-zinc-400 text-sm">
          Max Generations:
        </label>
        <input
          id="max-generations"
          type="range"
          min={100}
          max={5000}
          step={100}
          value={maxGenerations}
          onChange={(e) => setMaxGenerations(Number(e.target.value))}
          className="w-48 accent-emerald-500"
          aria-valuemin={100}
          aria-valuemax={5000}
          aria-valuenow={maxGenerations}
        />
        <span className="text-zinc-300 text-sm font-mono w-12" aria-hidden="true">
          {maxGenerations}
        </span>
      </div>

      <p className="text-zinc-600 text-xs">
        Grid: {grid.length}×{grid[0]?.length ?? 0} • Max import: {GRID_CONFIG.maxRows}×{GRID_CONFIG.maxCols}
      </p>

      {conclusionReason && (
        <div 
          className="flex items-center gap-4 px-4 py-3 bg-amber-900/30 border border-amber-700/50 rounded-lg"
          role="alert"
        >
          <span className="text-amber-200 text-sm">
            {conclusionReason === 'extinct' && '💀 All cells died (extinction).'}
            {conclusionReason === 'stable' && '🔒 Pattern became stable (no changes).'}
            {conclusionReason === 'limit' && `⚠️ Reached max generations limit (${maxGenerations}).`}
          </span>
          <button
            onClick={() => {
              dismissConclusion();
              clear();
            }}
            className="px-3 py-1 bg-amber-700 hover:bg-amber-600 text-white 
                       rounded text-sm font-medium transition-colors"
          >
            Reset
          </button>
        </div>
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
